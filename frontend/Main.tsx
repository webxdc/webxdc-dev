import {
  Component,
  For,
  createSignal,
  Show,
  createMemo,
  Accessor,
  Setter,
  createEffect,
  JSX,
} from "solid-js";
import {
  Flex,
  Box,
  Table,
  Th,
  Tr,
  Td,
  Thead,
  Tbody,
  Text,
  Badge,
  Tooltip,
  IconButton,
  createDisclosure,
} from "@hope-ui/solid";
import {
  IoRefreshOutline,
  IoStop,
  IoPlay,
  IoCaretBackOutline,
  IoCaretForwardOutline,
} from "solid-icons/io";
import { FiExternalLink } from "solid-icons/fi";

import Filter from "./Filter";
import { instances, InstanceData, getMessages } from "./store";
import InstancesButtons from "./InstancesButtons";
import { Message } from "../types/message";
import MessageDetails from "./MessageDetails";
import { instanceIdEntries } from "./instanceIdEntries";
import { sent, received } from "./store";
import MessageRow from "./MessageRow";
import { scrollToLastMessage, scrollToDevice } from "./scroll";

type Search = {
  instanceId?: string;
  type?: string;
};

const Filters: Component<{
  value: Search;
  onChange: (search: Search) => void;
}> = (props) => {
  return (
    <Flex justifyContent="flex-start" gap="$5">
      <Filter
        label="instanceId"
        entries={instanceIdEntries()}
        value={props.value.instanceId || "*"}
        onChange={(value) => {
          if (value === "*") {
            props.onChange({
              ...props.value,
              instanceId: undefined,
            });
          } else {
            props.onChange({
              ...props.value,
              instanceId: value,
            });
          }
        }}
      />
      <Filter
        label="type"
        entries={[
          { value: "*", text: "All types" },
          { value: "sent", text: "Sent" },
          { value: "received", text: "Received" },
          { value: "clear", text: "Clear" },
        ]}
        value={props.value.type || "*"}
        onChange={(value) => {
          if (value === "*") {
            props.onChange({ ...props.value, type: undefined });
          } else {
            props.onChange({ ...props.value, type: value });
          }
        }}
      />
    </Flex>
  );
};

const Messages: Component<{
  search: Accessor<Search>;
  setSearch: Setter<Search>;
}> = (props) => {
  const [message, setMessage] = createSignal<Message | null>(null);
  const [messageIndex, setMessageIndex] = createSignal<number | null>(null);

  createEffect(() => {
    // whenever we get a new message, we should scroll to the last message
    getMessages(undefined, undefined).length;
    // we scroll to the last message
    scrollToLastMessage();
  });

  return (
    <Flex height="100%" flexDirection="column" justifyContent="space-between">
      <Box>
        <Filters value={props.search()} onChange={props.setSearch} />
        <Box width="55vw" maxHeight="36vh" overflow="scroll">
          <Table id="messages" dense css={{ "table-layout": "fixed" }}>
            <Thead>
              <Th width="10%" minWidth="7em">
                Id
              </Th>
              <Th width="10%">Type</Th>
              <Th width="20%">Descr</Th>
              <Th minWidth="60%">Payload</Th>
            </Thead>
            <Tbody>
              <For
                each={getMessages(
                  props.search().instanceId,
                  props.search().type
                )}
              >
                {(message, index) => (
                  <MessageRow
                    isSelected={messageIndex() === index()}
                    message={message}
                    onSelect={(message) => {
                      setMessageIndex(index());
                      setMessage(message);
                    }}
                  />
                )}
              </For>
            </Tbody>
          </Table>
        </Box>
      </Box>
      <Box>
        <Show when={message()}>
          {(message) => <MessageDetails message={message} />}
        </Show>
      </Box>
    </Flex>
  );
};

const StoppedFrame: Component<{
  instance: InstanceData;
  onStart: () => void;
}> = (props) => {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      style={{
        height: "667px",
        width: "375px",
        "border-color": props.instance.color,
        "border-width": "7px",
        "border-style": "solid",
      }}
    >
      <Tooltip label="Start">
        <IconButton
          size="xl"
          onClick={props.onStart}
          aria-label="Start"
          backgroundColor="lightgrey"
          icon={<IoPlay size={30} color="#000000" />}
        />
      </Tooltip>
    </Flex>
  );
};

const DeviceButton: Component<{
  label: string;
  onClick: () => void;
  icon: JSX.Element;
}> = (props) => {
  return (
    <Tooltip label={props.label}>
      <IconButton
        size="sm"
        compact
        onClick={props.onClick}
        aria-label={props.label}
        backgroundColor="lightgrey"
        icon={props.icon}
      />
    </Tooltip>
  );
};

const Device: Component<{
  instance: InstanceData;
  setSearch: (search: Search) => void;
}> = (props) => {
  const sentCount = createMemo(() => {
    return sent(props.instance.id);
  });

  const receivedCount = createMemo(() => {
    return received(props.instance.id);
  });

  let iframe_ref: HTMLIFrameElement | undefined = undefined;

  const handleReload = () => {
    if (iframe_ref == null) {
      return;
    }

    iframe_ref.contentWindow?.postMessage("reload", props.instance.url);
  };

  const handleOpenInTab = () => {
    window.open(props.instance.url, "_blank");
  };

  const { isOpen, onOpen, onClose } = createDisclosure({
    defaultIsOpen: false,
  });

  return (
    <Flex flexDirection="column">
      <Flex
        id={"device-" + props.instance.id}
        gap="$1"
        justifyContent="space-between"
        alignItems="center"
      >
        <Tooltip label="Click to see all messages for this device">
          <Text
            color={props.instance.color}
            fontSize="$2xl"
            fontWeight="bold"
            onClick={() => props.setSearch({ instanceId: props.instance.id })}
          >
            {props.instance.id}
          </Text>
        </Tooltip>
        <Tooltip label="Click to see all sent messages for this device">
          <Badge
            onClick={() =>
              props.setSearch({ instanceId: props.instance.id, type: "sent" })
            }
          >
            Sent: {sentCount}
          </Badge>
        </Tooltip>
        <Tooltip label="Click to see all received messages for this device">
          <Badge
            onClick={() =>
              props.setSearch({
                instanceId: props.instance.id,
                type: "received",
              })
            }
          >
            Received: {receivedCount}
          </Badge>
        </Tooltip>
        <Flex gap="$1">
          <DeviceButton
            label={`Open new browser tab for instance ${props.instance.id}`}
            onClick={handleOpenInTab}
            icon={<FiExternalLink size={22} color="#000000" />}
          />
          <Show
            when={isOpen()}
            fallback={
              <DeviceButton
                label="Start"
                onClick={onOpen}
                icon={<IoPlay size={22} color="#000000" />}
              />
            }
          >
            <DeviceButton
              label="Stop"
              onClick={onClose}
              icon={<IoStop size={22} color="#000000" />}
            />
          </Show>
          <DeviceButton
            label="Reload"
            onClick={handleReload}
            icon={<IoRefreshOutline size={22} color="#000000" />}
          />
        </Flex>
      </Flex>
      <Show
        when={isOpen()}
        fallback={<StoppedFrame instance={props.instance} onStart={onOpen} />}
      >
        <iframe
          ref={iframe_ref}
          src={props.instance.url}
          style={{
            height: "667px",
            width: "375px",
            "border-color": props.instance.color,
            "border-width": "7px",
            "border-style": "solid",
          }}
        ></iframe>
      </Show>
    </Flex>
  );
};

const Main: Component = () => {
  const [search, setSearch] = createSignal<Search>({
    type: "sent",
  });

  const setSearchAndOpen: Setter<Search> = (value) => {
    onOpen();
    return setSearch(value);
  };

  const { isOpen, onOpen, onClose } = createDisclosure({ defaultIsOpen: true });

  return (
    <>
      <Flex justifyContent="space-between">
        <Flex flexDirection="column">
          <Box m="$8" ml="$1">
            <Flex flexWrap="wrap" gap="$5" overflow="scroll" maxHeight="77vh">
              <For each={instances()}>
                {(instance: InstanceData) => (
                  <Device instance={instance} setSearch={setSearchAndOpen} />
                )}
              </For>
            </Flex>
          </Box>
          <InstancesButtons
            onAfterAdd={(instanceId) => {
              scrollToDevice(instanceId);
            }}
          />
        </Flex>
        <Box height="100wh">
          <Show
            when={isOpen()}
            fallback={
              <Tooltip label="Open messages">
                <IconButton
                  variant="ghost"
                  size="sm"
                  position="relative"
                  top="2rem"
                  right="-2rem"
                  onClick={onOpen}
                  aria-label="Open messages"
                  backgroundColor="white"
                  icon={<IoCaretBackOutline size={22} color="#000000" />}
                />
              </Tooltip>
            }
          >
            <Tooltip label="Close messages">
              <IconButton
                variant="ghost"
                size="sm"
                position="relative"
                top="2rem"
                right="2rem"
                onClick={onClose}
                aria-label="Close messages"
                backgroundColor="white"
                icon={<IoCaretForwardOutline size={22} color="#000000" />}
              />
            </Tooltip>
            <Messages search={search} setSearch={setSearchAndOpen} />
          </Show>
        </Box>
      </Flex>
    </>
  );
};

export default Main;
