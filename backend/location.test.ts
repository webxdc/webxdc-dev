import path from "path";
import fs from "fs";

import { getLocation, LocationError } from "./location";

test("directory location with index.html", () => {
  const dir = path.resolve(__dirname, "fixtures/minimal");
  const location = getLocation(dir);
  expect(location.type).toEqual("directory");
  // help ts
  if (location.type !== "directory") {
    return;
  }
  expect(location.path).toEqual(dir);
  expect(location.derivedName).toEqual("minimal");
  expect(() => location.dispose()).not.toThrow();
});

test("directory location with index.html with trailing slash", () => {
  const dir = path.resolve(__dirname, "fixtures/minimal/");
  const location = getLocation(dir);
  expect(location.type).toEqual("directory");
  // help ts
  if (location.type !== "directory") {
    return;
  }
  expect(location.path).toEqual(dir);
  expect(location.derivedName).toEqual("minimal");
  expect(() => location.dispose()).not.toThrow();
});

test("invalid directory location without index.html", () => {
  const dir = path.resolve(__dirname, "fixtures/invalid");
  try {
    getLocation(dir);
  } catch (e) {
    expect(e).toBeInstanceOf(LocationError);
  }
  expect.assertions(1);
});

test("xdc file", () => {
  const filePath = path.resolve(__dirname, "fixtures/clean.xdc");
  const location = getLocation(filePath);
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

test("xdc file with invalid zip", () => {
  const filePath = path.resolve(__dirname, "fixtures/invalid.xdc");
  try {
    getLocation(filePath);
  } catch (e) {
    expect(e).toBeInstanceOf(LocationError);
  }
  expect.assertions(1);
});

test("a non-xdc file cannot be handled", () => {
  const filePath = path.resolve(__dirname, "fixtures/notXdc");
  try {
    getLocation(filePath);
  } catch (e) {
    expect(e).toBeInstanceOf(LocationError);
  }
  expect.assertions(1);
});

test("directory is never xdc file", () => {
  const filePath = path.resolve(__dirname, "fixtures/notXdcDir.xdc");
  const location = getLocation(filePath);
  expect(location.type).toEqual("directory");
  // help ts
  if (location.type !== "directory") {
    return;
  }
  expect(location.path).toEqual(filePath);
  expect(location.derivedName).toEqual("notXdcDir.xdc");
  expect(() => location.dispose()).not.toThrow();
});

test("url", () => {
  const location = getLocation("http://example.com");
  expect(location.type).toEqual("url");
  // help ts
  if (location.type !== "url") {
    return;
  }
  expect(location.url).toEqual("http://example.com");
  expect(() => location.dispose()).not.toThrow();
});
