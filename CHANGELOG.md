# Changelog

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

The `unreleased` heading is updated automatically to the right version and
release date when you use `npm version` (see `README.md`).

## [Unreleased]

## [0.20.0][] - 2025-08-08

### Changed
- remove deprecated descr column fom message table
- hide "instance started" messages unless `NODE_DEBUG` is set

### Fixed
- Give better error message when manifest.toml does not exist
- remove empty space in info panel
- clearer startup message


## [0.19.0][] - 2025-05-22

### Added

- Realtime API support.
- Use next available port if wanted one is already in use.
- Simpler ways to use CLI:

  - make the only useful `run` comand the default one
  - default `location` argument to the current directory
  - treat `localhost:8080` as `http://localhost:8080`

  Example: `webxdc-dev localhost:8080`

### Changed

- use `@webxdc/types` instead of own types declaration

## [0.18.0][] - 2024-11-16

### Changed

- package renamed to `@webxdc/webxdc-dev`

### Fixed

- Apps being unable to `fetch()` anything or use `blob:` and `data:` resource because of `connect-src` CSP
- `indexedDB` not getting cleared on `clear()`
- fix usage inside of stackblitz.com online IDE

## [0.17.0][] - 2023-06-08

### Added

- support for `webxdc.sendToChat()` API
- support for `webxdc.importFiles()` API

## [0.16.0][] - 2023-02-21

### Added

- Add a timestamp to messages.

- Add a `fake-update` endpoint to the backend. This can be used to send fake
  delta-chat client generated updates. There is no UI yet.

- A button to remove instances.

- A way to resize some UI sections.

## [0.15.1][] - 2022-07-04

### Fixed

- Previously when a instance was connected and then disconnected, received and
  clear messages for that instance would still show up in the messages tab. Now
  we detect that the message could not be sent to this client and we don't
  record it.

## [0.15.0][] - 2022-07-04

### Added

- A new "chat" panel is introduced in the sidebar. This contains any `summary`
  information as well as a table of `info` messages.

## [0.14.2][] - 2022-07-04

### Changed

- By default, the command-line does not show messages anymore. If you
  turn on `-v` then it prints all the messages.

### Fixed

- Fix to CSP issue on Safari - Safari's CSP implementation does not
  implement `connect-src` `self` correctly yet so introduce a workaround. https://github.com/w3c/webappsec-csp/issues/7

- CSP was inadvertently blocking hot module reloading in systems like Vite
  which use a websocket to a proxied host. Now make special exception in CSP
  for this use case.

- Fixed a bug where all instances in the UI would be set to stopped each time a
  new instances was added.

## [0.14.1][] - 2022-07-04

### Added

- Added `--no-csp` command-line option to disable the CSP. Turn off CSP in
  early development before you've removed all access to external resources. Or
  turn it off if things aren't working for you correctly, and think about
  filing an issue with `webxdc-dev`.

## [0.14.0][] - 2022-06-30

### Added

- Main tab is now completely renewed (based on what was the mobile tab).
  Instances and messages are integrated into this.

- Added Content Security Policy for instances - the same one as DeltaChat
  Desktop.

### Fixed

- Reload button is now disabled when instance is not started.

### Changed

- Refactored implementation of mobile tab and cleaned it up.

### Removed

- Remove `--open` automatic open option as it makes little sense with the
  new UI.

## [0.13.1][] - 2022-06-30

### Added

- There is now a connect message when you first connect or reload an instance.

### Changed

- The mobile tab devices now default to opening closed. This way the user can
  determine when to first open them or open them externally. This makes the
  behavior closer to what the old instances tab does.

- Rename the 'clear' button to 'reset'. It also wipes out messages in the
  messages panel.

## [0.13.0][] - 2022-06-30

### Added

- The ability to turn on and off a device in mobile

- The ability to open a device in an external tab in mobile

- Icon buttons

- Sidebar with messages is collapsible

- Scroll to new device when added

- Scroll to last new message when a message appears

- Show currently selected message in sidebar

- Allow for large contents of JSON in details panel

## [0.12.1][] - 2022-06-29

### Added

- A few tooltips and tweaks to the mobile UI.

## [0.12.0][] - 2022-06-29

### Added

- A new mobile tab. This shows the instances in iframes. Console log messages
  are instrumented so that the instance port number and color is shown ahead
  of the log message itself.

- An instance when connecting requests information from the backend, which now
  tells it basic information about the application. This allows us to set the
  name of the webxdc app in the title of each instance tab.

### Fixed

- The version number in the info tab should now show properly in the released
  version.

## [0.11.0][] - 2022-06-28

### Added

- Show version number of dev tool in info tab.

- Add `--version` command-line argument for `webxdc-dev` to see its version
  number.

- The title of instances is now overridden by the simulator to titles like
  "Instance 7001".

- Log `clear` events to instance console too.

- Add favicon for dev tool.

- Add `--open` option to automatically open instances on startup and as soon as
  they're created.

### Changed

- Better handling of command-line arguments.

- Pull `backend/instance.ts` module out of `backend/app.ts`.

## [0.10.0][] - 2022-06-28

### Added

- An info tab which displays information about the webxdc application you are
  running, including name, icon, source URL.

- When you launch `webxdc-dev` for the wrong XDC file/directory/URL you get an
  error message on the command-line describing what is wrong.

- The instances overview page has links to `sent` and `received` from the table
  heading to see just sent messages or received messages.

- Various tooltips in the instances screen to explain what each link does.

### Changed

- The dev server now broadcasts to all connected sockets for an instance
  instead of just one. This shouldn't make much of an operational difference
  expect if you open multiple browser windows for the same instance (which may
  have unpredictable effects for other reasons).

- `webxdc-dev` now waits to start until the URL it is proxying is available.
  This because it needs to retrieve manifest and icon information.

## [0.9.0][] - 2022-06-27

### Added

- The instances table now contains links to inspect messages for a client; all
  of them, sent or received. A client-side router is introduced, so the back
  button does what you expect.

- You can see how many messages were sent and received per client.

### Changed

- Better link styling

## [0.8.0][] - 2022-06-24

### Added

- Introduces a tabbed UI with a second "messages" tab which displays a list of
  all messages sent and received.

### Changed

- webxdc instances now use the name `Instance {port number}` instead of just
  the port number. The address has also been updated to use "instance" instead
  of "device".

## [0.7.0][] - 2022-06-23

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
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/webxdc/webxdc-dev/tree/v0.7.0
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/webxdc/webxdc-dev/tree/v0.8.0
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.9.0...HEAD
[0.9.0]: https://github.com/webxdc/webxdc-dev/tree/v0.9.0
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.10.0...HEAD
[0.10.0]: https://github.com/webxdc/webxdc-dev/tree/v0.10.0
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.11.0...HEAD
[0.11.0]: https://github.com/webxdc/webxdc-dev/tree/v0.11.0
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.12.0...HEAD
[0.12.0]: https://github.com/webxdc/webxdc-dev/tree/v0.12.0
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.12.1...HEAD
[0.12.1]: https://github.com/webxdc/webxdc-dev/tree/v0.12.1
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.13.0...HEAD
[0.13.0]: https://github.com/webxdc/webxdc-dev/tree/v0.13.0
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.13.1...HEAD
[0.13.1]: https://github.com/webxdc/webxdc-dev/tree/v0.13.1
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.14.0...HEAD
[0.14.0]: https://github.com/webxdc/webxdc-dev/tree/v0.14.0
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.14.1...HEAD
[0.14.1]: https://github.com/webxdc/webxdc-dev/tree/v0.14.1
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.14.2...HEAD
[0.14.2]: https://github.com/webxdc/webxdc-dev/tree/v0.14.2
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.15.0...HEAD
[0.15.0]: https://github.com/webxdc/webxdc-dev/tree/v0.15.0
[unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.15.1...HEAD
[0.15.1]: https://github.com/webxdc/webxdc-dev/tree/v0.15.1
[Unreleased]: https://github.com/webxdc/webxdc-dev/compare/v0.20.0...HEAD
[0.20.0]: https://github.com/webxdc/webxdc-dev/compare/v0.19.0...v0.20.0
[0.19.0]: https://github.com/webxdc/webxdc-dev/compare/v0.18.0...v0.19.0
[0.18.0]: https://github.com/webxdc/webxdc-dev/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/webxdc/webxdc-dev/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/webxdc/webxdc-dev/tree/v0.16.0
