import { Icon } from "@iconify-icon/solid";
import { type Accessor } from "solid-js";

export function SearchBar(props: Readonly<{ handleChange: (value: string) => void; value: Accessor<string>; }>) {
  return (
    <nav class="0px 0px 10px 10px bg:white p:5|0 w:full">
      <div class="flex">
        <div class="group w:full">
          <Icon class="icon" icon="iconamoon:search" style={{ color: "#9e9ea7" }} />
          <input
            class="inputSearch f:14"
            onInput={(e) => props.handleChange(e.target.value)}
            placeholder="Search Style..."
            type="search"
            value={props.value()} />
        </div>

      </div>

    </nav>
  );
}
