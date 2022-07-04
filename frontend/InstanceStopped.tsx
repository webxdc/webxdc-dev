import { Component, JSX } from "solid-js";
import { Flex, Tooltip, IconButton } from "@hope-ui/solid";
import { IoPlay } from "solid-icons/io";

const InstanceStopped: Component<{
  onStart: () => void;
  style: string | JSX.CSSProperties | undefined;
}> = (props) => {
  return (
    <Flex justifyContent="center" alignItems="center" style={props.style}>
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
