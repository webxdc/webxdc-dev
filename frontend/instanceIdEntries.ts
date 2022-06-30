import { createMemo } from "solid-js";

import { instances } from "./store";

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
