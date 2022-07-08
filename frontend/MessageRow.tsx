import { Component, Show } from "solid-js";

import type { Message } from "../types/message";
import TdTooltip from "./TdTooltip";
import SidebarRow from "./SidebarRow";
import { isUpdateMessage } from "./db";

const MessageRow: Component<{
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
    </SidebarRow>
  );
};

export default MessageRow;
