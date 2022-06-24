import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import { Table, Thead, Tbody, Tr, Th, Td } from "@hope-ui/solid";

import { getMessages } from "./store";
import type { Message, UpdateMessage } from "../types/message";

const UpdateMessageComponent: Component<{ message: UpdateMessage }> = (
  props
) => {
  return (
    <>
      <Td>{props.message.descr}</Td>
      <Td>{props.message.update.serial}</Td>
      <Td>{props.message.update.max_serial}</Td>
      <Td>{props.message.update.info}</Td>
      <Td>{props.message.update.document}</Td>
      <Td>{props.message.update.summary}</Td>
      <Td>{JSON.stringify(props.message.update.payload)}</Td>
    </>
  );
};

const FallbackMessageComponent: Component = (props) => {
  return <></>;
};

const MessageComponent: Component<{ message: Message }> = (props) => {
  return (
    <Tr>
      <Td>{props.message.clientId}</Td>
      <Td>{props.message.type}</Td>
      <Show
        when={props.message.type !== "clear"}
        fallback={<FallbackMessageComponent />}
      >
        <UpdateMessageComponent message={props.message as UpdateMessage} />
      </Show>
    </Tr>
  );
};

const Messages: Component = () => {
  return (
    <>
      <Table striped="even" dense>
        <Thead>
          <Th>client id</Th>
          <Th>type</Th>
          <Th>descr</Th>
          <Th>serial</Th>
          <Th>max serial</Th>
          <Th>info</Th>
          <Th>document</Th>
          <Th>summary</Th>
          <Th>payload</Th>
        </Thead>
        <Tbody>
          <For each={getMessages()}>
            {(message) => <MessageComponent message={message} />}
          </For>
        </Tbody>
      </Table>
    </>
  );
};

export default Messages;
