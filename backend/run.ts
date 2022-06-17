import { createFrontend, WebXdc, Instances, InjectExpress } from "./app";
import open from "open";

export function run(directory: string, inject: InjectExpress): void {
  console.log("Starting Webxdc project in: ", directory);
  const webXdc: WebXdc = {
    name: "My App",
    path: directory,
  };
  const instances = new Instances(webXdc, 3000);

  const peer0 = instances.add();
  const peer1 = instances.add();

  const frontend = createFrontend(instances, inject);

  frontend.listen(3000, () => {
    console.log("Starting webxdc-dev frontend");
  });

  peer0.start();
  peer1.start();

  open("http://localhost:3000");
}
