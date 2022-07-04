import { Component, createSignal, Show, Accessor, Setter } from "solid-js";
import { Flex, Box, Tabs, TabList, Tab, TabPanel } from "@hope-ui/solid";

import { Message } from "../types/message";
import MessageDetails from "./MessageDetails";

import Filters from "./Filters";
import Messages from "./Messages";
import Chat from "./Chat";

export type Search = {
  instanceId?: string;
  type?: string;
};

const Sidebar: Component<{
  search: Accessor<Search>;
  setSearch: Setter<Search>;
}> = (props) => {
  const [message, setMessage] = createSignal<Message | null>(null);

  return (
    <Flex height="100%" flexDirection="column" justifyContent="space-between">
      <Box>
        <Filters value={props.search()} onChange={props.setSearch} />
        <Tabs>
          <TabList>
            <Tab>Messages</Tab>
            <Tab>Chat</Tab>
          </TabList>
          <TabPanel>
            <Messages search={props.search} onSelectMessage={setMessage} />
          </TabPanel>
          <TabPanel>
            <Chat search={props.search} onSelectMessage={setMessage} />
          </TabPanel>
        </Tabs>
      </Box>
      <Box>
        <Show when={message()}>
          {(message) => <MessageDetails message={message} />}
        </Show>
      </Box>
    </Flex>
  );
};

export default Sidebar;
