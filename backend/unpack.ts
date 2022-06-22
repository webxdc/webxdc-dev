import fs from "fs";
import path from "path";
import os from "os";
import AdmZip from "adm-zip";

export function isXdcFile(location: string): boolean {
  if (
    location.startsWith("http://") ||
    location.startsWith("https://") ||
    !location.endsWith(".xdc")
  ) {
    return false;
  }
  const stats = fs.statSync(location);
  if (!stats.isFile()) {
    return false;
  }
  return true;
}

export function unpack(xdcPath: string, extractLocation: string): void {
  const zip = new AdmZip(xdcPath);
  zip.extractAllTo(extractLocation);
}

export function withTempDir(fn: (tmpDir: string) => void) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "webxdc-dev"));
  try {
    fn(tmpDir);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true });
    } catch (e) {
      console.error(
        `An error has occurred while removing the temp dir at ${tmpDir}. Error: ${e}`
      );
    }
  }
}

export function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "webxdc-dev"));
}
