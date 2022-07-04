import { Show, Component } from "solid-js";
import { Anchor, Image, Table, Tbody } from "@hope-ui/solid";

import RecordRow from "./RecordRow";
import { appInfo } from "./store";

const Info: Component = () => {
  return (
    <Show when={appInfo()} fallback={() => "Loading"}>
      {(appInfo) => (
        <Table>
          <Tbody>
            <RecordRow label="Name">{appInfo.name}</RecordRow>
            <RecordRow label="Manifest">
              {" "}
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
            </RecordRow>
            <RecordRow label="Source code">
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
            </RecordRow>
            <RecordRow label="webxdc-dev version">
              {appInfo.toolVersion}
            </RecordRow>
            <RecordRow label="Icon">
              <Show
                when={appInfo.iconUrl}
                fallback={
                  <p>
                    No <code>icon.png</code> or <code>icon.jpg</code> found
                  </p>
                }
              >
                {(url) => <Image src={url} />}
              </Show>
            </RecordRow>
          </Tbody>
        </Table>
      )}
    </Show>
  );
};

export default Info;
