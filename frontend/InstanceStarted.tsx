import { Component } from "solid-js";

import { InstanceData } from "./store";

const InstanceStarted: Component<{
  instance: InstanceData;
  ref: HTMLIFrameElement | undefined;
}> = (props) => {
  return (
    <iframe
      ref={props.ref}
      src={props.instance.url}
      style={{
        height: "667px",
        width: "375px",
        "border-color": props.instance.color,
        "border-width": "7px",
        "border-style": "solid",
      }}
    ></iframe>
  );
};

export default InstanceStarted;
