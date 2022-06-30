import {
  Component,
  For,
  createSignal,
  Show,
  createMemo,
  Accessor,
  Setter,
  createEffect,
  JSX,
} from "solid-js";
import {
  Flex,
  Box,
  Table,
  Th,
  Tr,
  Td,
  Thead,
  Tbody,
  Text,
  Badge,
  Tooltip,
  IconButton,
  createDisclosure,
} from "@hope-ui/solid";
import {
  IoRefreshOutline,
  IoStop,
  IoPlay,
  IoCaretBackOutline,
  IoCaretForwardOutline,
} from "solid-icons/io";
import { FiExternalLink } from "solid-icons/fi";

import TdTooltip from "./TdTooltip";
import TextDynamic from "./TextDynamic";
import Filter from "./Filter";
import { instances, InstanceData, getMessages } from "./store";
import InstancesButtons from "./InstancesButtons";
import { Message, UpdateMessage } from "../types/message";
import RecordRow from "./RecordRow";
import { instanceIdEntries } from "./instanceIdEntries";
import { sent, received } from "./store";
import { scrollToDevice } from "./scroll";
import { isUpdateMessage } from "./store";

const MessageRow: Component<{
  message: Message;
  isSelected: boolean;
  onSelect: (message: Message) => void;
}> = (props) => {
  return (
    <Tr
      onClick={() => {
        props.onSelect(props.message);
      }}
      bgColor={props.isSelected ? "$primary4" : undefined}
    >
      <Td>
        <TextDynamic>
          <Tooltip label="Click to scroll to device">
            <Text
              color={props.message.instanceColor}
              onClick={() => scrollToDevice(props.message.instanceId)}
            >
              {props.message.instanceId}
            </Text>
          </Tooltip>
        </TextDynamic>
      </Td>
      <TdTooltip>{props.message.type}</TdTooltip>
      <Show when={isUpdateMessage(props.message) && props.message}>
        {(message) => (
          <>
            <TdTooltip>{message.descr}</TdTooltip>
            <TdTooltip
              tooltip={
                <pre>
                  <code>{JSON.stringify(message.update.payload, null, 2)}</code>
                </pre>
              }
            >
              {JSON.stringify(message.update.payload)}
            </TdTooltip>
          </>
        )}
      </Show>
    </Tr>
  );
};

export default MessageRow;
