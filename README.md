# webxdc-dev

webxdc-dev is a development server for [webxdc apps](https://webxdc.org). It
allows you to open multiple independent instances of a webxdc application in
different browser tabs or indows. It simulates how your app will run when
"shared in a chat" and allows you to test and debug webxdc with very fast
turn-around times. Each webxdc browser app instance is connected to a different
port number of the webxdc-dev server so that it gets its own isolated state
(for example localstorage).

Messages sent using the [Webxdc
API](https://docs.webxdc.org/spec.html#webxdc-api) `sendUpdate` function are
automatically received via the `setUpdateListener` callback of other instances.
This allows you to simulate multiple users using the same application.

## Installation

You can install the tool globally. This works with any webxdc project:

```shell
npm install -g webxdc-dev
```

This makes `webxdc-dev` available on your command line. Alternatively you
can also install `webxdc-dev` in just your development project as a
`package.json` script; see below for more information.

## Usage

When you start `webxdc-dev`, it opens a browser window with the webxdc-dev UI.
Two webxdc application instances are already running. You can click on
instances to open them in new tab. You can also add new instances. Instances
start with a clean slate: empty `localStorage` and `sessionStorage`. This means
an instance may flash briefly with old state when it is opened for the first
time after startup.

The UI also lets you clear the state - this refreshes both server and client
state, and is as if you restarted `webxdc-dev`.

The "messages" tab lets you see all updates sent and received from the dev
server. Hover over the fields to see the complete text.

### Running a directory

In case you don't use bundling tooling and have a simple webxdc project where
you have a directory that is zipped directly into a `.xdc` file, you can run it
directly:

```shell
webxdc-dev run /path/to/webxdc/project
```

This may not be convenient or may not even work if you use tools like `vite` or
`webpack-dev-server` though. For that, see below.

### Running an .xdc file

You can run an `.xdc` file with the following command:

```shell
webxdc-dev run /path/to/my.xdc
```

### With vite, webpack-dev-server, etc

It can be very useful to use a dev server that supports bundling and hot
reloading, like `vite` or `webpack-dev-server`. In this case your
project has a `package.json`.

You can run `webxdc-dev` against such a dev server directly. For instance if
you have your project under development running on `http://localhost:3000`,
this is how you can run it:

```shell
webxdc-dev run http://localhost:3000
```

### Controlling the port number

By default the dev tool is opened on port 7000 and following. You can change
the base port number using `--port`, so for instance:

```shell
webxdc-dev run --port 4000 /path/to/webxdc/project
```

## `webxdc` as a `package.json` script

If your project has a `package.json`, you can also install `webxdc-dev` locally
as a dev dependency:

```shell
npm install -D webxdc-dev
```

### During development

If your project already has a `dev` or `start` script that starts a local
development server on port 3000, you can integrate `webxdc-dev` with that as
follows in the `scripts` section of your `package.json`:

```json
{
  "scripts": {
    "webxdc-dev": "concurrently \"npm run dev\" && \"webxdc-dev run http://localhost:3000\""
  }
}
```

To run this you need the `concurrently` dev dependency:

```shell
npm install -D concurrently
```

You can now run the script like this:

```shell
npm run webxdc-dev
```

### Testing the .xdc build

If your build script produces an `.xdc` file you can test this:

```json
{
  "scripts": {
    "webxdc-dev-xdc": "npm run build && webxdc-dev run dist/app.xdc"
  }
}
```

This is assuming your `build` command produces a `dist/app.xdc`.

You can run it like this:

```shell
npm run webxdc-dev-xdc
```

### Testing a build directory

If you have a `dist` directory that contains the complete contents of
what will be zipped up into an `.xdc` file you can also run against it
directly:

```json
{
  "scripts": {
    "webxdc-dev-dist": "npm run build && webxdc-dev run dist"
  }
}
```

You can run the script like this:

```shell
npm run webxdc-dev-dist
```

## Development

You can run `webxdc-dev` in development mode so that both frontend and backend
are automatically recompiled when you change code. For frontend and simulator
changes you need to reload your browser windows to see the effect. When you
make a backend change, the entire server is restarted and a new browser window
is opened.

```shell
npm run dev -- run /path/to/xdc
```

Production and development mode have differences: in production mode no
recompilation takes place. Before release, you should test the command-line
script in production mode. You can do this as follows:

```shell
npm run build
```

Then use:

```shell
npm run cli -- run /path/to/xdc
```

### Making a release

You can create a new npm release automatically by doing the following on the
`main` branch:

```shell
npm version patch  # or minor, major, etc
git push --follow-tags
```

[`npm version`](https://docs.npmjs.com/cli/v8/commands/npm-version) updates the
version number automatically and also puts the latest date in `CHANGELOG.md`.
You then need to push using `--follow-tags` (**NOT** `--tags`).

The release process is done through a github action defined in
`.workflows/publish.yml` which publishes to the npm registry automatically.

## Architecture

This codebase consists of three pieces:

- backend: a NodeJS Express application that serves webxdc applications in the
  browser and distributes updates using websockets.

- simulator: a version of `webxdc.js` that uses a websocket to the backend to
  send and receive updates. This is injected into webxdc applications.

- frontend: a SolidJS application that presents the webxdc-dev UI.

The backend is compiled with TypeScript directly. The simulator and frontend are bundled using webpack using the babel loader (with the typescript preset).
