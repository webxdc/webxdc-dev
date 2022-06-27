import process from "process";
import fs from "fs";

import open from "open";

import { createFrontend, Instances, InjectExpress } from "./app";
import { isXdcFile, unpack, createTempDir } from "./unpack";

export type Inject = {
  injectFrontend: InjectExpress;
  injectSim: InjectExpress;
  getIndexHtml: () => string;
};

function actualRun(location: string, basePort: number, inject: Inject): void {
  const { injectFrontend, injectSim, getIndexHtml } = inject;

  const instances = new Instances(location, injectSim, basePort);

  const peer0 = instances.add();
  const peer1 = instances.add();

  const frontend = createFrontend(instances, injectFrontend, getIndexHtml);

  frontend.listen(basePort, () => {
    console.log("Starting webxdc-dev frontend");
  });

  peer0.start();
  peer1.start();

  open("http://localhost:" + basePort);
}

export function run(location: string, basePort: number, inject: Inject) {
  console.log("Starting webxdc project in: ", location);
  if (isXdcFile(location)) {
    const tmpDir = createTempDir();
    console.log("TEMP DIR", tmpDir);
    unpack(location, tmpDir);
    actualRun(tmpDir, basePort, inject);

    for (const signal in ["SIGINT", "SIGTERM"]) {
      process.on(signal, () => {
        console.log("clean up");
        fs.rmSync(tmpDir, { recursive: true });
      });
    }
  } else {
    actualRun(location, basePort, inject);
  }
}
