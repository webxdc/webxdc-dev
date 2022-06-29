import type { Component, JSX } from "solid-js";
import { For, createMemo } from "solid-js";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Anchor,
} from "@hope-ui/solid";
import { Link as RouterLink } from "solid-app-router";

import { sent, received, instances, InstanceData } from "./store";
import InstancesButtons from "./InstancesButtons";

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
  // XXX these could be simple functions not memos
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
        <Tooltip
          label={
            <span>Open new browser tab for instance {props.instance.id}</span>
          }
        >
          <Anchor color="$primary10" external href={props.instance.url}>
            {props.instance.id}
          </Anchor>
        </Tooltip>
      </Td>
      <Td>
        <Tooltip
          label={
            <span>
              Click to see all updates/clears sent and received by instance{" "}
              {props.instance.id}
            </span>
          }
        >
          <Link href={inspectPath()}>inspect</Link>
        </Tooltip>
      </Td>
      <Td numeric>
        <Tooltip
          label={
            <span>
              Click to see updates sent by instance {props.instance.id}
            </span>
          }
        >
          <Link href={sentPath()}>{sentCount()}</Link>
        </Tooltip>
      </Td>
      <Td numeric>
        <Tooltip
          label={
            <span>
              Click to see updates received by instance {props.instance.id}
            </span>
          }
        >
          <Link href={receivedPath()}>{receivedCount()}</Link>
        </Tooltip>
      </Td>
    </Tr>
  );
};

const Instances: Component = () => {
  return (
    <>
      <Box m="$8" ml="$1">
        <Table>
          <Thead>
            <Th>Instance</Th>
            <Th>Messages</Th>
            <Th numeric>
              <Tooltip label="Click to see updates sent by all instances">
                <Link href="/messages?type=sent">Sent</Link>
              </Tooltip>
            </Th>
            <Th numeric>
              <Tooltip label="Click to see updates received by all instances">
                <Link href="/messages?type=received">Received</Link>
              </Tooltip>
            </Th>
          </Thead>
          <Tbody>
            <For each={instances()}>
              {(instance) => <Instance instance={instance} />}
            </For>
          </Tbody>
        </Table>
      </Box>
      <InstancesButtons />
    </>
  );
};

export default Instances;
