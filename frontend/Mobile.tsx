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

import TdTooltip from "./Messages";
import TextDynamic from "./TextDynamic";
import Filter from "./Filter";
import { instances, InstanceData, getMessages } from "./store";
import InstancesButtons from "./InstancesButtons";
import { Message, UpdateMessage } from "../types/message";
import RecordRow from "./RecordRow";
import { instanceIdEntries } from "./MessagesFilters";
import { sent, received } from "./store";

const MessageComponent: Component<{
  message: Message;
  isSelected: boolean;
  onSelect: (message: Message) => void;
}> = (props) => {
  return (
    <Tr
      onClick={() => {
        props.onSelect(props.message);
      }}
      bgColor={props.isSelected ? "$primary4" : undefined}
    >
      <Td>
        <TextDynamic>
          <Tooltip label="Click to scroll to device">
            <Text
              color={props.message.instanceColor}
              onClick={() => scrollToDevice(props.message.instanceId)}
            >
              {props.message.instanceId}
            </Text>
          </Tooltip>
        </TextDynamic>
      </Td>
      <TdTooltip>{props.message.type}</TdTooltip>
      <Show when={isUpdateMessage(props.message) && props.message}>
        {(message) => (
          <>
            <TdTooltip>{message.descr}</TdTooltip>
            <TdTooltip
              tooltip={
                <pre>
                  <code>{JSON.stringify(message.update.payload, null, 2)}</code>
                </pre>
              }
            >
              {JSON.stringify(message.update.payload)}
            </TdTooltip>
          </>
        )}
      </Show>
    </Tr>
  );
};

const MessageDetails: Component<{ message: Message }> = (props) => {
  return (
    <Table dense>
      <Tbody>
        <RecordRow label="instance id">
          <Text as="span" color={props.message.instanceColor}>
            {props.message.instanceId}
          </Text>
        </RecordRow>
        <RecordRow label="type">{props.message.type}</RecordRow>
        <Show when={isUpdateMessage(props.message) && props.message}>
          {(message) => {
            return (
              <>
                <RecordRow label="descr">{message.descr}</RecordRow>
                <RecordRow label="serial">{message.update.serial}</RecordRow>
                <Show when={message.type === "received"}>
                  <RecordRow label="max serial">
                    {message.update.max_serial}
                  </RecordRow>
                </Show>
                <RecordRow label="info">{message.update.info}</RecordRow>
                <RecordRow label="document">
                  {message.update.document}
                </RecordRow>
                <RecordRow label="summary">{message.update.summary}</RecordRow>
                <RecordRow label="payload">
                  <Box maxHeight="9rem" overflow="auto">
                    <pre>
                      <code>
                        {JSON.stringify(message.update.payload, null, 2)}
                      </code>
                    </pre>
                  </Box>
                </RecordRow>
              </>
            );
          }}
        </Show>
      </Tbody>
    </Table>
  );
};

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
                  <MessageComponent
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

const Mobile: Component = () => {
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

function isUpdateMessage(message: Message): message is UpdateMessage {
  return message.type === "sent" || message.type === "received";
}

const scrollToDevice = (instanceId: string) => {
  document.getElementById("device-" + instanceId)?.scrollIntoView();
};

const scrollToLastMessage = () => {
  document.querySelector("#messages > tbody > tr:last-child")?.scrollIntoView();
};

export default Mobile;
