# Changelog

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

The `unreleased` heading is updated automatically to the right version and
release date when you use `npm version` (see `README.md`).

## [Unreleased]

### Added

- Prettier UI.

- "Clear" button which resets both server and client state, including
  `localStorage`, `sessionStorage`, etc. This makes it easy to restart the
  clients in a clean slate. When you restart `webxdc-dev` each client will also
  start with a clean state.

### Changed

- Updated the documentation to start with more basic use cases first.

## [0.6.0][] - 2022-06-22

### Added

- Added the ability to run an `.xdc` file directly with `webxdc-dev run`.

## [0.5.2][] - 2022-06-22

### Changed

- Improved documentation

- Changed the default port number of webxdc-dev to `7000` as `3000` conflicted
  with the vite default. We want to avoid any conflicts, so here's a run-down
  of defaults:

  - vite uses `3000`

  - webpack-dev-server uses `8080`

  - parcel dev server uses `1234`

  So with `7000` we should be safe.

## [0.5.1][] - 2022-06-22

### Fixed

- There was a problem of applications breaking when running against a dev
  server on a URL. The websocket at /webxdc/.socket is now properly filtered
  out so that the applications start up correctly again.

## [0.5.0][] - 2022-06-21

### Added

- Added the ability to run Webxdc applications on a URL. This means you can
  start your dev server on, say, `http://localhost:8000` and then use:

  ```shell
  webxdc-dev run http://localhost:8000
  ```

  This is handy when you have a development server such as webpack or vite
  running for your Webxdc project.

## [0.4.0][] - 2022-06-21

### Fixed

- `setUpdateListener` now correctly resolves the promise once messages
  have been received.

### Changed

- Backend now sends multiple messages at once to support `setUpdateListener`
  promise.

- Transport mechanism for webxdc client.

- Tests for webxdc client.

## [0.3.1][] - 2022-06-20

### Fixed

- The build was broken due to the addition of the `types` directory. Unbreak
  the build.

## [0.3.0][] - 2022-06-20

### Changed

- Better implementation of webxdc: when you reload or reconnect, you get the
  correct messages.

### Fixed

- Make it so that we use an absolute path to find the `dist` directory in
  development mode so that the path where you start the tool shouldn't matter
  anymore.

## [0.2.1][] - 2022-06-20

### Fixed

- Use `version-changelog` to maintain changelog as it lets us maintain a manual
  changelog.

## [v0.2.0] - 2021-06-20

### Added

- Start maintaining this changelog.

- Ability to set base port number using `--port` on the CLI.

- Log WebXDC traffic on browser console with `send` and `recv` messages.

### Fixed

- Messages are sent to self too, not just to other instances.

- Better `selfAddr` and `selfName`.

[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/webxdc/webxdc-dev/tree/v0.2.1
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/webxdc/webxdc-dev/tree/v0.3.0
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/webxdc/webxdc-dev/tree/v0.3.1
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/webxdc/webxdc-dev/tree/v0.4.0
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/webxdc/webxdc-dev/tree/v0.5.0
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.5.1...HEAD
[0.5.1]: https://github.com/webxdc/webxdc-dev/tree/v0.5.1
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.5.2...HEAD
[0.5.2]: https://github.com/webxdc/webxdc-dev/tree/v0.5.2
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/webxdc/webxdc-dev/tree/v0.6.0
