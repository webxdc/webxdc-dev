import { Component, JSX } from "solid-js";
import { Text } from "@hope-ui/solid";

const TextDynamic: Component<{ children: JSX.Element }> = (props) => {
  return (
    <Text
      noOfLines={1}
      fontSize={{
        "@initial": "8px",
        "@sm": "8px",
        "@md": "10px",
        "@lg": "12px",
      }}
    >
      {props.children}
    </Text>
  );
};

export default TextDynamic;
