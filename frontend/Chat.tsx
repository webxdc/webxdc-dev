import { Component, For, Accessor, createSignal, createEffect } from "solid-js";
import { Box, Table, Thead, Tbody, Th } from "@hope-ui/solid";

import { Message } from "../types/message";
import ChatRow from "./ChatRow";
import { getMessages } from "./store";

export type Search = {
  instanceId?: string;
  type?: string;
};

const Chat: Component<{
  search: Accessor<Search>;
  onSelectMessage: (message: Message) => void;
}> = (props) => {
  const [chatIndex, setChatIndex] = createSignal<number | null>(null);

  createEffect(() => {
    // whenever we get a new message, we should scroll to the last message
    getMessages({}).length;
    // we scroll to the last message
    scrollToLastChat();
  });

  return (
    <Box width="53vw" maxHeight="36vh" overflow="scroll">
      <Table id="chat" dense css={{ "table-layout": "fixed" }}>
        <Thead>
          <Th width="10%" minWidth="7em">
            Id
          </Th>
          <Th>Info</Th>
        </Thead>
        <Tbody>
          <For
            each={getMessages({
              instanceId: props.search().instanceId,
              type: "sent",
              info: true,
            })}
          >
            {(message, index) => (
              <ChatRow
                isSelected={chatIndex() === index()}
                message={message}
                onSelect={(message) => {
                  setChatIndex(index());
                  props.onSelectMessage(message);
                }}
              />
            )}
          </For>
        </Tbody>
      </Table>
    </Box>
  );
};

function scrollToLastChat() {
  document.querySelector("#chat > tbody > tr:last-child")?.scrollIntoView();
}

export default Chat;
