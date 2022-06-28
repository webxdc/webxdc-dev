import path from "path";

import { getLocation, UrlLocation } from "./location";
import { AppInfoError, getAppInfo, getAppInfoUrl } from "./appInfo";

test("minimal directory app info", async () => {
  const location = getLocation(path.resolve(__dirname, "fixtures", "minimal"));
  const appInfo = await getAppInfo(location);
  expect(appInfo.location).toEqual(location);
  expect(appInfo.manifest).toEqual({
    name: "minimal",
    sourceCodeUrl: undefined,
    manifestFound: false,
  });
  expect(appInfo.icon).toBeNull();
});

test("directory app info with manifest", async () => {
  const location = getLocation(
    path.resolve(__dirname, "fixtures", "withManifest")
  );
  const appInfo = await getAppInfo(location);
  expect(appInfo.location).toEqual(location);
  expect(appInfo.manifest).toEqual({
    name: "With Manifest App",
    sourceCodeUrl: "http://example.com",
    manifestFound: true,
  });
  expect(appInfo.icon).toBeNull();
});

test("directory app info with manifest but no name entry", async () => {
  const location = getLocation(
    path.resolve(__dirname, "fixtures", "withManifestWithoutName")
  );
  const appInfo = await getAppInfo(location);
  expect(appInfo.location).toEqual(location);
  expect(appInfo.manifest).toEqual({
    name: "withManifestWithoutName",
    sourceCodeUrl: "http://example.com",
    manifestFound: true,
  });
  expect(appInfo.icon).toBeNull();
});

// Would like to enable this test, but a broken manifest.toml fixture
// causes vscode to freak out with red files and I don't know how to disable
// test("directory app info with broken manifest", async () => {
//   const location = getLocation(
//     path.resolve(__dirname, "fixtures", "withBrokenManifest")
//   );
//   try {
//     await getAppInfo(location);
//   } catch (e) {
//     if (e instanceof AppInfoError) {
//       expect(e.message).toEqual(
//         "Invalid manifest.toml, please check the format"
//       );
//     } else {
//       throw e;
//     }
//   }
// });

test("directory app info with jpg icon", async () => {
  const location = getLocation(
    path.resolve(__dirname, "fixtures", "withJpgIcon")
  );
  const appInfo = await getAppInfo(location);
  expect(appInfo.location).toEqual(location);
  expect(appInfo.manifest).toEqual({
    name: "withJpgIcon",
    sourceCodeUrl: undefined,
    manifestFound: false,
  });
  expect(appInfo.icon).toBeDefined();
  // help ts
  if (appInfo.icon == null) {
    return;
  }
  expect(appInfo.icon).toMatchObject({ contentType: "image/jpeg" });
});

test("directory app info with png icon", async () => {
  const location = getLocation(
    path.resolve(__dirname, "fixtures", "withPngIcon")
  );
  const appInfo = await getAppInfo(location);
  expect(appInfo.location).toEqual(location);
  expect(appInfo.manifest).toEqual({
    name: "withPngIcon",
    sourceCodeUrl: undefined,
    manifestFound: false,
  });
  expect(appInfo.icon).toBeDefined();
  // help ts
  if (appInfo.icon == null) {
    return;
  }
  expect(appInfo.icon).toMatchObject({ contentType: "image/png" });
});

test("url app info without manifest or icon", async () => {
  const seenUrls: string[] = [];

  const fetch = async (url: any): Promise<any> => {
    seenUrls.push(url);
    return {
      ok: false,
    };
  };
  fetch.isRedirect = () => false;

  const location = getLocation("http://localhost:3000") as UrlLocation;
  const appInfo = await getAppInfoUrl(location, fetch);

  expect(appInfo.location).toEqual(location);
  expect(appInfo.manifest).toEqual({
    name: "Unknown (running from URL)",
    sourceCodeUrl: undefined,
    manifestFound: false,
  });
  expect(appInfo.icon).toBeNull();
  expect(seenUrls).toEqual([
    "http://localhost:3000/manifest.toml",
    "http://localhost:3000/icon.png",
    "http://localhost:3000/icon.jpg",
  ]);
});

test("url app info with manifest", async () => {
  const seenUrls: string[] = [];

  const fetch = async (url: any): Promise<any> => {
    seenUrls.push(url);
    if (url.endsWith("manifest.toml")) {
      return {
        ok: true,
        text: async () => `name = "test"`,
      };
    }
    return {
      ok: false,
    };
  };
  fetch.isRedirect = () => false;

  const location = getLocation("http://localhost:3000") as UrlLocation;
  const appInfo = await getAppInfoUrl(location, fetch);

  expect(appInfo.location).toEqual(location);
  expect(appInfo.manifest).toEqual({
    name: "test",
    sourceCodeUrl: undefined,
    manifestFound: true,
  });
  expect(appInfo.icon).toBeNull();
  expect(seenUrls).toEqual([
    "http://localhost:3000/manifest.toml",
    "http://localhost:3000/icon.png",
    "http://localhost:3000/icon.jpg",
  ]);
});

test("url app info with manifest without name", async () => {
  const fetch = async (url: any): Promise<any> => {
    if (url.endsWith("manifest.toml")) {
      return {
        ok: true,
        text: async () => `source_code_url = "http://example.com"`,
      };
    }
    return {
      ok: false,
    };
  };
  fetch.isRedirect = () => false;

  const location = getLocation("http://localhost:3000") as UrlLocation;
  const appInfo = await getAppInfoUrl(location, fetch);

  expect(appInfo.location).toEqual(location);
  expect(appInfo.manifest).toEqual({
    name: "No entry in manifest.toml (running from URL)",
    sourceCodeUrl: "http://example.com",
    manifestFound: true,
  });
});

test("url app info with broken manifest", async () => {
  const seenUrls: string[] = [];

  const fetch = async (url: any): Promise<any> => {
    seenUrls.push(url);
    if (url.endsWith("manifest.toml")) {
      return {
        ok: true,
        text: async () => `not valid toml`,
      };
    }
    return {
      ok: false,
    };
  };
  fetch.isRedirect = () => false;

  const location = getLocation("http://localhost:3000") as UrlLocation;
  try {
    await getAppInfoUrl(location, fetch);
  } catch (e) {
    if (e instanceof AppInfoError) {
      expect(e.message).toEqual(
        "Invalid manifest.toml, please check the format"
      );
    } else {
      throw e;
    }
  }
  expect.assertions(1);
});

test("url app info with manifest and source code URL", async () => {
  const seenUrls: string[] = [];

  const fetch = async (url: any): Promise<any> => {
    seenUrls.push(url);
    if (url.endsWith("manifest.toml")) {
      return {
        ok: true,
        text: async () =>
          `name = "test"\nsource_code_url = "http://example.com"`,
      };
    }
    return {
      ok: false,
    };
  };
  fetch.isRedirect = () => false;

  const location = getLocation("http://localhost:3000") as UrlLocation;
  const appInfo = await getAppInfoUrl(location, fetch);

  expect(appInfo.location).toEqual(location);
  expect(appInfo.manifest).toEqual({
    name: "test",
    sourceCodeUrl: "http://example.com",
    manifestFound: true,
  });
  expect(appInfo.icon).toBeNull();
  expect(seenUrls).toEqual([
    "http://localhost:3000/manifest.toml",
    "http://localhost:3000/icon.png",
    "http://localhost:3000/icon.jpg",
  ]);
});

test("url app info with png icon", async () => {
  const seenUrls: string[] = [];

  const fetch = async (url: any): Promise<any> => {
    seenUrls.push(url);
    if (url.endsWith("icon.png")) {
      return {
        ok: true,
        arrayBuffer: async () => [],
      };
    }
    return {
      ok: false,
    };
  };
  fetch.isRedirect = () => false;

  const location = getLocation("http://localhost:3000") as UrlLocation;
  const appInfo = await getAppInfoUrl(location, fetch);

  expect(appInfo.location).toEqual(location);
  expect(appInfo.manifest).toEqual({
    name: "Unknown (running from URL)",
    sourceCodeUrl: undefined,
    manifestFound: false,
  });
  expect(appInfo.icon).toMatchObject({ contentType: "image/png" });
  expect(seenUrls).toEqual([
    "http://localhost:3000/manifest.toml",
    "http://localhost:3000/icon.png",
  ]);
});

test("url app info with jpg icon", async () => {
  const seenUrls: string[] = [];

  const fetch = async (url: any): Promise<any> => {
    seenUrls.push(url);
    if (url.endsWith("icon.jpg")) {
      return {
        ok: true,
        arrayBuffer: async () => [],
      };
    }
    return {
      ok: false,
    };
  };
  fetch.isRedirect = () => false;

  const location = getLocation("http://localhost:3000") as UrlLocation;
  const appInfo = await getAppInfoUrl(location, fetch);

  expect(appInfo.location).toEqual(location);
  expect(appInfo.manifest).toEqual({
    name: "Unknown (running from URL)",
    sourceCodeUrl: undefined,
    manifestFound: false,
  });
  expect(appInfo.icon).toMatchObject({ contentType: "image/jpeg" });
  expect(seenUrls).toEqual([
    "http://localhost:3000/manifest.toml",
    "http://localhost:3000/icon.png",
    "http://localhost:3000/icon.jpg",
  ]);
});
