import type { Component } from "solid-js";
import { For, Show, JSX } from "solid-js";
import { Table, Thead, Tbody, Tr, Th, Td, Tooltip } from "@hope-ui/solid";

import { getMessages } from "./store";
import type { Message, UpdateMessage } from "../types/message";

const COLUMN_WIDTHS = {
  clientId: "3%",
  type: "5%",
  descr: "10%",
  serial: "3%",
  maxSerial: "3%",
  info: "5%",
  document: "5%",
  summary: "5%",
  payload: "30%",
};

const TdEllipsis: Component<{
  children: JSX.Element;
  numeric?: boolean;
  tooltip?: JSX.Element;
}> = (props) => {
  return (
    <Td
      style={{
        overflow: "hidden",
        "text-overflow": "ellipsis",
        "white-space": "nowrap",
      }}
      numeric={props.numeric}
    >
      <Tooltip label={props.tooltip || props.children}>
        <span>{props.children}</span>
      </Tooltip>
    </Td>
  );
};

const UpdateMessageComponent: Component<{ message: UpdateMessage }> = (
  props
) => {
  return (
    <>
      <TdEllipsis>{props.message.descr}</TdEllipsis>
      <TdEllipsis numeric>{props.message.update.serial}</TdEllipsis>
      <TdEllipsis numeric>{props.message.update.max_serial}</TdEllipsis>
      <TdEllipsis>{props.message.update.info}</TdEllipsis>
      <TdEllipsis>{props.message.update.document}</TdEllipsis>
      <TdEllipsis>{props.message.update.summary}</TdEllipsis>
      <TdEllipsis
        tooltip={
          <pre>
            <code>{JSON.stringify(props.message.update.payload, null, 2)}</code>
          </pre>
        }
      >
        <code>{JSON.stringify(props.message.update.payload)}</code>
      </TdEllipsis>
    </>
  );
};

const FallbackMessageComponent: Component = (props) => {
  return <></>;
};

const MessageComponent: Component<{ message: Message }> = (props) => {
  return (
    <Tr>
      <TdEllipsis>{props.message.clientId}</TdEllipsis>
      <TdEllipsis>{props.message.type}</TdEllipsis>
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
      <Table
        width="100%"
        striped="even"
        dense
        style={{ "table-layout": "fixed" }}
      >
        <Thead>
          <Th width={COLUMN_WIDTHS.clientId}>client id</Th>
          <Th width={COLUMN_WIDTHS.type}>type</Th>
          <Th width={COLUMN_WIDTHS.descr}>descr</Th>
          <Th width={COLUMN_WIDTHS.serial} numeric>
            serial
          </Th>
          <Th width={COLUMN_WIDTHS.maxSerial} numeric>
            max serial
          </Th>
          <Th width={COLUMN_WIDTHS.info}>info</Th>
          <Th width={COLUMN_WIDTHS.document}>document</Th>
          <Th width={COLUMN_WIDTHS.summary}>summary</Th>
          <Th width={COLUMN_WIDTHS.payload}>payload</Th>
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
