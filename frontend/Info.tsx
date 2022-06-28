import { Show, Component } from "solid-js";
import { Anchor, Image, Table, Tbody, Tr, Td } from "@hope-ui/solid";

import { appInfo } from "./store";

const Info: Component = () => {
  return (
    <Show when={appInfo()} fallback={() => "Loading"}>
      {(appInfo) => (
        <Table>
          <Tbody>
            <Tr>
              <Td>
                <strong>Name</strong>
              </Td>
              <Td>{appInfo.name}</Td>
            </Tr>
            <Tr>
              <Td>
                <strong>Manifest</strong>
              </Td>
              <Td>
                <Show
                  when={appInfo.manifestFound}
                  fallback={
                    <span>
                      No <code>manifest.toml</code> found
                    </span>
                  }
                >
                  Found
                </Show>
              </Td>
            </Tr>
            <Tr>
              <Td>
                <strong>Source code</strong>
              </Td>
              <Td>
                <Show
                  when={appInfo.sourceCodeUrl}
                  fallback={
                    <Show
                      when={appInfo.manifestFound}
                      fallback={
                        <span>
                          No <code>manifest.toml</code> with{" "}
                          <code>source_code_url</code>
                        </span>
                      }
                    >
                      <span>
                        No <code>source_code_url</code> entry found in{" "}
                        <code>manifest.toml</code>
                      </span>
                    </Show>
                  }
                >
                  {() => (
                    <Anchor
                      color="$primary10"
                      external
                      href={appInfo.sourceCodeUrl}
                    >
                      {appInfo.sourceCodeUrl}
                    </Anchor>
                  )}
                </Show>
              </Td>
            </Tr>
            <Tr>
              <Td>
                <strong>Icon</strong>
              </Td>
              <Td>
                <Show
                  when={appInfo.iconUrl}
                  fallback={
                    <p>
                      No <code>icon.png</code> or <code>icon.jpg</code> found
                    </p>
                  }
                >
                  <Image src={appInfo.iconUrl} />
                </Show>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      )}
    </Show>
  );
};

export default Info;
