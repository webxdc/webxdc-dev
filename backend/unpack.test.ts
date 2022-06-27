import path from "path";
import fs from "fs";
import { withTempDir, unpack } from "./unpack";

test("withTempDir", () => {
  let createdTmpDir: string | null = null;
  withTempDir((tmpDir) => {
    createdTmpDir = tmpDir;
    const stats = fs.statSync(createdTmpDir!);
    expect(stats.isDirectory()).toBeTruthy();
  });
  // we expect a createdTmpDir
  expect(createdTmpDir).not.toBeNull();
  // afterwards the dir is gone again
  expect(fs.existsSync(createdTmpDir!)).toBeFalsy();
});

test("withTempDir with error", () => {
  let createdTmpDir: string | null = null;
  expect(() => {
    withTempDir((tmpDir) => {
      createdTmpDir = tmpDir;
      // an error occurs dealing with the tmpDir
      throw new Error();
    });
  }).toThrowError();
  // we expect a createdTmpDir
  expect(createdTmpDir).not.toBeNull();
  // afterwards the dir is gone again, even in the face of the error
  expect(fs.existsSync(createdTmpDir!)).toBeFalsy();
});

test("unpack", () => {
  withTempDir((tmpDir) => {
    unpack(path.resolve(__dirname, "fixtures/clean.xdc"), tmpDir);
    const stats = fs.statSync(path.resolve(tmpDir, "manifest.toml"));
    expect(stats.isFile()).toBeTruthy();
  });
  expect.assertions(1);
});
