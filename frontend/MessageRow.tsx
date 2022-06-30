import { Component, Show } from "solid-js";
import { Tr, Td, Text, Tooltip } from "@hope-ui/solid";

import TdTooltip from "./TdTooltip";
import TextDynamic from "./TextDynamic";
import { Message } from "../types/message";
import { scrollToDevice } from "./scroll";
import { isUpdateMessage } from "./store";

const MessageRow: Component<{
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

export default MessageRow;
