import {
  Select,
  SelectTrigger,
  SelectPlaceholder,
  SelectValue,
  SelectIcon,
  SelectContent,
  SelectListbox,
  SelectOption,
  SelectOptionText,
  SelectOptionIndicator,
} from "@hope-ui/solid";
import type { Component } from "solid-js";
import { For } from "solid-js";

export type FilterEntry = {
  text: string;
  value: string;
};

const Filter: Component<{
  label: string;
  entries: FilterEntry[];
  value: string;
  onChange: (value: string) => void;
}> = (props) => {
  return (
    <Select size="xs" value={props.value} onChange={props.onChange}>
      <SelectTrigger width="$64">
        <SelectPlaceholder>{props.label}</SelectPlaceholder>
        <SelectValue />
        <SelectIcon />
      </SelectTrigger>
      <SelectContent width="$64">
        <SelectListbox>
          <For each={props.entries}>
            {(entry) => (
              <SelectOption value={entry.value}>
                <SelectOptionText>{entry.text}</SelectOptionText>
                <SelectOptionIndicator />
              </SelectOption>
            )}
          </For>
        </SelectListbox>
      </SelectContent>
    </Select>
  );
};

export default Filter;
