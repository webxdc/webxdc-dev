import { createFrontend, WebXdc, Instances, InjectExpress } from "./app";
import open from "open";

export type Inject = {
  injectFrontend: InjectExpress;
  injectSim: InjectExpress;
};

export function run(directory: string, inject: Inject): void {
  console.log("Starting Webxdc project in: ", directory);
  const webXdc: WebXdc = {
    name: "My App",
    path: directory,
  };

  const { injectFrontend, injectSim } = inject;

  const instances = new Instances(webXdc, injectSim, 3000);

  const peer0 = instances.add();
  const peer1 = instances.add();

  const frontend = createFrontend(instances, injectFrontend);

  frontend.listen(3000, () => {
    console.log("Starting webxdc-dev frontend");
  });

  peer0.start();
  peer1.start();

  open("http://localhost:3000");
}
