import { Component, For, Accessor, createSignal, createEffect } from "solid-js";
import { Box, Table, Thead, Tbody, Th } from "@hope-ui/solid";

import { Message } from "../types/message";
import MessageRow from "./MessageRow";
import { getMessages } from "./store";

export type Search = {
  instanceId?: string;
  type?: string;
};

const Messages: Component<{
  search: Accessor<Search>;
  onSelectMessage: (message: Message) => void;
}> = (props) => {
  const [messageIndex, setMessageIndex] = createSignal<number | null>(null);

  createEffect(() => {
    // whenever we get a new message, we should scroll to the last message
    getMessages({}).length;
    // we scroll to the last message
    scrollToLastMessage();
  });

  return (
    <Box overflow="auto">
      <Table id="messages" dense css={{ "table-layout": "fixed" }}>
        <Thead>
          <Th maxW="70px"> Id </Th>
          <Th maxW="70px">Type</Th>
          <Th maxW="70px">Descr</Th>
          <Th>Payload</Th>
        </Thead>
        <Tbody>
          <For
            each={getMessages({
              instanceId: props.search().instanceId,
              type: props.search().type,
            })}
          >
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
