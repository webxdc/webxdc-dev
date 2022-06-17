## UI

- Messages sent, inspect messages

- mobile display option for XDC applications

- Content security reporting

- Remove instances

## Simulator

- content security policy, disallow anything except local images,
  and (shared, see below) websocket.

- simulate slow message sending, out of order message sending (with correct
  serial)

- simulate messages that never arrive. For instance is block messages from A to
  B, but everyone else receives updates correctly. This will reveal problems
  with collaborative apps before users start noticing them.

- clean out localstorage for port numbers? otherwise when peer starts up
  it still can have old cruft. How does this behave on localhost?
- Start in incognito? (doesn't seem to be easy)

## Architecture

- can we have only a single web socket that handles all frontends? we can
  use getWss().clients to broadcast to all clients.

- Is express-ws worth it?

## CLI / config

- CLI start with a number of peers (default 2?)

- configure base port number with command line arg

- config file with things such as base port, timing info defaults (also
  configurable through CLI)

## Build

- base webpack file that gets extended

- webpack auto refreshes browser when changes - webpack dev server?

- watch mode for webpack

- production build of various resources

- automatic release when using npm version
