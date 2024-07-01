import { Icon } from "@iconify-icon/solid";

export function AddNewButton(props: Readonly<{ onClick: () => void; }>) {
  return <button
    class="flex ai:center bg:#f0f0f0 bg:#e0e0e0:hover border:#bbb:hover border:1px|solid|#ccc jc:center mb:10 p:7px|10px r:5"
    onClick={props.onClick}
  >
    <Icon
      class="mr:5"
      height={22}
      icon={"lets-icons:add-round"}
      width={22} />
    <span>Add New</span>
  </button>;
}
