import type { Component } from "solid-js";
import { JSX } from "solid-js";
import Instances from "./Instances";

import { Box, Tabs, TabList, Tab, TabPanel } from "@hope-ui/solid";

const Panel: Component<{ children: JSX.Element }> = (props) => {
  return (
    <Box m="$20" mt="$12">
      {props.children}
    </Box>
  );
};

const App: Component = () => {
  return (
    <Tabs>
      <TabList>
        <Tab>Instances</Tab>
        <Tab>Messages</Tab>
      </TabList>
      <TabPanel>
        <Panel>
          <Instances />
        </Panel>
      </TabPanel>
      <TabPanel>
        <Panel>Messages</Panel>
      </TabPanel>
    </Tabs>
  );
};

export default App;
