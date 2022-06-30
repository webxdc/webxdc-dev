import {
  Component,
  For,
  createSignal,
  Show,
  createMemo,
  Setter,
  JSX,
} from "solid-js";
import {
  Flex,
  Box,
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

import { instances, InstanceData } from "./store";
import InstancesButtons from "./InstancesButtons";
import { sent, received } from "./store";
import { scrollToDevice } from "./scroll";
import Messages, { Search } from "./Messages";
import FrameStopped from "./FrameStopped";

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
        fallback={<FrameStopped instance={props.instance} onStart={onOpen} />}
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
