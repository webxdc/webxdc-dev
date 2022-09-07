import { Component, For, createSignal, Setter } from "solid-js";
import {
  Flex,
  Box,
  createDisclosure,
  Heading,
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
        <SplitView>
          <Flex flexDirection="column">
            <Flex mb="$1" justifyContent="space-between">
              <Heading level="1">Devices</Heading>
              <InstancesButtons
                onAfterAdd={(instanceId) => {
                  scrollToInstance(instanceId);
                }}
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
          <Box overflow="auto">
            <Heading level="1" mb="1">Messages</Heading>
            <Sidebar search={search} setSearch={setSearchAndOpen} />
          </Box>
        </SplitView>

      }
    </>
  );
};
export default Main;
