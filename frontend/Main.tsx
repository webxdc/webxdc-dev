import { Component, For, createSignal, Show, Setter, JSX } from "solid-js";
import {
  Flex,
  Box,
  Tooltip,
  IconButton,
  createDisclosure,
  Heading,
} from "@hope-ui/solid";
import { IoCaretBackOutline, IoCaretForwardOutline } from "solid-icons/io";

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
            <Box>
              <Flex flexWrap="wrap" gap="$5">
                <For each={instances()}>
                  {(instance: InstanceData) => (
                    <Instance instance={instance} setSearch={setSearchAndOpen} />
                  )}
                </For>
              </Flex>
            </Box>
          </Flex>
          <Box>
            <Box position="sticky" top="20px">
              <Heading level="1" mb="1">Messages</Heading>
              <Sidebar search={search} setSearch={setSearchAndOpen} />
            </Box>
          </Box>
        </SplitView>

      }
    </>
  );
};

const SidebarButton: Component<{
  label: string;
  onClick: () => void;
  icon: JSX.Element;
  top: string;
  right: string;
}> = (props) => {
  return (
    <Tooltip label={props.label}>
      <IconButton
        variant="ghost"
        size="sm"
        position="relative"
        top={props.top}
        right={props.right}
        onClick={props.onClick}
        aria-label={props.label}
        backgroundColor="white"
        icon={props.icon}
      />
    </Tooltip>
  );
};

export default Main;
