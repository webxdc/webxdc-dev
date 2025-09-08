import { isWebContainer, HostURL } from "@webcontainer/env";
import { env } from "process";

export function getInstanceUrl(port: number) {
  if (isWebContainer()) {
    // stackblitz / webcontainer uses different url to represent different ports.
    // This is why we need to convert it here.
    return HostURL.parse(`https://localhost:${port}`).href;
  }
  if (env["CODESPACE_NAME"]) {
    return `${env["CODESPACE_NAME"]}-${port}.app.github.dev`;
  }

  return `http://localhost:${port}`;
}
