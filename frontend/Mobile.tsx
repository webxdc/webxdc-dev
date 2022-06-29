import { Component, For } from "solid-js";
import {
  Flex,
  Button,
  Box,
  Table,
  Th,
  Tr,
  Thead,
  Tbody,
  Text,
} from "@hope-ui/solid";

import { TdEllipsis } from "./Messages";
import { instances, InstanceData, getMessages } from "./store";
import InstancesButtons from "./InstancesButtons";
import { UpdateMessage } from "../types/message";

const scrollToDevice = (instanceId: string) => {
  document.getElementById("device-" + instanceId)?.scrollIntoView();
};

const MessageComponent: Component<{ message: UpdateMessage }> = (props) => {
  return (
    <Tr>
      <TdEllipsis>
        <Text
          color={props.message.instanceColor}
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
        <For each={getMessages(undefined, "sent")}>
          {(message) => <MessageComponent message={message as UpdateMessage} />}
        </For>
      </Tbody>
    </Table>
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
      <Box m="$8" ml="$1">
        <Flex justifyContent="space-between">
          <Flex flexWrap="wrap" gap="$5">
            <For each={instances()}>
              {(instance: InstanceData) => <Device instance={instance} />}
            </For>
          </Flex>
          <Box>
            <Messages />
          </Box>
        </Flex>
      </Box>
      <InstancesButtons />
    </>
  );
};

export default Mobile;
