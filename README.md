# webxdc-dev

**Very early draft of the code**

A dev tool for Webxdc. It allows you to open multiple independent instances of
a Webxdc application in different browser tabs or windows. Each Webxdc
application has a different port number so they don't share anything, including
localstorage.

Messages sent using `sendUpdate` are automatically distributed to all other
instances of the application. This allows you to simulate a multi-user
application.

## How to use

For now, you can clone this repository and run:

```sh
npm run build
```

Then use:

```sh
npm run cli -- run /path/to/xdc
```

to run an Webxdc directory. There's a UI on port 3000 that lets you open
instances in new tabs. You can also add a new instance using this UI.
