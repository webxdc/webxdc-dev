import { Component, Show } from "solid-js";
import { Tr, Td, Text, Tooltip } from "@hope-ui/solid";

import TdTooltip from "./TdTooltip";
import TextDynamic from "./TextDynamic";
import { Message } from "../types/message";
import { scrollToInstance } from "./Instance";
import { isUpdateMessage } from "./store";

const ChatRow: Component<{
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
              onClick={() => scrollToInstance(props.message.instanceId)}
            >
              {props.message.instanceId}
            </Text>
          </Tooltip>
        </TextDynamic>
      </Td>
      <Show when={isUpdateMessage(props.message) && props.message}>
        {(message) => (
          <>
            <TdTooltip>{message.update.info}</TdTooltip>
          </>
        )}
      </Show>
    </Tr>
  );
};

export default ChatRow;
