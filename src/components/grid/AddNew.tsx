
import { IconButton } from "../IconButton";

export function AddNewButton(props: Readonly<{ onClick: () => void }>) {
  return (
    <IconButton
      class="bg:#f0f0f0 bg:#e0e0e0:hover border:#bbb:hover border:1px|solid|#ccc jc:center mb:10 p:7px|10px r:5"
      icon="lets-icons:add-round"
      iconCss="mr:5"
      onClick={props.onClick}
      size={22}
      title="Add New"
    >
      <span>Add New</span>
    </IconButton>
  );
}
