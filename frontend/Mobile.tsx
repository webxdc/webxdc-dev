import {
  Component,
  For,
  createSignal,
  Show,
  createMemo,
  Accessor,
  Setter,
} from "solid-js";
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
  Badge,
  Tooltip,
} from "@hope-ui/solid";

import { TdEllipsis, Ellipsis } from "./Messages";
import Filter from "./Filter";
import { instances, InstanceData, getMessages } from "./store";
import InstancesButtons from "./InstancesButtons";
import { Message } from "../types/message";
import RecordRow from "./RecordRow";
import { instanceIdEntries } from "./MessagesFilters";
import { sent, received } from "./store";

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
          <Tooltip label="Click to scroll to device">
            <Text
              color={props.message.instanceColor}
              onClick={() => scrollToDevice(props.message.instanceId)}
            >
              {props.message.instanceId}
            </Text>
          </Tooltip>
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

const Messages: Component<{
  search: Accessor<Search>;
  setSearch: Setter<Search>;
}> = (props) => {
  const [message, setMessage] = createSignal<Message | null>(null);

  return (
    <Flex height="100wh" flexDirection="column" justifyContent="space-between">
      <Box>
        <Filters value={props.search()} onChange={props.setSearch} />
        <Box width="55vw" maxHeight="40vh" overflow="scroll">
          <Table highlightOnHover dense css={{ "table-layout": "fixed" }}>
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
                {(message) => (
                  <MessageComponent message={message} onSelect={setMessage} />
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

const Device: Component<{
  instance: InstanceData;
  setSearch: (search: Search) => void;
}> = (props) => {
  const sentCount = createMemo(() => {
    return sent(props.instance.id);
  });

  const receivedCount = createMemo(() => {
    return received(props.instance.id);
  });

  let iframe_ref: HTMLIFrameElement | undefined = undefined;

  const handleReload = () => {
    if (iframe_ref == null) {
      return;
    }
    iframe_ref.contentWindow?.postMessage("reload", props.instance.url);
  };

  return (
    <Flex flexDirection="column">
      <Flex
        id={"device-" + props.instance.id}
        gap="$1"
        justifyContent="space-between"
        alignItems="center"
      >
        <Tooltip label="Click to see all messages for this device">
          <Text
            color={props.instance.color}
            fontSize="$2xl"
            fontWeight="bold"
            onClick={() => props.setSearch({ instanceId: props.instance.id })}
          >
            {props.instance.id}
          </Text>
        </Tooltip>
        <Tooltip label="Click to see all sent messages for this device">
          <Badge
            onClick={() =>
              props.setSearch({ instanceId: props.instance.id, type: "sent" })
            }
          >
            Sent: {sentCount}
          </Badge>
        </Tooltip>
        <Tooltip label="Click to see all received messages for this device">
          <Badge
            onClick={() =>
              props.setSearch({
                instanceId: props.instance.id,
                type: "received",
              })
            }
          >
            Received: {receivedCount}
          </Badge>
        </Tooltip>
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
  const [search, setSearch] = createSignal<Search>({
    type: "sent",
  });

  return (
    <>
      <Flex justifyContent="space-between">
        <Flex flexDirection="column">
          <Box m="$8" ml="$1">
            <Flex flexWrap="wrap" gap="$5" overflow="scroll" maxHeight="77vh">
              <For each={instances()}>
                {(instance: InstanceData) => (
                  <Device instance={instance} setSearch={setSearch} />
                )}
              </For>
            </Flex>
          </Box>
          <InstancesButtons />
        </Flex>
        <Messages search={search} setSearch={setSearch} />
      </Flex>
    </>
  );
};

export default Mobile;
