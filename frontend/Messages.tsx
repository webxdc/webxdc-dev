import { Component } from "solid-js";
import { For, Show, JSX, createMemo } from "solid-js";
import { Table, Thead, Tbody, Tr, Th, Td, Tooltip, Text } from "@hope-ui/solid";
import { useSearchParams } from "solid-app-router";

import { getMessages, instances } from "./store";
import type { Message, UpdateMessage } from "../types/message";
import Filter from "./Filter";

const COLUMN_WIDTHS = {
  instanceId: "4%",
  type: "5%",
  descr: "8%",
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
      <TdEllipsis>{props.message.instanceId}</TdEllipsis>
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

const instanceIdEntries = createMemo(() => {
  const resolvedInstances = instances();
  const all_entry = {
    value: "*",
    text: "All instance ids",
  };
  if (resolvedInstances == null) {
    return [all_entry];
  }
  return [
    all_entry,
    ...resolvedInstances.map((instance) => ({
      value: instance.id,
      text: instance.id,
    })),
  ];
});

type ParamsType = ReturnType<typeof useSearchParams>[0];
type SetParamsType = ReturnType<typeof useSearchParams>[1];

const Filters: Component<{
  searchParams: ParamsType;
  setSearchParams: SetParamsType;
}> = (props) => {
  return (
    <>
      <Filter
        label="instanceId"
        entries={instanceIdEntries()}
        value={props.searchParams.instanceId || "*"}
        onChange={(value) => {
          if (value === "*") {
            props.setSearchParams({
              ...props.searchParams,
              instanceId: undefined,
            });
          } else {
            props.setSearchParams({ ...props.searchParams, instanceId: value });
          }
        }}
      />
      <Filter
        label="type"
        entries={[
          { value: "*", text: "All types" },
          { value: "sent", text: "Sent" },
          { value: "received", text: "Received" },
          { value: "clear", text: "Clear" },
        ]}
        value={props.searchParams.type || "*"}
        onChange={(value) => {
          if (value === "*") {
            props.setSearchParams({ ...props.searchParams, type: undefined });
          } else {
            props.setSearchParams({ ...props.searchParams, type: value });
          }
        }}
      />
    </>
  );
};

const Messages: Component = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <>
      <Filters searchParams={searchParams} setSearchParams={setSearchParams} />
      <Table
        width="100%"
        striped="even"
        dense
        css={{ "table-layout": "fixed" }}
      >
        <Thead>
          <Th width={COLUMN_WIDTHS.instanceId}>
            <TooltipEllipsis>instance id</TooltipEllipsis>
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
          <For each={getMessages(searchParams.instanceId, searchParams.type)}>
            {(message) => <MessageComponent message={message} />}
          </For>
        </Tbody>
      </Table>
    </>
  );
};

export default Messages;
