import { Component, JSX } from "solid-js";
import { Td, Tooltip, Text } from "@hope-ui/solid";

export const TextDynamic: Component<{ children: JSX.Element }> = (props) => {
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

const TextDynamicTooltip: Component<{
  children: JSX.Element;
  tooltip?: JSX.Element;
}> = (props) => {
  return (
    <Tooltip label={props.tooltip || props.children}>
      <TextDynamic>{props.children}</TextDynamic>
    </Tooltip>
  );
};

export const TdTooltip: Component<{
  children: JSX.Element;
  numeric?: boolean;
  tooltip?: JSX.Element;
}> = (props) => {
  return (
    <Td numeric={props.numeric}>
      <TextDynamicTooltip tooltip={props.tooltip}>
        {props.children}
      </TextDynamicTooltip>
    </Td>
  );
};
