import { Component, JSX } from "solid-js";
import { Td, Tooltip, Text } from "@hope-ui/solid";

export const Ellipsis: Component<{ children: JSX.Element }> = (props) => {
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

const TooltipEllipsis: Component<{
  children: JSX.Element;
  tooltip?: JSX.Element;
}> = (props) => {
  return (
    <Tooltip label={props.tooltip || props.children}>
      <Ellipsis>{props.children}</Ellipsis>
    </Tooltip>
  );
};

export const TdEllipsis: Component<{
  children: JSX.Element;
  numeric?: boolean;
  tooltip?: JSX.Element;
}> = (props) => {
  return (
    <Td numeric={props.numeric}>
      <TooltipEllipsis tooltip={props.tooltip}>
        {props.children}
      </TooltipEllipsis>
    </Td>
  );
};
