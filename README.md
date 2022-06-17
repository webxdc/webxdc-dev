# webxdc-dev

webxdc-dev is a development tool for [webxdc](https://webxdc.org). It allows
you to open multiple independent instances of a webxdc application in different
browser tabs or windows. The purpose is to help you test and debug webxdc
projects, including communication between differences instances of the same
application.

Each webxdc application has a different port number so they don't share
anything, including `localstorage`.

Messages sent using the [Webxdc
API](https://docs.webxdc.org/spec.html#webxdc-api) `sendUpdate` function are
automatically distributed to all other instances of the application. This
allows you to simulate multiple users using the same application.

## Installation

There are two ways to install this package.

### Global installation

You can install the tool globally. This works with any webxdc project:

```shell
npm install -g webxdc-dev
```

To now run webxdc projects with the dev tool, do the following:

```shell
webxdc-dev run /path/to/webxdc/project
```

### With `package.json`

If your project has a `package.json`, you can also install `webxdc-dev` locally
as a dev dependency:

```shell
npm install -D webxdc-dev
```

and integrate it into a `package.json` `scripts` section to run the current
project:

```json
{
  "scripts": {
    "webxdc-dev": "webxdc-dev run ."
  }
}
```

You can then run this script using:

```shell
npm run webxdc-dev
```

## Usage

When you `webxdc-dev`, it opens a browser window with the webxdc-dev UI. You
can click on webxdc application instances to open them in new tab. You can
also add new instances.

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
version number automatically. You then need to push using `--follow-tags`
(**NOT** `--tags``).

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
