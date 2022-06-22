import { createFrontend, Instances, InjectExpress } from "./app";
import open from "open";

export type Inject = {
  injectFrontend: InjectExpress;
  injectSim: InjectExpress;
};

export function run(
  location: string,
  start_port: number,
  inject: Inject
): void {
  console.log("Starting webxdc project in: ", location);

  const { injectFrontend, injectSim } = inject;

  const instances = new Instances(location, injectSim, start_port);

  const peer0 = instances.add();
  const peer1 = instances.add();

  const frontend = createFrontend(instances, injectFrontend);

  frontend.listen(start_port, () => {
    console.log("Starting webxdc-dev frontend");
  });

  peer0.start();
  peer1.start();

  open("http://localhost:" + start_port);
}
