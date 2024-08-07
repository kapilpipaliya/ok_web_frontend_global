import { splitProps } from "solid-js";

import { IconButton, type IconButtonProps } from "../IconButton";

export function AddNewButton(props: IconButtonProps) {
  const [_local, rest] = splitProps(props, ["children"]);

  return (
    <IconButton
      class="bg:#f0f0f0 bg:#e0e0e0:hover border:#bbb:hover border:1px|solid|#ccc jc:center mb:10 p:7px|10px r:5"
      icon="lets-icons:add-round"
      iconClass="mr:5"
      size={22}
      title="Add New"
      {...rest}
    >
      <span>Add New</span>
    </IconButton>
  );
}
