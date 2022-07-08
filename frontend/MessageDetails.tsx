import { Component, Show } from "solid-js";
import { Box, Table, Tbody, Text } from "@hope-ui/solid";

import { Message } from "../types/message";
import RecordRow from "./RecordRow";
import { isUpdateMessage } from "./db";

const MessageDetails: Component<{ message: Message }> = (props) => {
  return (
    <Table dense>
      <Tbody>
        <RecordRow label="time">
          {new Date(props.message.timestamp).toISOString()}
        </RecordRow>
        <RecordRow label="instance id">
          <Text as="span" color={props.message.instanceColor}>
            {props.message.instanceId}
          </Text>
        </RecordRow>
        <RecordRow label="type">{props.message.type}</RecordRow>
        <Show when={isUpdateMessage(props.message) && props.message}>
          {(message) => {
            return (
              <>
                <RecordRow label="descr">{message.descr}</RecordRow>
                <RecordRow label="serial">{message.update.serial}</RecordRow>
                <Show when={message.type === "received"}>
                  <RecordRow label="max serial">
                    {message.update.max_serial}
                  </RecordRow>
                </Show>
                <RecordRow label="info">{message.update.info}</RecordRow>
                <RecordRow label="document">
                  {message.update.document}
                </RecordRow>
                <RecordRow label="summary">{message.update.summary}</RecordRow>
                <RecordRow label="payload">
                  <Box maxHeight="9rem" overflow="auto">
                    <pre>
                      <code>
                        {JSON.stringify(message.update.payload, null, 2)}
                      </code>
                    </pre>
                  </Box>
                </RecordRow>
              </>
            );
          }}
        </Show>
      </Tbody>
    </Table>
  );
};

export default MessageDetails;
