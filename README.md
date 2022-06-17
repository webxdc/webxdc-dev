# webxdc-dev

**Very early draft of the code**

A dev tool for Webxdc. It allows you to open multiple independent instances of
a Webxdc application in different browser tabs or windows. Each Webxdc
application has a different port number so they don't share anything, including
localstorage.

Messages sent using `sendUpdate` are automatically distributed to all other
instances of the application. This allows you to simulate a multi-user
application.

## How to use

For now, you can clone this repository and run:

```sh
npm run build
```

Then use:

```sh
npm run cli -- run /path/to/xdc
```

to run an Webxdc directory. There's a UI on port 3000 that lets you open
instances in new tabs. You can also add a new instance using this UI.

## Architecture

This codebase consists of three pieces:

- backend: a NodeJS Express application that serves webxdc applications in the
  browser and distributes updates using websockets.

- simulator: a version of `webxdc.js` that uses a websocket to the backend to
  send and receive updates. This is injected into webxdc applications.

- frontend: a SolidJS application that presents the webxdc-dev UI.

The backend is compiled with TypeScript directly. The simulator and frontend are bundled using webpack using the babel loader (with the typescript preset).

## Development

You can run `webxdc-dev` in development mode so that both frontend and backend
are automatically recompiled when you change code. For frontend and simulator
changes you need to reload your browser windows to see the effect. When you
make a backend change, the entire server is restarted and a new browser window
is opened.

```sh
npm run dev -- run /path/to/xdc
```
