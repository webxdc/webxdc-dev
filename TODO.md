## UI

- mobile display option for XDC applications. This could try to integrate
  everything in one page, with mobile windows as iframes stacked 2 wide.

- Content security reporting

- Remove instances

- When an instance opens it flashes with old state. Is it worthwhile to prevent
  the flash by temporaly blanking everything out upon initial load?

- Show the metadata fields (icon, name, etc) somewhere.

## Simulator

- State breaks down if you have multiple browser window pointing at the same
  port: for instance, if you open an instance again the server doesn't know to
  clear it first, because it thinks it already been cleared previously.

- content security policy, disallow anything except local images,
  and (shared, see below) websocket.

- simulate slow message sending, out of order message sending (with correct
  serial). Does out of order really happen?

- simulate messages that never arrive. For instance is block messages from A to
  B, but everyone else receives updates correctly. This will reveal problems
  with collaborative apps before users start noticing them.

## Architecture

- can we have only a single web socket that handles all frontends? we can
  use getWss().clients to broadcast to all clients.

## CLI / config

- CLI start with a number of peers (default 2?)

- config file with things such as base port, timing info defaults (also
  configurable through CLI)
