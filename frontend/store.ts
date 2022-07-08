import { createResource } from "solid-js";

import type { Instance as InstanceData } from "../types/instance";
import type { Info } from "../types/info";

export type Search = {
  instanceId?: string;
  type?: string;
  info?: boolean;
};

const [appInfo] = createResource<Info>(async () => {
  return await (await fetch("/app-info")).json();
});

export { appInfo };

const [instances, { refetch: refetchInstances, mutate: mutateInstances }] =
  createResource<InstanceData[]>(async () => {
    return (await fetch(`/instances`)).json();
  });

export { instances, refetchInstances, mutateInstances };
