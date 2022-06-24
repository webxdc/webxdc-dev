import type { Component, JSX } from "solid-js";
import { For, createMemo } from "solid-js";
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
  Anchor,
} from "@hope-ui/solid";
import { Link as RouterLink } from "solid-app-router";

import {
  sent,
  received,
  instances,
  refetchInstances,
  InstanceData,
} from "./store";

const CLEAR_INFO = `\
Clear both webxdc-dev server state as well as client state.
This wipes out any localStorage and sessionStorage on each client, and reloads them.`;

const Link: Component<{
  href: string;
  children: JSX.Element;
}> = (props) => {
  return (
    <Anchor as={RouterLink} color="$primary10" href={props.href}>
      {props.children}
    </Anchor>
  );
};

const Instance: Component<{ instance: InstanceData }> = (props) => {
  const inspectPath = createMemo(() => {
    return `/messages?clientId=${props.instance.id}`;
  });

  const sentPath = createMemo(() => {
    return inspectPath() + `&type=sent`;
  });

  const receivedPath = createMemo(() => {
    return inspectPath() + `&type=received`;
  });

  const sentCount = createMemo(() => {
    return sent(props.instance.id);
  });

  const receivedCount = createMemo(() => {
    return received(props.instance.id);
  });

  return (
    <Tr>
      <Td>
        <Anchor color="$primary10" external href={props.instance.url}>
          {props.instance.id}
        </Anchor>
      </Td>
      <Td>
        <Link href={inspectPath()}>inspect</Link>
      </Td>
      <Td numeric>
        <Link href={sentPath()}>{sentCount()}</Link>
      </Td>
      <Td numeric>
        <Link href={receivedPath()}>{receivedCount()}</Link>
      </Td>
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
            <Th>Messages</Th>
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
