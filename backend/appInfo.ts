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

const MISSING_MANIFEST = {
  name: undefined,
  sourceCodeUrl: undefined,
  manifestFound: false,
};

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
    console.error("Missing manifest.toml (from URL)");
    return { ...MISSING_MANIFEST, name: "Unknown (running from URL)" };
  }
  return tomlParse(await response.text());
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
    console.error("Missing manifest.toml (from DIR)");
    return { ...MISSING_MANIFEST, name: fallbackName };
  }
  return tomlParse(tomlBuffer.toString(), fallbackName);
}

function tomlParse(s: string, fallbackName: string): any {
  try {
    const parsed = toml.parse(s);
    return {
      name:
        parsed.name || fallbackName || "Missing name entry in manifest.toml",
      sourceCodeUrl: parsed.source_code_url || undefined,
      manifestFound: true,
    };
  } catch (e) {
    console.error("Failed to parse manifest.toml, please check the format!");
    return { ...MISSING_MANIFEST, name: fallbackName };
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
