import type { Component } from "solid-js";
import { JSX, createSignal, createEffect } from "solid-js";
import { Box, Tabs, TabList, Tab, TabPanel } from "@hope-ui/solid";
import { Route, Routes, useNavigate, useLocation } from "solid-app-router";

import Instances from "./Instances";
import Messages from "./Messages";
import Info from "./Info";
import Mobile from "./Mobile";

const Panel: Component<{ children: JSX.Element }> = (props) => {
  return (
    <Box m="$2" mt="$6">
      {props.children}
    </Box>
  );
};

const AppRoutes: Component = () => {
  return (
    <Routes>
      <Route path="/" element={<Instances />} />
      <Route path="/info" element={<Info />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/mobile" element={<Mobile />} />
    </Routes>
  );
};

const App: Component = () => {
  const [tabIndex, setTabIndex] = createSignal(0);

  // set correct tab index from pathname
  createEffect(() => {
    const location = useLocation();
    if (location.pathname === "/") {
      setTabIndex(0);
    } else if (location.pathname === "/info") {
      setTabIndex(1);
    } else if (location.pathname === "/messages") {
      setTabIndex(2);
    } else if (location.pathname === "/mobile") {
      setTabIndex(3);
    }
  });

  // use tab index to navigate to pathname
  const navigate = useNavigate();
  const handleTabsChange = (index: number) => {
    if (index === 0) {
      navigate("/");
    } else if (index === 1) {
      navigate("/info");
    } else if (index === 2) {
      navigate("/messages");
    } else if (index === 3) {
      navigate("/mobile");
    }
    setTabIndex(index);
  };

  return (
    <Tabs index={tabIndex()} onChange={handleTabsChange}>
      <TabList>
        <Tab>Instances</Tab>
        <Tab>Info</Tab>
        <Tab>Messages</Tab>
        <Tab>Mobile</Tab>
      </TabList>
      <TabPanel>
        <Panel>
          <AppRoutes />
        </Panel>
      </TabPanel>
      <TabPanel>
        <Panel>
          <AppRoutes />
        </Panel>
      </TabPanel>
      <TabPanel>
        <Panel>
          <AppRoutes />
        </Panel>
      </TabPanel>
      <TabPanel>
        <Panel>
          <AppRoutes />
        </Panel>
      </TabPanel>
    </Tabs>
  );
};

export default App;
