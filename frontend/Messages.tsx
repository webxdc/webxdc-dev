import { Component, For, Accessor, createSignal, createEffect } from "solid-js";
import { Box, Table, Thead, Tbody, Th } from "@hope-ui/solid";

import { Message } from "../types/message";
import MessageRow from "./MessageRow";
import { createMessagesQuery } from "./db";

export type Search = {
  instanceId?: string;
  type?: string;
};

const Messages: Component<{
  search: Accessor<Search>;
  onSelectMessage: (message: Message) => void;
}> = (props) => {
  const [messageIndex, setMessageIndex] = createSignal<number | null>(null);

  const messages = createMessagesQuery(() => ({
    instanceId: props.search().instanceId,
    type: props.search().type,
  }));

  createEffect(() => {
    // whenever we get a new message, we should scroll to the last message
    messages.length;
    // we scroll to the last message
    scrollToLastMessage();
  });

  return (
    <Box width="53vw" maxHeight="36vh" overflow="scroll">
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
          <For each={messages}>
            {(message, index) => (
              <MessageRow
                isSelected={messageIndex() === index()}
                message={message}
                onSelect={(message) => {
                  setMessageIndex(index());
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

function scrollToLastMessage() {
  document.querySelector("#messages > tbody > tr:last-child")?.scrollIntoView();
}

export default Messages;
