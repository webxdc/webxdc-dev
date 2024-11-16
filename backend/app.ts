import express, { Express } from "express";
import expressWs from "express-ws";
import { createProxyMiddleware } from "http-proxy-middleware";
import bodyParser from "body-parser";

import { Location } from "./location";
import { AppInfo } from "./appInfo";
import { Instances } from "./instance";
import type { Info } from "../types/info";
import type { Instance } from "../types/instance";

const SIMULATOR_PATHS = ["/webxdc.js", "/webxdc", "/webxdc/.websocket"];
// Real CSP is here. Need to periodically sync it.
/*
curl -L https://github.com/deltachat/deltachat-desktop/raw/master/src/main/deltachat/webxdc.ts | grep -i "default-src" -B 2 -A 8
*/
const CONTENT_SECURITY_POLICY = `default-src 'self';\
style-src 'self' 'unsafe-inline' blob: ;\
font-src 'self' data: blob: ;\
script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: ;\
connect-src 'self' data: blob: ;\
img-src 'self' data: blob: ;\
media-src 'self' data: blob: ;\
webrtc 'block'"`;

export type InjectExpress = (app: Express) => void;

export function createFrontend(
  appInfo: AppInfo,
  instances: Instances,
  injectFrontend: InjectExpress,
  getIndexHtml: () => string,
): expressWs.Application {
  const expressApp = express();
  const wsInstance = expressWs(expressApp);
  const app = wsInstance.app;
  // inject how to serve the frontend; this is
  // different in dev mode and in production
  injectFrontend(app as unknown as Express);

  app.use(bodyParser.json());

  app.get<{}, Info>("/app-info", (req, res) => {
    res.json({
      name: appInfo.manifest.name,
      iconUrl: appInfo.icon ? "/icon" : null,
      sourceCodeUrl: appInfo.manifest.sourceCodeUrl,
      manifestFound: appInfo.manifest.manifestFound,
      toolVersion: appInfo.toolVersion,
    });
  });
  app.get<{}>("/icon", (req, res) => {
    if (appInfo.icon == null) {
      res.sendStatus(404);
      return;
    }
    res.send(appInfo.icon.buffer);
  });
  app.get<{}, Instance[]>("/instances", (req, res) => {
    res.json(instances.list());
  });
  app.post<{}, Instance>("/instances", (req, res) => {
    const instance = instances.add();
    instance.start();
    res.json({
      id: instance.id,
      port: instance.port,
      url: instance.url,
      color: instance.color,
    });
  });
  app.delete<{ id: string }, Instance[]>("/instances/:id", (req, res) => {
    instances.delete(parseInt(req.params.id));
    res.json(instances.list());
  });

  app.post<{}, { status: string }>("/clear", (req, res) => {
    instances.clear();
    res.json({
      status: "ok",
    });
  });

  app.post<any, { status: string }>("/fake-update", (req, res) => {
    const instanceId = Array.from(instances.instances.keys())[0];
    const instance = instances.instances.get(instanceId);
    instance?.webXdc.sendUpdate({ payload: req.body }, "fake update");
    res.json({
      status: "ok",
    });
  });

  app.ws("/webxdc-message", (ws, req) => {
    instances.onMessage((message) => {
      ws.send(JSON.stringify(message));
    });
  });

  // fallback to send index.html to serve frontend router
  app.get("*", (req, res) => {
    res.sendFile(getIndexHtml());
  });
  return app;
}

type PeerOptions = {
  location: Location;
  injectSim: InjectExpress;
  csp: boolean;
  instanceUrl: string;
};

export function createPeer(options: PeerOptions): expressWs.Instance {
  const expressApp = express();
  const wsInstance = expressWs(expressApp);

  // layer the simulated directory with webxdc tooling in front of webxdc path
  // this has to be injected as it differs between dev and production
  options.injectSim(wsInstance.app as unknown as Express);

  const location = options.location;

  if (options.csp) {
    wsInstance.app.use((req, res, next) => {
      const contentSecurityPolicy = getContentSecurityPolicy(
        location,
        options.instanceUrl,
      );
      res.setHeader("Content-Security-Policy", contentSecurityPolicy);
      next();
    });
  }

  if (location.type === "url") {
    // serve webxdc project from URL by proxying
    const filter = (pathname: string) => {
      // make sure we don't proxy any path to do with the simulator
      return !SIMULATOR_PATHS.includes(pathname);
    };
    wsInstance.app.use(
      "/",
      createProxyMiddleware(filter, {
        target: location.url,
        ws: false,
      }),
    );
  } else {
    // serve webxdc project from directory
    wsInstance.app.use(express.static(location.path));
  }
  return wsInstance;
}

function getContentSecurityPolicy(
  location: Location,
  instanceUrl: string,
): string {
  const connectSrcUrls = [];

  // Safari/webkit at least up to version 15.5 has a bug that makes
  // "connect-src 'self'" incorrectly not allow access for web sockets
  // https://github.com/w3c/webappsec-csp/issues/7
  // we work around it by explicitly adding the instance URL to connect-src
  // When this has been fixed in Safara, this line can be removed
  connectSrcUrls.push(wsUrl(instanceUrl));

  if (location.type === "url") {
    // allow connection to websockets on proxied host, so that we
    // support HMR with systems like vite
    connectSrcUrls.push(wsUrl(location.url));
  }

  let policy = CONTENT_SECURITY_POLICY;

  if (connectSrcUrls.length === 0) {
    return policy;
  }

  return policy.replace(
    /connect-src (.*?);/,
    `connect-src $1 ${connectSrcUrls.join(" ")} ;`,
  );
}

function wsUrl(httpUrl: string): string {
  return httpUrl.replace("http://", "ws://");
}
