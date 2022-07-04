# TODO

## UI

- Have a 'chat' tab in the messages tab. This filter shows the "info" messages.
  It's prefixed by instance id (as a colored badge), but you can filter by
  instance id to see only those.

- Have a "summary" should be shown near the instance.

- We could make it so that you can't open an external tab twice (though that
  won't stop people from copying the URL), and that you can't open an external
  tab if you've started the embedded UI, to prevent confusion.

- Let the user remove instances.

- BUG: adding an instance turns off all existing instances. This is because
  instances is reloaded from the server completely, and open/closed state isn't
  retained. We could change this having `/instances POST` return the new
  instance data, without reloading the existing instances.

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
  It might also break CSP.

## Other

- Update webxdc specification based on what I learned about it.

- Message on browser console: computations created outside a `createRoot` or
  `render` will never be disposed. What am I doing wrong with solid?

## CLI / config

- Base the log messages on `onMessage`

- Suppress the log messages in the terminal unless --verbose is chosen.

- CLI start with a number of peers (default 2?)

- CLI configure dimensions of embedded UI

- config file with things such as base port, timing info defaults (also
  configurable through CLI)
