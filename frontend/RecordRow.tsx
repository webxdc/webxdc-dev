import { Component, JSX } from "solid-js";
import { Tr, Td } from "@hope-ui/solid";

const RecordRow: Component<{ label: string; children: JSX.Element }> = (
  props,
) => {
  return (
    <Tr>
      <Td>
        <strong>{props.label}</strong>
      </Td>
      <Td>{props.children}</Td>
    </Tr>
  );
};

export default RecordRow;
