import { DevServerTransport } from "./webxdc";

const consoleFunctionNames = ["debug", "log", "info", "warn", "error"] as const;

function overwriteConsoleFunction(
  functionName: typeof consoleFunctionNames[number],
  deviceIdentifier: string,
  logStyle: string
) {
  const original = console[functionName];
  const replacement = original.bind(null, `%c${deviceIdentifier}`, logStyle);
  window.console[functionName] = replacement;
  console[functionName] = replacement;
}

export async function overwriteConsole(
  deviceIdentifier: string,
  transport: DevServerTransport
) {
  const info = await transport.getInfo();
  const logStyle = `color:white;font-weight:bold;border-radius:4px;padding:2px;background: ${info.color}`;
  for (const functionName of consoleFunctionNames) {
    overwriteConsoleFunction(functionName, deviceIdentifier, logStyle);
  }
}

export async function alterUi(
  instanceName: string,
  transport: DevServerTransport
): Promise<void> {
  const info = await transport.getInfo();
  let title = document.getElementsByTagName("title")[0];
  if (title == null) {
    title = document.createElement("title");
    document.getElementsByTagName("head")[0].append(title);
  }
  title.innerText = `${instanceName} - ${info.name}`;
}
