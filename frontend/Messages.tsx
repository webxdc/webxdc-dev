import {
  Component,
  For,
  createSignal,
  Show,
  Accessor,
  Setter,
  createEffect,
} from "solid-js";
import { Flex, Box, Table, Th, Thead, Tbody } from "@hope-ui/solid";

import { Message } from "../types/message";
import MessageDetails from "./MessageDetails";
import MessageRow from "./MessageRow";
import Filters from "./Filters";
import { getMessages } from "./store";

export type Search = {
  instanceId?: string;
  type?: string;
};

const Messages: Component<{
  search: Accessor<Search>;
  setSearch: Setter<Search>;
}> = (props) => {
  const [message, setMessage] = createSignal<Message | null>(null);
  const [messageIndex, setMessageIndex] = createSignal<number | null>(null);

  createEffect(() => {
    // whenever we get a new message, we should scroll to the last message
    getMessages(undefined, undefined).length;
    // we scroll to the last message
    scrollToLastMessage();
  });

  return (
    <Flex height="100%" flexDirection="column" justifyContent="space-between">
      <Box>
        <Filters value={props.search()} onChange={props.setSearch} />
        <Box width="55vw" maxHeight="36vh" overflow="scroll">
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
              <For
                each={getMessages(
                  props.search().instanceId,
                  props.search().type
                )}
              >
                {(message, index) => (
                  <MessageRow
                    isSelected={messageIndex() === index()}
                    message={message}
                    onSelect={(message) => {
                      setMessageIndex(index());
                      setMessage(message);
                    }}
                  />
                )}
              </For>
            </Tbody>
          </Table>
        </Box>
      </Box>
      <Box>
        <Show when={message()}>
          {(message) => <MessageDetails message={message} />}
        </Show>
      </Box>
    </Flex>
  );
};

function scrollToLastMessage() {
  document.querySelector("#messages > tbody > tr:last-child")?.scrollIntoView();
}

export default Messages;
