import waitOn from "wait-on";

export async function waitOnUrl(url: string, timeout: number): Promise<void> {
  return waitOn({
    // we don't want to do a HEAD check, just a GET check
    resources: [url.replace("http:", "http-get:")],
    // workaround https://github.com/jeffbski/wait-on/issues/78#issuecomment-867813529
    headers: {
      accept: "text/html",
    },
    timeout,
  });
}
