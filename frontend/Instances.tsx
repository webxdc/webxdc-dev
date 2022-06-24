import type { Component } from "solid-js";
import { For, createResource } from "solid-js";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  notificationService,
  Flex,
  Tooltip,
} from "@hope-ui/solid";
import { Link } from "solid-app-router";
import { sent, received } from "./store";

type InstanceData = {
  id: number;
  url: string;
};

const [instances, { refetch: refetchInstances }] = createResource<
  InstanceData[]
>(async () => {
  return (await fetch(`/instances`)).json();
});

const CLEAR_INFO = `\
Clear both webxdc-dev server state as well as client state.
This wipes out any localStorage and sessionStorage on each client, and reloads them.`;

const Instance: Component<{ instance: InstanceData }> = (props) => {
  return (
    <Tr>
      <Td>
        <a target="_blank" href={props.instance.url}>
          {props.instance.id}
        </a>
      </Td>
      <Td>
        <Link href={`/messages?clientId=${props.instance.id}`}>inspect</Link>
      </Td>
      <Td numeric>{sent(props.instance.id.toString())}</Td>
      <Td numeric>{received(props.instance.id.toString())}</Td>
    </Tr>
  );
};

const Instances: Component = () => {
  const handleAddInstance = async () => {
    const { port } = await (
      await fetch(`/instances`, { method: "POST" })
    ).json();
    refetchInstances();
    notificationService.show({
      title: `New instance ${port} added`,
    });
  };

  const handleClear = async () => {
    await fetch(`/clear`, { method: "POST" });
    notificationService.show({
      title: `Clearing state of dev server & instances`,
    });
  };

  return (
    <>
      <Box m="$8" ml="$1">
        <Table>
          <Thead>
            <Th>Instance</Th>
            <Th>Inspect</Th>
            <Th numeric>Sent</Th>
            <Th numeric>Received</Th>
          </Thead>
          <Tbody>
            <For each={instances()}>
              {(instance) => <Instance instance={instance} />}
            </For>
          </Tbody>
        </Table>
      </Box>
      <Flex direction="row" justifyContent="flex-start" gap="$3">
        <Button onClick={handleAddInstance}>Add Instance</Button>
        <Tooltip label={CLEAR_INFO}>
          <Button onClick={handleClear}>Clear</Button>
        </Tooltip>
      </Flex>
    </>
  );
};

export default Instances;
