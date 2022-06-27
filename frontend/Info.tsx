import { Show, Component } from "solid-js";
import { Anchor, Image, Heading } from "@hope-ui/solid";

import { appInfo } from "./store";

const Info: Component = () => {
  return (
    <Show when={appInfo()} fallback={() => "Loading"}>
      {(appInfo) => (
        <>
          <Heading level="1" size="4xl">
            {appInfo.name}
          </Heading>
          <Show when={!appInfo.manifestFound}>
            <p>No manifest.toml found</p>
          </Show>
          <Show
            when={appInfo.iconUrl}
            fallback={<p>No icon.png or icon.jpg found</p>}
          >
            <Image src={appInfo.iconUrl} />
          </Show>
          Source code:{" "}
          <Show when={appInfo.sourceCodeUrl} fallback="no source_code_url">
            {() => (
              <Anchor color="$primary10" external href={appInfo.sourceCodeUrl}>
                {appInfo.sourceCodeUrl}
              </Anchor>
            )}
          </Show>
        </>
      )}
    </Show>
  );
};

export default Info;
