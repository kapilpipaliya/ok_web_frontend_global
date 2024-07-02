import { Icon } from "@iconify-icon/solid";
import { Accessor } from "solid-js";

export function SearchBar(props: Readonly<{ handleChange: (value: string) => void; value: Accessor<string>; }>) {
  return (
    <nav class="0px 0px 10px 10px bg:white p:5|0 w:full">
      <div class="group">
        <Icon class="icon" icon="iconamoon:search" style={{ color: "#9e9ea7" }} />
        <input
          class="inputSearch f:14"
          onInput={(e) => props.handleChange(e.target.value)}
          placeholder="Search Style..."
          type="search"
          value={props.value()} />
      </div>
    </nav>
  );
}
