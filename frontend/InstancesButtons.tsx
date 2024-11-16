import { Component, Show } from "solid-js";
import { Button, notificationService, Flex, Tooltip } from "@hope-ui/solid";

import type { Instance } from "../types/instance";
import { instances, clearMessages, mutateInstances } from "./store";

const CLEAR_INFO = `\
Reset both webxdc-dev server state as well as client state.
This wipes out any localStorage and sessionStorage on each client, and reloads them.`;

const InstancesButtons: Component<{
  onAfterAdd?: (instanceId: string) => void;
  show_messages_button: boolean;
  onOpenMessages: () => void;
}> = (props) => {
  const handleAddInstance = async () => {
    const instanceData: Instance = await (
      await fetch(`/instances`, { method: "POST" })
    ).json();
    // add the new instance to the end of the array
    const current = instances();
    if (current == null) {
      throw new Error("instances unexpectedly undefined");
    }
    mutateInstances([...current, instanceData]);

    if (props.onAfterAdd != null) {
      props.onAfterAdd(instanceData.id);
    }
    notificationService.show({
      title: `New instance ${instanceData.port} added`,
    });
  };

  const handleClear = async () => {
    await fetch(`/clear`, { method: "POST" });
    clearMessages();
    notificationService.show({
      title: `Resetting state of dev server & instances`,
    });
  };

  return (
    <Flex direction="row" justifyContent="flex-start" gap="$3">
      <Button colorScheme="neutral" size="xs" onClick={handleAddInstance}>
        Add Instance
      </Button>
      <Tooltip label={CLEAR_INFO}>
        <Button colorScheme="neutral" size="xs" onClick={handleClear}>
          Reset
        </Button>
      </Tooltip>
      <Show when={props.show_messages_button}>
        <Button colorScheme="neutral" size="xs" onClick={props.onOpenMessages}>
          Open Messages
        </Button>
      </Show>
    </Flex>
  );
};

export default InstancesButtons;
