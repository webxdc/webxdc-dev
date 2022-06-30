import { Component, createMemo } from "solid-js";
import { useSearchParams } from "solid-app-router";
import { Flex } from "@hope-ui/solid";

import Filter from "./Filter";
import { instances } from "./store";

type ParamsType = ReturnType<typeof useSearchParams>[0];
type SetParamsType = ReturnType<typeof useSearchParams>[1];

export const instanceIdEntries = createMemo(() => {
  const resolvedInstances = instances();
  const allEntry = {
    value: "*",
    text: "All instance ids",
  };
  if (resolvedInstances == null) {
    return [allEntry];
  }
  return [
    allEntry,
    ...resolvedInstances.map((instance) => ({
      value: instance.id,
      text: instance.id,
    })),
  ];
});

const Filters: Component<{
  searchParams: ParamsType;
  setSearchParams: SetParamsType;
}> = (props) => {
  return (
    <Flex justifyContent="flex-start" gap="$5">
      <Filter
        label="instanceId"
        entries={instanceIdEntries()}
        value={props.searchParams.instanceId || "*"}
        onChange={(value) => {
          if (value === "*") {
            props.setSearchParams(
              {
                ...props.searchParams,
                instanceId: undefined,
              },
              { replace: true }
            );
          } else {
            props.setSearchParams(
              {
                ...props.searchParams,
                instanceId: value,
              },
              { replace: true }
            );
          }
        }}
      />
      <Filter
        label="type"
        entries={[
          { value: "*", text: "All types" },
          { value: "sent", text: "Sent" },
          { value: "received", text: "Received" },
          { value: "connect", text: "Connect" },
          { value: "clear", text: "Clear" },
        ]}
        value={props.searchParams.type || "*"}
        onChange={(value) => {
          if (value === "*") {
            props.setSearchParams(
              { ...props.searchParams, type: undefined },
              { replace: true }
            );
          } else {
            props.setSearchParams(
              { ...props.searchParams, type: value },
              { replace: true }
            );
          }
        }}
      />
    </Flex>
  );
};

export default Filters;
