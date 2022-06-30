import { Component, Show } from "solid-js";
import { Flex, createDisclosure } from "@hope-ui/solid";

import { InstanceData } from "./store";
import { Search } from "./Messages";
import InstanceStopped from "./InstanceStopped";
import InstanceHeader from "./InstanceHeader";

const Instance: Component<{
  instance: InstanceData;
  setSearch: (search: Search) => void;
}> = (props) => {
  let iframe_ref: HTMLIFrameElement | undefined = undefined;

  const handleReload = () => {
    if (iframe_ref == null) {
      return;
    }

    iframe_ref.contentWindow?.postMessage("reload", props.instance.url);
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
        <iframe
          ref={iframe_ref}
          src={props.instance.url}
          style={{
            height: "667px",
            width: "375px",
            "border-color": props.instance.color,
            "border-width": "7px",
            "border-style": "solid",
          }}
        ></iframe>
      </Show>
    </Flex>
  );
};

export const scrollToInstance = (instanceId: string) => {
  document.getElementById("instance-" + instanceId)?.scrollIntoView();
};

export default Instance;
