## UI

- Content security reporting

- Remove instances

- Option to open tabs automatically upon startup and when you add an instance.

- Opening a tab multiple times results in multiple windows on the same
  instance, which isn't ideal. Perhaps iframes would help control this better?

- Somehow simulate chat messages (description, summary, info).

## Mobile UI

- Chat messages sidebar, with filter.

- Sizzy integration to open in a "as real as possible" mobile browser?
  https://sizzy.co/ But for pay software.

## Messages

- Show the time a message was sent/received (at least on the server end)

- A serial filter (simple text input) which lets you filter all messages with a
  particular serial.

## Simulator

- When an instance opens it flashes with old state. Is it worthwhile to prevent
  the flash by temporaly blanking everything out upon initial load?

- Inject name of webxdc app after page title, like "Instance 7001 - Arkanoid".
  To this end instances need to get some information about themselves in a
  special message upon connection.

- Inject favicon for instances.

- content security policy, disallow anything except local images,
  and (shared, see below) websocket.

- simulate slow message sending, out of order message sending (with correct
  serial). Does out of order really happen?

- simulate messages that never arrive. For instance is block messages from A to
  B, but everyone else receives updates correctly. This will reveal problems
  with collaborative apps before users start noticing them.

- open URL to external hosts. Is this already happening? Show ip number at
  least.

- State breaks down if you have multiple browser window pointing at the same
  port: for instance, if you open an instance again the server doesn't know to
  clear it first, because it thinks it already been cleared previously.

## Webxdc development

- Make typescript types for webxdc available as a standalone package so that
  developers can use this in their own projects.

## Architecture

- can we have only a single web socket that handles all frontends? We could
  broadcast to all clients at once. The drawbacks of this are that the client
  becomes dependent on more than just its own backend, and that we cannot
  easily distinguish between instances and make one of them broken in some way.

## CLI / config

- CLI start with a number of peers (default 2?)

- config file with things such as base port, timing info defaults (also
  configurable through CLI)
