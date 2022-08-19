import type { Component } from "solid-js";
import { JSX, createSignal, createEffect } from "solid-js";
import { Box, Tabs, TabList, Tab, TabPanel, Flex } from "@hope-ui/solid";
import { Route, Routes, useNavigate, useLocation } from "solid-app-router";

import Main from "./Main";
import Info from "./Info";

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
      <Route path="/" element={<Main />} />
      <Route path="/info" element={<Info />} />
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
    }
  });

  // use tab index to navigate to pathname
  const navigate = useNavigate();
  const handleTabsChange = (index: number) => {
    if (index === 0) {
      navigate("/");
    } else if (index === 1) {
      navigate("/info");
    }
    setTabIndex(index);
  };

  return (
    <Tabs h="$screenH" index={tabIndex()} onChange={handleTabsChange}>
      <Flex direction={"column"} h="$full" maxH="100vh">
        <TabList>
          <Tab>Main</Tab>
          <Tab>Info</Tab>
        </TabList>
        <TabPanel flexGrow="1" maxHeight="calc(100vh - 40px)">
          <AppRoutes />
        </TabPanel>
        <TabPanel>
          <Panel>
            <AppRoutes />
          </Panel>
        </TabPanel>
      </Flex>
    </Tabs>
  );
};

export default App;
