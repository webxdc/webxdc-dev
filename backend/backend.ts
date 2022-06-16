import express, { Express } from "express";
import { createServer as createViteServer } from "vite";

async function createServer() {
  const app = express();

  app.get("/foo", (req, res) => {
    res.send("Hello world!");
  });

  const vite = await createViteServer({
    server: { middlewareMode: "html" },
  });

  app.use(vite.middlewares);

  return app;
}

function main() {
  createServer().then((app) => {
    app.listen(3000, () => {
      console.log("Starting");
    });
  });
}

main();
