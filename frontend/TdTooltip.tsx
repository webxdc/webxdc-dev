import { Component, JSX } from "solid-js";
import { Td, Tooltip } from "@hope-ui/solid";

import TextDynamic from "./TextDynamic";

const TdTooltip: Component<{
  children: JSX.Element;
  numeric?: boolean;
  tooltip?: JSX.Element;
}> = (props) => {
  return (
    <Td numeric={props.numeric}>
      <Tooltip label={props.tooltip || props.children}>
        <TextDynamic>{props.children}</TextDynamic>
      </Tooltip>
    </Td>
  );
};

export default TdTooltip;
