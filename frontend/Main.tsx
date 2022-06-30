import { Component, For, createSignal, Show, Setter, JSX } from "solid-js";
import {
  Flex,
  Box,
  Tooltip,
  IconButton,
  createDisclosure,
} from "@hope-ui/solid";
import { IoCaretBackOutline, IoCaretForwardOutline } from "solid-icons/io";

import { instances, InstanceData } from "./store";
import InstancesButtons from "./InstancesButtons";
import { scrollToDevice } from "./scroll";
import Messages, { Search } from "./Messages";
import Instance from "./Instance";

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
      <Flex justifyContent="space-between">
        <Flex flexDirection="column">
          <Box m="$8" ml="$1">
            <Flex flexWrap="wrap" gap="$5" overflow="scroll" maxHeight="77vh">
              <For each={instances()}>
                {(instance: InstanceData) => (
                  <Instance instance={instance} setSearch={setSearchAndOpen} />
                )}
              </For>
            </Flex>
          </Box>
          <InstancesButtons
            onAfterAdd={(instanceId) => {
              scrollToDevice(instanceId);
            }}
          />
        </Flex>
        <Box height="100wh">
          <Show
            when={isOpen()}
            fallback={
              <SidebarButton
                label="Open messages"
                onClick={onOpen}
                top="2rem"
                right="-2rem"
                icon={<IoCaretBackOutline size={22} color="#000000" />}
              />
            }
          >
            <SidebarButton
              label="Close messages"
              onClick={onClose}
              top="2rem"
              right="2rem"
              icon={<IoCaretForwardOutline size={22} color="#000000" />}
            />
            <Messages search={search} setSearch={setSearchAndOpen} />
          </Show>
        </Box>
      </Flex>
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
