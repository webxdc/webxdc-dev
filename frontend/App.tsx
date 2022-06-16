import type { Component } from "solid-js";
import { For, createResource } from "solid-js";

type InstanceData = {
  id: number;
  url: string;
};

const [instances, { refetch: refetchInstances }] = createResource<
  InstanceData[]
>(async () => {
  return (await fetch(`/instances`)).json();
});

const Instance: Component<{ instance: InstanceData }> = (props) => {
  return (
    <li>
      <a target="_blank" href={props.instance.url}>
        {props.instance.id}
      </a>
    </li>
  );
};

const App: Component = () => {
  const handleAddInstance = async () => {
    await fetch(`/instances`, { method: "POST" });
    refetchInstances();
  };

  return (
    <>
      <h1>Webxdc-dev</h1>
      <ul>
        <For each={instances()}>
          {(instance) => <Instance instance={instance} />}
        </For>
      </ul>
      <button onClick={handleAddInstance}>Add Instance</button>
    </>
  );
};

export default App;
