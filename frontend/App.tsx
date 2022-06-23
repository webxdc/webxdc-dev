import type { Component } from "solid-js";
import { For, createResource } from "solid-js";
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  notificationService,
  Flex,
} from "@hope-ui/solid";

type InstanceData = {
  id: number;
  url: string;
};

const [instances, { refetch: refetchInstances }] = createResource<
  InstanceData[]
>(async () => {
  return (await fetch(`/instances`)).json();
});

const Instance: Component<{ instance: InstanceData }> = (props) => {
  return (
    <Tr>
      <Td>
        <a target="_blank" href={props.instance.url}>
          {props.instance.id}
        </a>
      </Td>
    </Tr>
  );
};

const App: Component = () => {
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
    <Box m="$20" mt="$12">
      <Heading level="1" size="3xl">
        webxdc-dev
      </Heading>
      <Box m="$8" ml="$1">
        <Table>
          <Thead>
            <Th>Instance</Th>
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
        <Button onClick={handleClear}>Clear server and client state</Button>
      </Flex>
    </Box>
  );
};

export default App;
