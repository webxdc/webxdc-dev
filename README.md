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

You can install the tool globally. This works with any webxdc project:

```shell
npm install -g webxdc-dev
```

This makes the `webxdc-dev` available on your command line. Alternatively you
can also install `webxdc-dev` in just your development project as a
`package.json` script; see below for more information.

## Usage

When you start `webxdc-dev`, it opens a browser window with the webxdc-dev UI.
You can click on webxdc application instances to open them in new tab. You can
also add new instances.

To now run webxdc projects with the dev tool, do the following:

```shell
webxdc-dev run /path/to/webxdc/project
```

When you are developing your webxdc application, you may be using a development
server like vite or webpack that supports hot reloading. You can also run
`webxdc-dev` against such a server directly. For instance if you have your
project under development running on `http://localhost:8000`, this is how you
can run it:

```shell
webxdc-dev run http://localhost:8000
```

By default the dev tool is opened on port 3000 and following. You can change
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
development server on port 8000, you can integrate `webxdc-dev` with that as
follows in the `scripts` section of your `package.json`:

```json
{
  "scripts": {
    "webxdc-dev": "concurrently \"npm run dev\" && \"webxdc-dev run http://localhost:8000\""
  }
}
```

To run this you also need the `concurrently` dev dependency:

```shell
npm install -D concurrently
```

You can now run the script like this:

```shell
npm run webxdc-dev
```

### Testing the build

If you want to test the final build of your package and you have a `build`
script to produce it in a directory such as `dist`, you can integrate
it like this:

```json
{
  "scripts": {
    "webxdc-dev-build": "npm run build && webxdc-dev run dist"
  }
}
```

Note that this requires `npm run build` to put a complete set of build
artifacts in `dist` including required resources; in other words it needs to be
what you are going to pack into a `.xdc` file.

You can run the script like this:

```shell
npm run webxdc-dev-build
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
