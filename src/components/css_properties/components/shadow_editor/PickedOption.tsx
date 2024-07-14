import { Icon } from "@iconify-icon/solid";
import { Accessor } from "solid-js";

import { Component } from "./Component";
import { Popup } from "./Popup";

export interface PickedOptionProps {
  deleteOption: (index: number) => void;
  index: Accessor<number>;
  label: string;
  openPopup: (index: number) => void;
  option: string;
}

export function PickedOption(props: Readonly<PickedOptionProps>) {
  return (
    <div class="flex ai:center b:1px|solid|#ccc cursor:pointer mb:3px p:5px r:4px">
      <Icon
        class="cursor:pointer mr:8"
        icon="icon-park-outline:more-one"
        onClick={() => props.openPopup(props.index())} />
      <Component
        index={props.index}
        label={props.label}
        openPopup={props.openPopup}
        option={props.option} />
      <Icon
        class="cursor:pointer fg:red mr:8"
        icon="mdi:close"
        onClick={() => props.deleteOption(props.index())} />
      <Popup index={props.index()} option={props.option} />
    </div>
  );
}
