# Design notes

## one websocket per instance

Each instance has its own websocket it uses to communicate to the backend. It
can be argued that only a single websocket is necessary that all instances use.
This would allow a broadcast of messages to all clients at once.

But there are drawbacks as the client becomes dependent on more than its own
backend. This would require an exception in CSP, which is doable. More
difficult is that the client would need to know which port to connect to, which
would somehow need to be injected into `webxdc.js`. In the current architecture
the client can easily talk to its own host without any further knowledge.

## Webpack versus vite

I tried hard to make things work with Vite as this was already in use with
other projects within the webxdc org, but had to go to webpack to gain the
control I needed -- I need to be able to produce a frontend UI bundle as well
as the simulator `webxdc.js` bundle with a specific name. I couldn't get Vite
to support that. webpack provides the required control, at the cost of more
configuration.

As an alternative I could have used `rollup` which should offer the control
and is what vite itself uses.
