import process from "process";
import open from "open";

import { createFrontend, Instances, InjectExpress } from "./app";
import { getLocation } from "./location";
import { getAppInfo, AppInfo } from "./appInfo";

export type Inject = {
  injectFrontend: InjectExpress;
  injectSim: InjectExpress;
  getIndexHtml: () => string;
};

function actualRun(appInfo: AppInfo, basePort: number, inject: Inject): void {
  const { injectFrontend, injectSim, getIndexHtml } = inject;

  const instances = new Instances(appInfo.location, injectSim, basePort);

  const peer0 = instances.add();
  const peer1 = instances.add();

  const frontend = createFrontend(
    appInfo,
    instances,
    injectFrontend,
    getIndexHtml
  );

  frontend.listen(basePort, () => {
    console.log("Starting webxdc-dev frontend");
  });

  peer0.start();
  peer1.start();

  open("http://localhost:" + basePort);
}

export function run(locationStr: string, basePort: number, inject: Inject) {
  const location = getLocation(locationStr);
  for (const signal in ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      location.dispose();
    });
  }

  console.log("Starting webxdc project in: ", location);

  getAppInfo(location).then((appInfo) => {
    actualRun(appInfo, basePort, inject);
  });
}
