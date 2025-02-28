import process from "process";
import open from "open";

import { createFrontend, InjectExpress } from "./app";
import { Instances, Options } from "./instance";
import { getLocation, Location, LocationError } from "./location";
import { getAppInfo, AppInfo, AppInfoError } from "./appInfo";

export type Inject = {
  injectFrontend: InjectExpress;
  injectSim: InjectExpress;
  getIndexHtml: () => string;
};

async function actualRun(appInfo: AppInfo, options: Options, inject: Inject): Promise<void> {
  const { injectFrontend, injectSim, getIndexHtml } = inject;
  const instances = new Instances(appInfo, injectSim, options);

  const numberOfInstances = 2;
  for (let i = 0; i < numberOfInstances; i++) {
    instances.add();
  }

  const frontend = createFrontend(
    appInfo,
    instances,
    injectFrontend,
    getIndexHtml,
  );

  frontend.listen(options.basePort, () => {
    console.log("Starting webxdc-dev frontend");
  });

  instances.start();

  open("http://localhost:" + options.basePort);
}

export async function run(locationStr: string, options: Options, inject: Inject): Promise<void> {
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

  try {
    const appInfo = await getAppInfo(location)
    await actualRun(appInfo, options, inject);
  } catch (e) {
    if (e instanceof AppInfoError) {
      console.error(e.message);
      return;
    }
    throw e;
  }
}
