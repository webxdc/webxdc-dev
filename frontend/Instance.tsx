import { Component, Show } from "solid-js";
import { Flex, createDisclosure, notificationService } from "@hope-ui/solid";

import { InstanceData } from "./store";
import { Search } from "./Messages";
import InstanceStarted from "./InstanceStarted";
import InstanceStopped from "./InstanceStopped";
import InstanceHeader from "./InstanceHeader";

const Instance: Component<{
  instance: InstanceData;
  setSearch: (search: Search) => void;
}> = (props) => {
  let iframeRef: HTMLIFrameElement | undefined = undefined;

  const handleReload = () => {
    console.log(iframeRef);
    if (iframeRef == null) {
      return;
    }

    iframeRef.contentWindow?.postMessage("reload", props.instance.url);

    notificationService.show({
      title: `Instance ${props.instance.id} reloaded`,
    });
  };

  const { isOpen, onOpen, onClose } = createDisclosure({
    defaultIsOpen: false,
  });

  return (
    <Flex id={"instance-" + props.instance.id} flexDirection="column">
      <InstanceHeader
        instance={props.instance}
        setSearch={props.setSearch}
        onReload={handleReload}
        onStart={onOpen}
        onStop={onClose}
        isStarted={isOpen}
      />
      <Show
        when={isOpen()}
        fallback={
          <InstanceStopped instance={props.instance} onStart={onOpen} />
        }
      >
        <InstanceStarted instance={props.instance} ref={iframeRef} />
      </Show>
    </Flex>
  );
};

export const scrollToInstance = (instanceId: string) => {
  document.getElementById("instance-" + instanceId)?.scrollIntoView();
};

export default Instance;
