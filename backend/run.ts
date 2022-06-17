import { createFrontend, WebXdc, Instances } from "./app";
import open from "open";

export function run(directory: string): void {
  console.log("Starting Webxdc project in: ", directory);
  const webXdc: WebXdc = {
    name: "My App",
    path: directory,
  };
  const instances = new Instances(webXdc, 3000);

  const peer0 = instances.add();
  const peer1 = instances.add();

  const frontend = createFrontend(instances, false);

  frontend.listen(3000, () => {
    console.log("Starting webxdc-dev frontend");
  });

  peer0.start();
  peer1.start();

  open("http://localhost:3000");
}
