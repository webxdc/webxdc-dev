import path from "path";
import fs from "fs";

import { getLocation, LocationError } from "./location";

test("directory location with index.html", async () => {
  const dir = path.resolve(__dirname, "fixtures/minimal");
  const location = await getLocation(dir);
  expect(location.type).toEqual("directory");
  // help ts
  if (location.type !== "directory") {
    return;
  }
  expect(location.path).toEqual(dir);
  expect(location.derivedName).toEqual("minimal");
  expect(() => location.dispose()).not.toThrow();
});

test("directory location with index.html with trailing slash", async () => {
  const dir = path.resolve(__dirname, "fixtures/minimal/");
  const location = await getLocation(dir);
  expect(location.type).toEqual("directory");
  // help ts
  if (location.type !== "directory") {
    return;
  }
  expect(location.path).toEqual(dir);
  expect(location.derivedName).toEqual("minimal");
  expect(() => location.dispose()).not.toThrow();
});

test("invalid directory location without index.html", async () => {
  const dir = path.resolve(__dirname, "fixtures/invalid");
  try {
    await getLocation(dir);
  } catch (e) {
    expect(e).toBeInstanceOf(LocationError);
  }
  expect.assertions(1);
});

test("xdc file", async () => {
  const filePath = path.resolve(__dirname, "fixtures/clean.xdc");
  const location = await getLocation(filePath);
  expect(location.type).toEqual("xdc");
  // help ts
  if (location.type !== "xdc") {
    return;
  }
  expect(location.filePath).toEqual(filePath);
  expect(location.derivedName).toEqual("clean");

  const stats = fs.statSync(location.path);
  expect(stats.isDirectory()).toBeTruthy();

  expect(() => location.dispose()).not.toThrow();

  expect(fs.existsSync(location.path)).toBeFalsy();
});

test("xdc file with invalid zip", async () => {
  const filePath = path.resolve(__dirname, "fixtures/invalid.xdc");
  try {
    await getLocation(filePath);
  } catch (e) {
    expect(e).toBeInstanceOf(LocationError);
  }
  expect.assertions(1);
});

test("a non-xdc file cannot be handled", async () => {
  const filePath = path.resolve(__dirname, "fixtures/notXdc");
  try {
    await getLocation(filePath);
  } catch (e) {
    expect(e).toBeInstanceOf(LocationError);
  }
  expect.assertions(1);
});

test("directory is never xdc file", async () => {
  const filePath = path.resolve(__dirname, "fixtures/notXdcDir.xdc");
  const location = await getLocation(filePath);
  expect(location.type).toEqual("directory");
  // help ts
  if (location.type !== "directory") {
    return;
  }
  expect(location.path).toEqual(filePath);
  expect(location.derivedName).toEqual("notXdcDir.xdc");
  expect(() => location.dispose()).not.toThrow();
});

test("url", async () => {
  const location = await getLocation("http://example.com");
  expect(location.type).toEqual("url");
  // help ts
  if (location.type !== "url") {
    return;
  }
  expect(location.url).toEqual("http://example.com");
  expect(() => location.dispose()).not.toThrow();
});
