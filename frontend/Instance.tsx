import { Component, Show, createSignal } from "solid-js";
import { Flex, createDisclosure, notificationService } from "@hope-ui/solid";

import { Instance as InstanceData } from "../types/instance";
import { Search } from "./Sidebar";
import InstanceStarted from "./InstanceStarted";
import InstanceStopped from "./InstanceStopped";
import InstanceHeader from "./InstanceHeader";

const Instance: Component<{
  instance: InstanceData;
  setSearch: (search: Search) => void;
}> = (props) => {
  let iframeRef: HTMLIFrameElement | undefined = undefined;
  let [dropUpdates, setDropUpdates] = createSignal(false);

  const handleReload = () => {
    if (iframeRef == null) {
      return;
    }
    setDropUpdates(false) // reset our state because inner sim/webxdc state is reset in reload
    iframeRef.contentWindow?.postMessage("reload", props.instance.url);

    notificationService.show({
      title: `Instance ${props.instance.id} reloaded`,
    });
  };

  const { isOpen, onOpen, onClose } = createDisclosure({
    defaultIsOpen: false,
  });

  const toggleDropUpdates = () => {
    if (iframeRef == null) {
      return;
    }
    setDropUpdates(!dropUpdates())
    iframeRef.contentWindow?.postMessage({ name: "dropUpdates", value: dropUpdates()}, props.instance.url)
  }

  const getStyle = () => {
    return {
      // XXX these dimensions should be configurable somehow
      height: "667px",
      width: "375px",
      "border-color": props.instance.color,
      "border-width": "7px",
      "border-style": "solid",
    };
  };

  return (
    <Flex id={"instance-" + props.instance.id} flexDirection="column">
      <InstanceHeader
        instance={props.instance}
        setSearch={props.setSearch}
        onReload={handleReload}
        onStart={onOpen}
        onStop={onClose}
        isStarted={isOpen}
        dropUpdates={dropUpdates()}
        onToggleDropUpdates={toggleDropUpdates}
      />
      <Show
        when={isOpen()}
        fallback={<InstanceStopped onStart={onOpen} style={getStyle()} />}
      >
        <InstanceStarted
          instance={props.instance}
          ref={iframeRef}
          style={getStyle()}
        />
      </Show>
    </Flex>
  );
};

export const scrollToInstance = (instanceId: string) => {
  document.getElementById("instance-" + instanceId)?.scrollIntoView();
};

export default Instance;
