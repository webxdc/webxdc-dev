import {
  Component,
  For,
  Accessor,
  createSignal,
  createEffect,
  Show,
} from "solid-js";
import { Flex, Box, Table, Thead, Tbody, Th, Badge } from "@hope-ui/solid";

import { Message } from "../types/message";
import ChatRow from "./ChatRow";
import { createMessagesQuery, summary } from "./db";

export type Search = {
  instanceId?: string;
  type?: string;
};

const Chat: Component<{
  search: Accessor<Search>;
  onSelectMessage: (message: Message) => void;
}> = (props) => {
  const [chatIndex, setChatIndex] = createSignal<number | null>(null);

  const messages = createMessagesQuery(() => ({
    instanceId: props.search().instanceId,
    type: "sent",
    hasInfo: true,
  }));

  createEffect(() => {
    // whenever we get a new message, we should scroll to the last message
    messages.length;
    // we scroll to the last message
    scrollToLastChat();
  });

  return (
    <Flex flexDirection="column">
      <Show when={summary()}>
        {(summary) => <Badge>Summary: {summary}</Badge>}
      </Show>
      <Box width="53vw" maxHeight="36vh" overflow="scroll">
        <Table id="chat" dense css={{ "table-layout": "fixed" }}>
          <Thead>
            <Th width="10%" minWidth="7em">
              Id
            </Th>
            <Th>Info</Th>
          </Thead>
          <Tbody>
            <For each={messages}>
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
    </Flex>
  );
};

function scrollToLastChat() {
  document.querySelector("#chat > tbody > tr:last-child")?.scrollIntoView();
}

export default Chat;
