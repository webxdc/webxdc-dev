# webxdc-dev

[![npm package](https://img.shields.io/npm/v/@webxdc/webxdc-dev.svg)](https://npmjs.com/package/@webxdc/webxdc-dev)
[![CI](https://github.com/webxdc/webxdc-dev/actions/workflows/ci.yml/badge.svg)](https://github.com/webxdc/webxdc-dev/actions/workflows/ci.yml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

webxdc-dev is a development server for [webxdc apps](https://webxdc.org).
Easily test your app's behavior as if it was shared in a real chat with
multiple people.

![example screenshot](https://raw.githubusercontent.com/webxdc/webxdc-dev/main/screenshot.png)

In contrast to [hello](https://github.com/webxdc/hello), each "user"'s app
instance gets its own isolated state (e.g. `localStorage`), since each is
served from a separate port (therefore a separate origin).

## Installation

You can install the tool globally. This works with any webxdc project:

```
npm install -g @webxdc/webxdc-dev
```

This makes `webxdc-dev` available on your command line. Alternatively you
can also install `webxdc-dev` in just your development project as a
`package.json` script; see below for more information.

## Usage

### Starting

#### Running a directory

In case you don't use bundling tooling and have a simple webxdc project where
you have a directory that is zipped directly into a `.xdc` file, you can run it
directly:

```shell
webxdc-dev run /path/to/webxdc/project
```

This may not be convenient or may not even work if you use tools like `vite` or
`webpack-dev-server` though. For that, see below.

#### Running an .xdc file

You can run an `.xdc` file with the following command:

```shell
webxdc-dev run /path/to/my.xdc
```

#### With vite, webpack-dev-server, etc

It can be very useful to use a dev server that supports bundling and hot
reloading, like `vite` or `webpack-dev-server`. In this case your
project has a `package.json`.

You can run `webxdc-dev` against such a dev server directly. For instance if
you have your project under development running on `http://localhost:3000`,
this is how you can run it:

```shell
webxdc-dev run http://localhost:3000
```

### After starting

When you start `webxdc-dev`, it opens a browser window with the webxdc-dev UI.
Two webxdc application instances are already running. You can start the
instance in the embedded UI with the start button in each instance header. You
can reload any instance with the reload button.

You can add new instances by pressing the "Add instance" button. You can reset
all instance state and messages by pressing the "Reset" button.

The sidebar to the right lets you see all updates sent and received from the
dev server. Hover over the fields to see the complete text. Click on a message
to see full information. You can also filter messages. There is also a "chat"
tab which you can use to see `info` contained in updates as well as any
`summary` text contained in an update.

The sidebar can be closed with `Close Messages` button within the sidebar and
expanded by clicking on `Open Messages` within the devices tab.
The sidebars width can also be adjusted by moving the separating line between
devices and sidebar.

Each instance header also contains additional information: the port number on
which the instance was opened, the amount of updates this instance sent and
received since last reset. You can click on this information to control
the filters in the messages sidebar.

The "info" tab lets you see basic information about the webxdc application you
are running.

The dev tool console shows messages with the same color prefix as the instance
UIs.

You can simulate the host losing messages by toggling the "Drop Updates" button
on a specific instance. While enabled the instance will not recieve any updates
as if the transport has failed to deliver them.

#### Clean state

Instances start with a clean slate: empty `localStorage` and `sessionStorage`.
This means an instance may flash briefly with old state when it is opened for
the first time after startup.

The UI also lets you clear the state with the `reset` button - this refreshes
both server and client state, and is as if you restarted `webxdc-dev`.

## Command-line options

### Controlling the port number with `-p`

By default the dev tool is opened on port 7000 and following. You can change
the base port number using `--port`, so for instance:

```shell
webxdc-dev run --port 4000 /path/to/webxdc/project
```

### Turning off Content Security Policy (CSP)

By default the tool does best-effort network-isolation
using Content Security Policy (CSP) in an attempt
to simulate a real webxdc environment.
However, some existing apps might depend on third-party services
(such as CDNs to load fonts from).
If you're trying to port such an app to webxdc, you will get errors like
"failed to fetch https://some-cdn.com/app-translation.json".

In this case you can temporarily disable network isolation,
until you get around to getting rid of such network dependencies.

```shell
webxdc-dev run --no-csp http://localhost:8080
```

### Verbose

By default the dev tool does not log messages. You can change this by using
`-v` which logs messages to the console.

## `webxdc-dev` as a `package.json` script

If your project has a `package.json`, you can also install `webxdc-dev` locally
as a dev dependency:

```shell
npm install -D @webxdc/webxdc-dev
```

### During development

If your project already has a `dev` or `start` script that starts a local
development server on port 3000, you can integrate `webxdc-dev` with that as
follows in the `scripts` section of your `package.json`:

```json
{
  "scripts": {
    "webxdc-dev": "concurrently \"npm run dev\" \"webxdc-dev run http://localhost:3000\""
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

`webxdc-dev` is developed using [npm](<https://en.wikipedia.org/wiki/Npm_(software)>),
so run:

```shell
npm install
```

in the `webxdc-dev` project directory to install dependencies.

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
