# TODO

## UI

- We could make it so that you can't open an external tab twice (though that
  won't stop people from copying the URL), and that you can't open an external
  tab if you've started the embedded UI, to prevent confusion.

- Let the user remove instances.

- BUG: Messages scrolling is triggered even when a filter doesn't see a new message.

- Can messages scrolling be made to use CSS somehow? Or should we use a
  virtualized view and then see?

## Messages

- Perhaps default message filter should see connect & sent at the same time?

- Instance id filter should use colors

- Filter UI can be a bit narrower.

- Special boolean search filter "since last connect of each client". This could
  also be shown with update sent/received as an alternative number.

- Show the time a message was sent/received (at least on the server end)

- A serial filter (simple text input) which lets you filter all messages with a
  particular serial.

## Simulator

- A disconnected client continues to receive updates according to the server
  and thus in the messages panel. This is incorrect. The server should become
  aware that a message cannot be sent (triggering an implicit disconnection?),
  or alternatively of disconnect events (but how to know all clients are
  disconnected?)

- When an instance opens it flashes with old state. Is it worthwhile to prevent
  the flash by temporaly blanking everything out upon initial load? Getting
  this working is quite complicated, see
  https://github.com/webxdc/webxdc-dev/issues/16

- Inject favicon for instances when opened in a tab. Or should the instances
  just have their own? It's less important now that we have embedded UIs.

- simulate slow message sending, out of order message sending (with correct
  serial). Does out of order really happen?

- simulate messages that never arrive. For instance is block messages from A to
  B, but everyone else receives updates correctly. This will reveal problems
  with collaborative apps before users start noticing them.

- open URL to external hosts. Is this already happening? Show ip number at
  least. Currently localhost is hardcoded in some places.

- State breaks down if you have multiple browser window pointing at the same
  port: for instance, if you open an instance again the server doesn't know to
  clear it first, because it thinks it already been cleared previously.

## Webxdc development

- Make typescript types for webxdc available as a standalone package so that
  developers can use this in their own projects.

## Other

- Update webxdc specification based on what I learned about it.

- Message on browser console: computations created outside a `createRoot` or
  `render` will never be disposed. What am I doing wrong with solid?

## CLI / config

- CLI start with a number of peers (default 2?)

- CLI configure dimensions of embedded UI

- config file with things such as base port, timing info defaults (also
  configurable through CLI)

## Build

- Run typecheck and tests before release in github action.
