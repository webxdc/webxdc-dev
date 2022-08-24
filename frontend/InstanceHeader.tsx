import { Component, Show, createMemo, JSX, Accessor } from "solid-js";
import { Flex, Text, Badge, Tooltip, IconButton } from "@hope-ui/solid";
import { IoRefreshOutline, IoStop, IoPlay } from "solid-icons/io";
import { FiExternalLink } from "solid-icons/fi";

import type { Instance as InstanceData } from "../types/instance";
import { sent, received } from "./store";
import { Search } from "./Sidebar";

const InstanceHeader: Component<{
  instance: InstanceData;
  setSearch: (search: Search) => void;
  onReload: () => void;
  onStart: () => void;
  onStop: () => void;
  isStarted: Accessor<boolean>;
}> = (props) => {
  const sentCount = createMemo(() => {
    return sent(props.instance.id);
  });

  const receivedCount = createMemo(() => {
    return received(props.instance.id);
  });

  const handleOpenInTab = () => {
    window.open(props.instance.url, "_blank");
  };

  return (
    <Flex gap="$1" justifyContent="space-between" alignItems="center">
      <Tooltip label="Click to see all messages for this instance">

        <Text
          cursor="pointer"
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
          cursor="pointer"
          onClick={() =>
            props.setSearch({ instanceId: props.instance.id, type: "sent" })
          }
        >
          Sent: {sentCount}
        </Badge>
      </Tooltip>
      <Tooltip label="Click to see all received messages for this instance">
        <Badge
          cursor="pointer"
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
          when={props.isStarted()}
          fallback={
            <InstanceButton
              label="Start"
              onClick={props.onStart}
              icon={<IoPlay size={22} color="#000000" />}
            />
          }
        >
          <InstanceButton
            label="Stop"
            onClick={props.onStop}
            icon={<IoStop size={22} color="#000000" />}
          />
        </Show>
        <InstanceButton
          label="Reload"
          onClick={props.onReload}
          disabled={!props.isStarted()}
          icon={<IoRefreshOutline size={22} color="#000000" />}
        />
      </Flex>
    </Flex>
  );
};

const InstanceButton: Component<{
  label: string;
  onClick: () => void;
  icon: JSX.Element;
  disabled?: boolean;
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
        disabled={props.disabled}
      />
    </Tooltip>
  );
};

export default InstanceHeader;
