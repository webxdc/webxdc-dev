#!/usr/bin/env node
const newName = "@webxdc/webxdc-dev"

console.log(`
!!! Error !!!:
You downloaded a deprecated version of webxdc-dev.
The package was renamed to ${newName}.

Install the new package globally:
npm i -g ${newName}

Install the new package just in your project:
npm i ${newName}

Install it temporarily and run it directly:
npx ${newName}
`)