import { Component, JSX } from "solid-js";

import type { Instance as InstanceData } from "../types/instance";

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
