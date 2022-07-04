import { Component, JSX } from "solid-js";
import { Tr, Td, Text, Tooltip } from "@hope-ui/solid";

import TextDynamic from "./TextDynamic";
import { Message } from "../types/message";
import { scrollToInstance } from "./Instance";

const SidebarRow: Component<{
  message: Message;
  isSelected: boolean;
  onSelect: (message: Message) => void;
  children: JSX.Element;
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
      {props.children}
    </Tr>
  );
};

export default SidebarRow;
