import { Component, Show, createMemo, JSX } from "solid-js";
import {
  Flex,
  Text,
  Badge,
  Tooltip,
  IconButton,
  createDisclosure,
} from "@hope-ui/solid";
import { IoRefreshOutline, IoStop, IoPlay } from "solid-icons/io";
import { FiExternalLink } from "solid-icons/fi";

import { InstanceData } from "./store";
import { sent, received } from "./store";
import { Search } from "./Messages";
import FrameStopped from "./FrameStopped";

const InstanceButton: Component<{
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

const Instance: Component<{
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
        id={"instance-" + props.instance.id}
        gap="$1"
        justifyContent="space-between"
        alignItems="center"
      >
        <Tooltip label="Click to see all messages for this instance">
          <Text
            color={props.instance.color}
            fontSize="$2xl"
            fontWeight="bold"
            onClick={() => props.setSearch({ instanceId: props.instance.id })}
          >
            {props.instance.id}
          </Text>
        </Tooltip>
        <Tooltip label="Click to see all sent messages for this instance">
          <Badge
            onClick={() =>
              props.setSearch({ instanceId: props.instance.id, type: "sent" })
            }
          >
            Sent: {sentCount}
          </Badge>
        </Tooltip>
        <Tooltip label="Click to see all received messages for this instance">
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
          <InstanceButton
            label={`Open new browser tab for instance ${props.instance.id}`}
            onClick={handleOpenInTab}
            icon={<FiExternalLink size={22} color="#000000" />}
          />
          <Show
            when={isOpen()}
            fallback={
              <InstanceButton
                label="Start"
                onClick={onOpen}
                icon={<IoPlay size={22} color="#000000" />}
              />
            }
          >
            <InstanceButton
              label="Stop"
              onClick={onClose}
              icon={<IoStop size={22} color="#000000" />}
            />
          </Show>
          <InstanceButton
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

export default Instance;
