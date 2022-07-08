import { Component, Show } from "solid-js";
import { Badge } from "@hope-ui/solid";

import type { Message } from "../types/message";
import TdTooltip from "./TdTooltip";
import SidebarRow from "./SidebarRow";
import { isUpdateMessage } from "./db";

const ChatRow: Component<{
  message: Message;
  isSelected: boolean;
  onSelect: (message: Message) => void;
}> = (props) => {
  return (
    <SidebarRow
      message={props.message}
      isSelected={props.isSelected}
      onSelect={props.onSelect}
    >
      <Show when={isUpdateMessage(props.message) && props.message}>
        {(message) => (
          <>
            <TdTooltip>
              <Badge variant="solid">{message.update.info}</Badge>
            </TdTooltip>
          </>
        )}
      </Show>
    </SidebarRow>
  );
};

export default ChatRow;
