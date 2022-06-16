import { createFrontend, createPeer, WebXdc, gossip } from "./app";

const hello: WebXdc = {
  name: "My App",
  path: "/home/faassen/projects/webxdc/clean",
};

function main() {
  const frontend = createFrontend();
  frontend.listen(3000, () => {
    console.log("Starting frontend");
  });

  const helloPeer = createPeer(hello);
  const helloPeer2 = createPeer(hello);

  gossip([helloPeer, helloPeer2]);

  helloPeer.listen(3001, () => {
    console.log("Starting peer at 3001");
  });

  helloPeer2.listen(3002, () => {
    console.log("Starting peer at 3002");
  });
}

main();
