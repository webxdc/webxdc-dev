import express, { Express } from "express";
import expressWs from "express-ws";
import { createProxyMiddleware } from "http-proxy-middleware";
import bodyParser from "body-parser";

import { Location } from "./location";
import { AppInfo } from "./appInfo";
import { Instances } from "./instance";

const SIMULATOR_PATHS = ["/webxdc.js", "/webxdc", "/webxdc/.websocket"];
const CONTENT_SECURITY_POLICY = `default-src 'self';\
style-src 'self' 'unsafe-inline' blob: ;\
font-src 'self' data: blob: ;\
script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: ;\
img-src 'self' data: blob: ;`;

export type InjectExpress = (app: Express) => void;

export function createFrontend(
  appInfo: AppInfo,
  instances: Instances,
  injectFrontend: InjectExpress,
  getIndexHtml: () => string
): expressWs.Application {
  const expressApp = express();
  const wsInstance = expressWs(expressApp);
  const app = wsInstance.app;
  // inject how to serve the frontend; this is
  // different in dev mode and in production
  injectFrontend(app as unknown as Express);

  app.use(bodyParser.json());

  app.get("/app-info", (req, res) => {
    res.json({
      name: appInfo.manifest.name,
      iconUrl: appInfo.icon ? "/icon" : null,
      sourceCodeUrl: appInfo.manifest.sourceCodeUrl,
      manifestFound: appInfo.manifest.manifestFound,
      toolVersion: appInfo.toolVersion,
    });
  });
  app.get("/icon", (req, res) => {
    if (appInfo.icon == null) {
      res.sendStatus(404);
      return;
    }
    res.send(appInfo.icon.buffer);
  });
  app.get("/instances", (req, res) => {
    res.json(
      Array.from(instances.instances.values()).map((instance) => ({
        id: instance.port.toString(),
        url: `http://localhost:${instance.port}`,
        color: instance.color,
      }))
    );
  });
  app.post("/instances", (req, res) => {
    const instance = instances.add();
    instance.start();
    res.json({
      status: "ok",
      id: instance.id,
      port: instance.port,
    });
  });
  app.post("/clear", (req, res) => {
    instances.clear();
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

export function createPeer(
  location: Location,
  injectSim: InjectExpress
): expressWs.Instance {
  const expressApp = express();
  const wsInstance = expressWs(expressApp);

  // layer the simulated directory with webxdc tooling in front of webxdc path
  // this has to be injected as it differs between dev and production
  injectSim(wsInstance.app as unknown as Express);

  wsInstance.app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", CONTENT_SECURITY_POLICY);
    next();
  });

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
      })
    );
  } else {
    // serve webxdc project from directory
    wsInstance.app.use(express.static(location.path));
  }
  return wsInstance;
}
