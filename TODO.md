- mobile display option for XDC applications

- base webpack file that gets extended

- webpack auto refreshes browser when changes - webpack dev server?

- content security policy

- content security reporting

- watch mode for webpack

- simulate slow message sending, out of order message sending (with correct
  serial)

- list of peers in UI

- add / remove peers in UI

- CLI start with a number of peers (default 2?)

- production build of various resources

- configure base port number with command line arg

- config file with things such as base port, timing info defaults (also
  configurable through CLI)

- clean out localstorage for port numbers? otherwise when peer starts up
  it still can have old cruft. Start in incognito?

- can we have only a single web socket that handles all frontends? we can
  use getWss().clients to broadcast to all clients.
