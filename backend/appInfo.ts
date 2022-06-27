import path from "path";
import fs from "fs";
import toml from "toml";
// have to use v2 otherwise end up in config hell becasue v3 is ESM only
import fetch from "node-fetch";

import { Location } from "./location";

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
};

export async function getAppInfo(location: Location): Promise<AppInfo> {
  if (location.type === "url") {
    return {
      location,
      manifest: await getManifestInfoFromUrl(location.url),
      icon: await getIconInfoFromUrl(location.url),
    };
  }
  return {
    location,
    manifest: getManifestInfoFromDir(location.path, location.derivedName),
    icon: getIconInfoFromDir(location.path),
  };
}

async function getManifestInfoFromUrl(url: string): Promise<ManifestInfo> {
  if (!url.endsWith("/")) {
    url = url + "/";
  }
  const response = await fetch(url + "manifest.toml");
  if (!response.ok) {
    return {
      name: "Unknown",
      sourceCodeUrl: undefined,
      manifestFound: false,
    };
  }
  const body = await response.text();
  const parsed = toml.parse(body);
  return {
    name: parsed.name || "Unknown",
    sourceCodeUrl: parsed.source_code_url,
    manifestFound: true,
  };
}

async function getIconInfoFromUrl(url: string): Promise<IconInfo | null> {
  if (!url.endsWith("/")) {
    url = url + "/";
  }
  const pngBuffer = await readUrlBuffer(url + "icon.png");
  if (pngBuffer != null) {
    return {
      buffer: pngBuffer,
      contentType: "image/png",
    };
  }
  const jpgBuffer = await readUrlBuffer((url = "icon.jpg"));
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
  fallbackName: string
): ManifestInfo {
  const tomlBuffer = readFileBuffer(path.join(dir, "manifest.toml"));
  if (tomlBuffer === null) {
    return {
      name: fallbackName,
      sourceCodeUrl: undefined,
      manifestFound: false,
    };
  }
  const parsed = toml.parse(tomlBuffer.toString());
  const name = parsed.name || fallbackName;
  return {
    name,
    sourceCodeUrl: parsed.source_code_url,
    manifestFound: true,
  };
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

async function readUrlBuffer(url: string): Promise<Buffer | null> {
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }

  const ab = await response.arrayBuffer();
  return Buffer.from(ab);
}
