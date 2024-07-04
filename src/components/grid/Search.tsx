import { Icon } from "@iconify-icon/solid";

export function Search(props: { setValue: (v: string) => void; value: string; }) {
  return <div class="group">
    <Icon
      class="icon"
      icon="iconamoon:search"
      style={{ color: "#9e9ea7" }} />
    <input
      autocomplete="none"
      class="inputSearch f:14"
      onInput={(e) => {
        props.setValue(e.target.value);
      }}
      placeholder="Search Data..."
      type="search"
      value={props.value} />
  </div>;
}
