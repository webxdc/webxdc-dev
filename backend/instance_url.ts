import { isWebContainer, HostURL } from '@webcontainer/env';

export function getInstanceUrl(port: number) {
  if (isWebContainer()) {
    // stackblitz / webcontainer uses different url to represent different ports.
    // This is why we need to convert it here.
    return HostURL.parse(`https://localhost:${port}`).href;
  }
  return `http://localhost:${port}`;
}
