import fs from "fs";
import { resolve } from "path";

import { createTempDir, unpack } from "./unpack";

export type DirectoryLocation = {
  type: "directory";
  path: string;
  derivedName: string;
  dispose: () => void;
};

export type XdcLocation = {
  type: "xdc";
  path: string;
  filePath: string;
  derivedName: string;
  dispose: () => void;
};

export type UrlLocation = { type: "url"; url: string; dispose: () => void };

export type Location = DirectoryLocation | XdcLocation | UrlLocation;

export class LocationError extends Error {}

export function getLocation(location: string): Location {
  if (location.startsWith("http://") || location.startsWith("https://")) {
    return { type: "url", url: location, dispose: () => {} };
  }

  // Let's go easy on users and treat `localhost:8080` as
  // `http://localhost:8080`
  const localhostHostnames = ["localhost", "127.0.0.1", "[::1]"];
  const startsWithSomeLocalhost = localhostHostnames.some((host) =>
    location.startsWith(host),
  );
  if (startsWithSomeLocalhost) {
    // Let's make sure that it's actually a localhost URL and it's not something
    // like `localhost-activities/my-webxdc-app` or `localhost-enjoyers.com`.

    let urlObj: URL | undefined;
    try {
      urlObj = new URL("http://" + location);
    } catch (e) {}

    const urlHostnameIsLocalhost = localhostHostnames.some(
      (localhostString) => urlObj?.hostname === localhostString,
    );
    if (urlObj && urlHostnameIsLocalhost) {
      return { type: "url", url: urlObj.href, dispose: () => {} };
    }
  }

  const parts = location.split("/").filter((part) => part !== "");
  const lastPart = parts[parts.length - 1];

  if (!fs.existsSync(location)) {
    throw new LocationError(`Not a file or directory: ${location}`);
  }

  const stats = fs.statSync(location);
  if (location.endsWith(".xdc") && stats.isFile()) {
    const path = createTempDir();
    try {
      unpack(location, path);
    } catch (e) {
      throw new LocationError(`Not a valid xdc zip file: ${location}`);
    }
    if (!hasIndexHtml(path)) {
      throw new LocationError(
        `Invalid xdc file (no index.html file inside): ${location}`,
      );
    }
    return {
      type: "xdc",
      path,
      filePath: location,
      derivedName: lastPart.slice(0, lastPart.length - ".xdc".length),
      dispose: () => {
        fs.rmSync(path, { recursive: true });
      },
    };
  }

  if (!stats.isDirectory()) {
    throw new LocationError(`Not an xdc file or a directory: ${location}`);
  }

  if (!hasIndexHtml(location)) {
    throw new LocationError(
      `Invalid xdc dir (no index.html file): ${location}`,
    );
  }
  return {
    type: "directory",
    path: location,
    derivedName: lastPart,
    dispose: () => {},
  };
}

function hasIndexHtml(location: string): boolean {
  const p = resolve(location, "index.html");
  if (!fs.existsSync(p)) {
    return false;
  }
  return fs.statSync(p).isFile();
}
