import { Icon } from "@iconify-icon/solid";

export function AddNewButton(props: Readonly<{ onClick: () => void; }>) {
  return <button
    class="flex ai:center jc:center p:7px|10px mb:10 bg:#f0f0f0 border:1px|solid|#ccc r:5 bg:#e0e0e0:hover border:#bbb:hover"
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
