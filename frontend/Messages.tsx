import type { Component } from "solid-js";
import { For, Show, JSX } from "solid-js";
import { Table, Thead, Tbody, Tr, Th, Td, Tooltip, Text } from "@hope-ui/solid";

import { getMessages } from "./store";
import type { Message, UpdateMessage } from "../types/message";

const COLUMN_WIDTHS = {
  clientId: "3%",
  type: "5%",
  descr: "10%",
  serial: "4%",
  maxSerial: "4%",
  info: "5%",
  document: "5%",
  summary: "5%",
  payload: "20%",
};

const TooltipEllipsis: Component<{
  children: JSX.Element;
  tooltip?: JSX.Element;
}> = (props) => {
  return (
    <Tooltip label={props.tooltip || props.children}>
      <Text
        noOfLines={1}
        fontSize={{
          "@initial": "8px",
          "@sm": "8px",
          "@md": "10px",
          "@lg": "12px",
        }}
      >
        {props.children}
      </Text>
    </Tooltip>
  );
};

const TdEllipsis: Component<{
  children: JSX.Element;
  numeric?: boolean;
  tooltip?: JSX.Element;
}> = (props) => {
  return (
    <Td numeric={props.numeric}>
      <TooltipEllipsis tooltip={props.tooltip}>
        {props.children}
      </TooltipEllipsis>
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
        css={{ "table-layout": "fixed" }}
      >
        <Thead>
          <Th width={COLUMN_WIDTHS.clientId}>
            <TooltipEllipsis>client id</TooltipEllipsis>
          </Th>
          <Th width={COLUMN_WIDTHS.type}>
            <TooltipEllipsis>type</TooltipEllipsis>
          </Th>
          <Th width={COLUMN_WIDTHS.descr}>
            <TooltipEllipsis>descr</TooltipEllipsis>
          </Th>
          <Th width={COLUMN_WIDTHS.serial} numeric>
            <TooltipEllipsis>serial</TooltipEllipsis>
          </Th>
          <Th width={COLUMN_WIDTHS.maxSerial} numeric>
            <TooltipEllipsis>max serial</TooltipEllipsis>
          </Th>
          <Th width={COLUMN_WIDTHS.info}>
            <TooltipEllipsis>info</TooltipEllipsis>
          </Th>
          <Th width={COLUMN_WIDTHS.document}>
            <TooltipEllipsis>document</TooltipEllipsis>
          </Th>
          <Th width={COLUMN_WIDTHS.summary}>
            <TooltipEllipsis>summary</TooltipEllipsis>
          </Th>
          <Th width={COLUMN_WIDTHS.payload}>
            <TooltipEllipsis>payload</TooltipEllipsis>
          </Th>
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
