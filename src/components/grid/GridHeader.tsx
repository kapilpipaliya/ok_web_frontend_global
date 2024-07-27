import type { ColumnDef } from "@tanstack/solid-table";

import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";

import { IconButton } from "../IconButton";
import { SearchBar } from "../css_properties/SearchBar";
import { AddNewButton } from "./AddNew";

interface GridHeaderProps {
  cardSize: number;
  columns: ColumnDef<any>[];
  layout: 'card' | 'table';
  onSearch: (value: string) => void;
  searchValue: string;
  setCardSize: (size: number) => void;
  setLayout: (layout: 'card' | 'table') => void;
}

export function GridHeader(props: GridHeaderProps) {
  const navigate = useNavigate();
  const onAddNew = () => navigate("new")
  return (
    <div class="flex ai:center jc:space-between p:4|10">
      <AddNewButton onClick={onAddNew} />
      <div class="flex ai:center mb:10">
        <SearchBar
          handleChange={props.onSearch}
          placeholder="Search Data..."
          value={props.searchValue}
        />
        <IconButton
          icon={props.layout === 'table' ? 'fa6-regular:id-card' : 'fa:table'}
          onClick={() => props.setLayout(props.layout === 'table' ? 'card' : 'table')}
          title="Table Layout"
        />
        <Show when={props.layout === 'card'}>
          <input
            max="10"
            min="1"
            onInput={(e) => props.setCardSize(Number(e.currentTarget.value))}
            style={{ 'margin-left': '10px' }}
            type="number"
            value={props.cardSize}
          />
        </Show>
      </div>
    </div>
  );
}
