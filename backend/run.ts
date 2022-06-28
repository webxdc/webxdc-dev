import process from "process";
import open from "open";

import { createFrontend, Instances, InjectExpress } from "./app";
import { getLocation, Location, LocationError } from "./location";
import { getAppInfo, AppInfo, AppInfoError } from "./appInfo";

export type Inject = {
  injectFrontend: InjectExpress;
  injectSim: InjectExpress;
  getIndexHtml: () => string;
};

function actualRun(
  appInfo: AppInfo,
  basePort: number,
  inject: Inject,
  autoOpen: boolean
): void {
  const { injectFrontend, injectSim, getIndexHtml } = inject;

  const instances = new Instances(appInfo.location, injectSim, basePort);

  const numberOfInstances = 2;
  for (let i = 0; i < numberOfInstances; i++) {
    instances.add();
  }

  const frontend = createFrontend(
    appInfo,
    instances,
    injectFrontend,
    getIndexHtml,
    autoOpen
  );

  frontend.listen(basePort, () => {
    console.log("Starting webxdc-dev frontend");
  });

  instances.start();

  open("http://localhost:" + basePort);

  if (autoOpen) {
    instances.open();
  }
}

export function run(
  locationStr: string,
  basePort: number,
  inject: Inject,
  autoOpen: boolean
) {
  let location: Location;
  try {
    location = getLocation(locationStr);
  } catch (e) {
    if (e instanceof LocationError) {
      console.error(e.message);
      return;
    }
    throw e;
  }

  for (const signal in ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      location.dispose();
    });
  }

  console.log("Starting webxdc project in:", locationStr);

  getAppInfo(location)
    .then((appInfo) => {
      actualRun(appInfo, basePort, inject, autoOpen);
    })
    .catch((e) => {
      if (e instanceof AppInfoError) {
        console.error(e.message);
        return;
      }
      throw e;
    });
}
