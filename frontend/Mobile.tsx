import { Component, For, Show } from "solid-js";
import {
  Flex,
  notificationService,
  Button,
  Box,
  Table,
  Th,
  Td,
  Tr,
  Thead,
  Tbody,
  Text,
} from "@hope-ui/solid";

import { TdEllipsis } from "./Messages";
import {
  instances,
  InstanceData,
  refetchInstances,
  getMessages,
} from "./store";
import { Message, UpdateMessage } from "../types/message";

const COLORS = [
  "#2965CC",
  "#29A634",
  "#D99E0B",
  "#D13913",
  "#8F398F",
  "#00B3A4",
  "#DB2C6F",
  "#9BBF30",
  "#96622D",
  "#7157D9",
];
let currentColor = 0;
const idToColor = new Map<string, string>();

function getColorForId(id: string): string {
  const result = idToColor.get(id);
  if (result != null) {
    return result;
  }
  const color = COLORS[currentColor] || "grey";
  currentColor++;
  idToColor.set(id, color);
  return color;
}

const scrollToDevice = (instanceId: string) => {
  document.getElementById("device-" + instanceId)?.scrollIntoView();
};

const MessageComponent: Component<{ message: UpdateMessage }> = (props) => {
  return (
    <Tr>
      <TdEllipsis>
        <Text
          color={getColorForId(props.message.instanceId)}
          onClick={() => scrollToDevice(props.message.instanceId)}
        >
          {props.message.instanceId}
        </Text>
      </TdEllipsis>
      <TdEllipsis>{props.message.descr}</TdEllipsis>
      <TdEllipsis>{JSON.stringify(props.message.update.payload)}</TdEllipsis>
    </Tr>
  );
};

const Messages: Component = () => {
  return (
    <Table width="33vw" striped="even" dense css={{ "table-layout": "fixed" }}>
      <Thead>
        <Th width="10em">Instance id</Th>
        <Th>Descr</Th>
        <Th min-width="30em">Payload</Th>
      </Thead>
      <Tbody>
        <For each={getMessages(null, "sent")}>
          {(message) => <MessageComponent message={message as UpdateMessage} />}
        </For>
      </Tbody>
    </Table>
  );
};

const Device: Component<{ instance: InstanceData }> = (props) => {
  let iframe_ref: HTMLIFrameElement | undefined = undefined;

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
      }}
    >
      <div id={"device-" + props.instance.id} style={{ display: "flex" }}>
        <Text
          style={{
            "font-size": "x-large",
            "flex-grow": 1,
            "font-weight": "bold",
            color: getColorForId(props.instance.id),
          }}
        >
          {props.instance.id}
        </Text>
        <Button
          onClick={() => {
            iframe_ref?.contentWindow?.postMessage(
              "reload",
              props.instance.url
            );
          }}
        >
          Reload
        </Button>
      </div>

      <iframe
        ref={iframe_ref}
        src={props.instance.url + `?${encodeURIComponent(getColorForId(props.instance.id))}`}
        style={{
          height: "667px",
          width: "375px",
          "border-color": getColorForId(props.instance.id),
          "border-width": "7px",
          "border-style": "solid",
        }}
      ></iframe>
    </div>
  );
};

const Mobile: Component = () => {
  const handleAddInstance = async () => {
    const { port } = await (
      await fetch(`/instances`, { method: "POST" })
    ).json();
    refetchInstances();
    notificationService.show({
      title: `New instance ${port} added`,
    });
  };

  return (
    <>
      <Flex>
        <Flex flexWrap="wrap" gap="$5">
          <For each={instances()}>
            {(instance: InstanceData) => <Device instance={instance} />}
          </For>
        </Flex>
        <Box>
          <Messages />
        </Box>
      </Flex>
      <Flex direction="row" justifyContent="flex-start" gap="$3">
        <Button onClick={handleAddInstance}>Add Instance</Button>
      </Flex>
    </>
  );
};

export default Mobile;
