import type { Component } from "solid-js";
import { For } from "solid-js";
import { createStore, produce } from "solid-js/store";

type InstanceData = {
  id: number;
  url: string;
};

const [instances, setInstances] = createStore<InstanceData[]>([
  { id: 3001, url: "http://localhost:3001" },
  { id: 3002, url: "http://localhost:3002" },
]);

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
  return (
    <>
      <h1>Webxdc-dev</h1>
      <ul>
        <For each={instances}>
          {(instance) => <Instance instance={instance} />}
        </For>
      </ul>
    </>
  );
};

export default App;
