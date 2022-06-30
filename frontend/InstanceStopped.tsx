import { Component } from "solid-js";
import { Flex, Tooltip, IconButton } from "@hope-ui/solid";
import { IoPlay } from "solid-icons/io";

import { InstanceData } from "./store";

const InstanceStopped: Component<{
  instance: InstanceData;
  onStart: () => void;
}> = (props) => {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      style={{
        height: "667px",
        width: "375px",
        "border-color": props.instance.color,
        "border-width": "7px",
        "border-style": "solid",
      }}
    >
      <Tooltip label="Start">
        <IconButton
          size="xl"
          onClick={props.onStart}
          aria-label="Start"
          backgroundColor="lightgrey"
          icon={<IoPlay size={30} color="#000000" />}
        />
      </Tooltip>
    </Flex>
  );
};

export default InstanceStopped;
