import { Component, JSX } from "solid-js";

import { InstanceData } from "./store";

const InstanceStarted: Component<{
  instance: InstanceData;
  ref: HTMLIFrameElement | undefined;
  style: string | JSX.CSSProperties | undefined;
}> = (props) => {
  return (
    <iframe
      ref={props.ref}
      src={props.instance.url}
      style={props.style}
    ></iframe>
  );
};

export default InstanceStarted;
