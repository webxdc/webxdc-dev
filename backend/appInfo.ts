import path from "path";
import fs from "fs";
import toml from "toml";
// have to use v2 otherwise end up in config hell because v3 is ESM only
import nodeFetch from "node-fetch";
import pkg from "../package.json";

import { Location, UrlLocation } from "./location";
import { waitOnUrl } from "./waitOn";

const APP_INFO_TIMEOUT = 5000;

export type IconInfo = {
  buffer: Buffer;
  contentType: string;
};

export type ManifestInfo = {
  name: string;
  sourceCodeUrl?: string;
  manifestFound: boolean;
};

export type AppInfo = {
  location: Location;
  manifest: ManifestInfo;
  icon: IconInfo | null;
  toolVersion: string;
};

export class AppInfoError extends Error {}

export async function getAppInfo(location: Location): Promise<AppInfo> {
  if (location.type === "url") {
    try {
      await waitOnUrl(location.url, APP_INFO_TIMEOUT);
    } catch (e) {
      throw new AppInfoError(`Timeout. Could not access URL: ${location.url}`);
    }
    return getAppInfoUrl(location, nodeFetch);
  }
  return {
    location,
    manifest: getManifestInfoFromDir(location.path, location.derivedName),
    icon: getIconInfoFromDir(location.path),
    toolVersion: getToolVersion(),
  };
}

export async function getAppInfoUrl(
  location: UrlLocation,
  fetch: typeof nodeFetch,
): Promise<AppInfo> {
  return {
    location,
    manifest: await getManifestInfoFromUrl(location.url, fetch),
    icon: await getIconInfoFromUrl(location.url, fetch),
    toolVersion: getToolVersion(),
  };
}

export function getToolVersion(): string {
  return pkg.version || "Unknown";
}

async function getManifestInfoFromUrl(
  url: string,
  fetch: typeof nodeFetch,
): Promise<ManifestInfo> {
  if (!url.endsWith("/")) {
    url = url + "/";
  }
  const response = await fetch(url + "manifest.toml");
  if (!response.ok) {
    return {
      name: "Unknown (running from URL)",
      sourceCodeUrl: undefined,
      manifestFound: false,
    };
  }
  const body = await response.text();
  const parsed = tomlParse(body);
  return {
    name: parsed.name || "No entry in manifest.toml (running from URL)",
    sourceCodeUrl: parsed.source_code_url,
    manifestFound: true,
  };
}

async function getIconInfoFromUrl(
  url: string,
  fetch: typeof nodeFetch,
): Promise<IconInfo | null> {
  if (!url.endsWith("/")) {
    url = url + "/";
  }
  const pngBuffer = await readUrlBuffer(url + "icon.png", fetch);
  if (pngBuffer != null) {
    return {
      buffer: pngBuffer,
      contentType: "image/png",
    };
  }
  const jpgBuffer = await readUrlBuffer(url + "icon.jpg", fetch);
  if (jpgBuffer != null) {
    return {
      buffer: jpgBuffer,
      contentType: "image/jpeg",
    };
  }
  return null;
}

function getManifestInfoFromDir(
  dir: string,
  fallbackName: string,
): ManifestInfo {
  const tomlBuffer = readFileBuffer(path.join(dir, "manifest.toml"));
  if (tomlBuffer === null) {
    return {
      name: fallbackName,
      sourceCodeUrl: undefined,
      manifestFound: false,
    };
  }
  const parsed = tomlParse(tomlBuffer.toString());
  const name = parsed.name || fallbackName;
  return {
    name,
    sourceCodeUrl: parsed.source_code_url,
    manifestFound: true,
  };
}

function tomlParse(s: string): any {
  try {
    return toml.parse(s);
  } catch (e) {
    throw new AppInfoError("Invalid manifest.toml, please check the format");
  }
}

function getIconInfoFromDir(dir: string): IconInfo | null {
  const pngBuffer = readFileBuffer(path.resolve(dir, "icon.png"));
  if (pngBuffer != null) {
    return { buffer: pngBuffer, contentType: "image/png" };
  }
  const jpgBuffer = readFileBuffer(path.resolve(dir, "icon.jpg"));
  if (jpgBuffer != null) {
    return { buffer: jpgBuffer, contentType: "image/jpeg" };
  }
  return null;
}

function readFileBuffer(location: string): Buffer | null {
  if (!fs.existsSync(location)) {
    return null;
  }
  const stats = fs.statSync(location);
  if (!stats.isFile()) {
    return null;
  }
  return fs.readFileSync(location);
}

async function readUrlBuffer(
  url: string,
  fetch: typeof nodeFetch,
): Promise<Buffer | null> {
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }

  const ab = await response.arrayBuffer();
  return Buffer.from(ab);
}
