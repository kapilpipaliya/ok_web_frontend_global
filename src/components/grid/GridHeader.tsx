import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "../IconButton";
import { SearchBar } from "../css_properties/SearchBar";
import { AddNewButton } from "./AddNew";
import { useDataGridContext } from "./DataGridContext";

interface GridHeaderProps {
  allConfiguredPermission: Vertex[];
  onSearch: (value: string) => void;
}

export function GridHeader(props: Readonly<GridHeaderProps>) {
  const [gridState, setGridState] = useDataGridContext();
  const navigate = useNavigate();
  const onAddNew = () => navigate("new")
  return (
    <div class="flex ai:center jc:space-between p:4|10">
      <AddNewButton onClick={onAddNew} />
      <div class="flex ai:center mb:10">
        <SearchBar
          handleChange={props.onSearch}
          placeholder="Search Data..."
          value={gridState.search}
        />
        <IconButton
          icon={gridState.layout === 'table' ? 'fa6-regular:id-card' : 'fa:table'}
          onClick={() => setGridState("layout", gridState.layout === 'table' ? 'card' : 'table')}
          title="Table Layout"
        />
        <Show when={gridState.layout === 'card'}>
          <input
            max="10"
            min="1"
            onInput={(e) => setGridState("cardSize", Number(e.currentTarget.value))}
            style={{ 'margin-left': '10px' }}
            type="number"
            value={gridState.cardSize}
          />
        </Show>
      </div>
    </div>
  );
}
