import { Component, For, createSignal, Setter, Show } from "solid-js";
import {
  Flex,
  Box,
  createDisclosure,
  Heading,
  Button,
} from "@hope-ui/solid";

import { instances } from "./store";
import InstancesButtons from "./InstancesButtons";
import { scrollToInstance } from "./Instance";
import Sidebar, { Search } from "./Sidebar";
import Instance from "./Instance";
import type { Instance as InstanceData } from "../types/instance";
import SplitView from "./SplitView";

const Main: Component = () => {
  const [search, setSearch] = createSignal<Search>({
    type: "sent",
  });

  const setSearchAndOpen: Setter<Search> = (value) => {
    onOpen();
    return setSearch(value);
  };
  const { isOpen, onOpen, onClose } = createDisclosure({ defaultIsOpen: true });

  return (
    <>
      {
        <Show when={isOpen()} fallback={
          <Flex>
            <Flex flexDirection="column">
                <Flex mb="$1" justifyContent="space-between">
                  <Heading level="1">Devices</Heading>
                  <InstancesButtons
                    onAfterAdd={(instanceId) => {
                      scrollToInstance(instanceId);
                    }}
                    show_messages_button={true}
                    onOpenMessages={onOpen}
                  />
                </Flex>
                <Box overflow="auto" >
                  <Flex flexWrap="wrap" gap="$5" justifyContent="center">
                    <For each={instances()}>
                      {(instance: InstanceData) => (
                        <Instance instance={instance} setSearch={setSearchAndOpen} />
                      )}
                    </For>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          }>
          <SplitView>
            <Flex flexDirection="column">
              <Flex mb="$1" justifyContent="space-between">
                <Heading level="1">Devices</Heading>
                <InstancesButtons
                  onAfterAdd={(instanceId) => {
                    scrollToInstance(instanceId);
                  }}
                  show_messages_button={false}
                  onOpenMessages={() => {}}
                />
              </Flex>
              <Box overflow="auto" >
                <Flex flexWrap="wrap" gap="$5" justifyContent="center">
                  <For each={instances()}>
                    {(instance: InstanceData) => (
                      <Instance instance={instance} setSearch={setSearchAndOpen} />
                    )}
                  </For>
                </Flex>
              </Box>
            </Flex>
            <Flex direction="column">
              <Flex justifyContent="space-between" marginBottom="$1">
                <Heading display="inline-block" level="1" mb="1">Messages</Heading>
                <Button colorScheme="neutral" size="xs" onClick={onClose}> Close Messages </Button>
              </Flex>
              <Sidebar search={search} setSearch={setSearchAndOpen} />
            </Flex>
          </SplitView>
        </Show>
      }
    </>
  );
};
export default Main;
