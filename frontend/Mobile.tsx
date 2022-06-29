import { Component, For, createSignal, Show } from "solid-js";
import {
  Flex,
  Button,
  Box,
  Table,
  Th,
  Tr,
  Td,
  Thead,
  Tbody,
  Text,
} from "@hope-ui/solid";

import { TdEllipsis, Ellipsis } from "./Messages";
import Filter from "./Filter";
import { instances, InstanceData, getMessages } from "./store";
import InstancesButtons from "./InstancesButtons";
import { Message } from "../types/message";
import RecordRow from "./RecordRow";
import { instanceIdEntries } from "./MessagesFilters";

const scrollToDevice = (instanceId: string) => {
  document.getElementById("device-" + instanceId)?.scrollIntoView();
};

const MessageComponent: Component<{
  message: Message;
  onSelect: (message: Message) => void;
}> = (props) => {
  return (
    <Tr
      onClick={() => {
        props.onSelect(props.message);
      }}
    >
      <Td>
        <Ellipsis>
          <Text
            color={props.message.instanceColor}
            onClick={() => scrollToDevice(props.message.instanceId)}
          >
            {props.message.instanceId}
          </Text>
        </Ellipsis>
      </Td>
      <TdEllipsis>{props.message.type}</TdEllipsis>
      <Show when={props.message.type !== "clear" && props.message}>
        {(message) => (
          <>
            <TdEllipsis>{message.descr}</TdEllipsis>
            <TdEllipsis
              tooltip={
                <pre>
                  <code>{JSON.stringify(message.update.payload, null, 2)}</code>
                </pre>
              }
            >
              {JSON.stringify(message.update.payload)}
            </TdEllipsis>
          </>
        )}
      </Show>
    </Tr>
  );
};

const MessageDetails: Component<{ message: Message }> = (props) => {
  return (
    <Table dense>
      <Tbody>
        <RecordRow label="instance id">
          <Text color={props.message.instanceColor}>
            {props.message.instanceId}
          </Text>
        </RecordRow>
        <RecordRow label="type">{props.message.type}</RecordRow>
        <Show when={props.message.type !== "clear" && props.message}>
          {(message) => {
            return (
              <>
                <RecordRow label="descr">{message.descr}</RecordRow>
                <RecordRow label="serial">{message.update.serial}</RecordRow>
                <Show when={message.type === "received"}>
                  <RecordRow label="max serial">
                    {message.update.max_serial}
                  </RecordRow>
                </Show>
                <RecordRow label="info">{message.update.info}</RecordRow>
                <RecordRow label="document">
                  {message.update.document}
                </RecordRow>
                <RecordRow label="summary">{message.update.summary}</RecordRow>
                <RecordRow label="payload">
                  <pre>
                    <code>
                      {JSON.stringify(message.update.payload, null, 2)}
                    </code>
                  </pre>
                </RecordRow>
              </>
            );
          }}
        </Show>
      </Tbody>
    </Table>
  );
};

type Search = {
  instanceId?: string;
  type?: string;
};

const Filters: Component<{
  value: Search;
  onChange: (search: Search) => void;
}> = (props) => {
  return (
    <Flex justifyContent="flex-start" gap="$5">
      <Filter
        label="instanceId"
        entries={instanceIdEntries()}
        value={props.value.instanceId || "*"}
        onChange={(value) => {
          if (value === "*") {
            props.onChange({
              ...props.value,
              instanceId: undefined,
            });
          } else {
            props.onChange({
              ...props.value,
              instanceId: value,
            });
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
        value={props.value.type || "*"}
        onChange={(value) => {
          if (value === "*") {
            props.onChange({ ...props.value, type: undefined });
          } else {
            props.onChange({ ...props.value, type: value });
          }
        }}
      />
    </Flex>
  );
};

const Messages: Component = () => {
  const [message, setMessage] = createSignal<Message | null>(null);
  const [search, setSearch] = createSignal<Search>({
    type: "sent",
  });

  return (
    <Flex height="100wh" flexDirection="column" justifyContent="space-between">
      <Box width="55vw" maxHeight="40vh" overflow="scroll">
        <Filters value={search()} onChange={setSearch} />
        <Table striped="even" dense css={{ "table-layout": "fixed" }}>
          <Thead>
            <Th width="10%" minWidth="7em">
              Id
            </Th>
            <Th width="10%">Type</Th>
            <Th width="20%">Descr</Th>
            <Th minWidth="60%">Payload</Th>
          </Thead>
          <Tbody>
            <For each={getMessages(search().instanceId, search().type)}>
              {(message) => (
                <MessageComponent message={message} onSelect={setMessage} />
              )}
            </For>
          </Tbody>
        </Table>
      </Box>
      <Box>
        <Show when={message()}>
          {(message) => <MessageDetails message={message} />}
        </Show>
      </Box>
    </Flex>
  );
};

const Device: Component<{ instance: InstanceData }> = (props) => {
  let iframe_ref: HTMLIFrameElement | undefined = undefined;

  const handleReload = () => {
    if (iframe_ref == null) {
      return;
    }
    iframe_ref.contentWindow?.postMessage("reload", props.instance.url);
  };

  return (
    <Flex flexDirection="column">
      <Flex id={"device-" + props.instance.id}>
        <Text
          color={props.instance.color}
          style={{
            "font-size": "x-large",
            "flex-grow": 1,
            "font-weight": "bold",
          }}
        >
          {props.instance.id}
        </Text>
        <Button onClick={handleReload}>Reload</Button>
      </Flex>
      <iframe
        ref={iframe_ref}
        src={props.instance.url}
        style={{
          height: "667px",
          width: "375px",
          "border-color": props.instance.color,
          "border-width": "7px",
          "border-style": "solid",
        }}
      ></iframe>
    </Flex>
  );
};

const Mobile: Component = () => {
  return (
    <>
      <Flex justifyContent="space-between">
        <Flex flexDirection="column">
          <Box m="$8" ml="$1">
            <Flex flexWrap="wrap" gap="$5" overflow="scroll" maxHeight="77vh">
              <For each={instances()}>
                {(instance: InstanceData) => <Device instance={instance} />}
              </For>
            </Flex>
          </Box>
          <InstancesButtons />
        </Flex>
        <Messages />
      </Flex>
    </>
  );
};

export default Mobile;
