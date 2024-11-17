import { useNavigate } from "@solidjs/router";
import { type JSX, Show } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { SearchBar } from "../css_properties/StyleEditor/SearchBar";
import { IconButton } from "../styled/IconButton";
import { AddNewButton } from "./AddNew";
import { useDataGridContext } from "./DataGridContext";

interface GridHeaderProps {
  CustomAddNewButton?: (props: {
    disabled: boolean;
    onClick: () => void;
  }) => JSX.Element;
  formMetaData?: IFormMetaData | null;
  onSearch: (value: string) => void;
}

export function GridHeader(props: Readonly<GridHeaderProps>) {
  const [gridState, setGridState] = useDataGridContext();
  const navigate = useNavigate();
  const onAddNew = () => navigate(`/admin/${gridState.tableId}/new`);

  return (
    <div class="flex ai:center jc:space-between p:4|10">
      <Dynamic
        component={props.CustomAddNewButton || AddNewButton}
        disabled={
          gridState.isNoPermissionCheck
            ? false
            : !!props.formMetaData && !gridState.hasInsertPermission()
        }
        onClick={onAddNew}
      />
      <div class="flex ai:center mb:10">
        <SearchBar
          handleChange={props.onSearch}
          placeholder="Search Data..."
          value={gridState.search}
        />
        <IconButton
          icon={
            gridState.layout === "table" ? "fa6-regular:id-card" : "fa:table"
          }
          onClick={() =>
            setGridState(
              "layout",
              gridState.layout === "table" ? "card" : "table",
            )
          }
          title="Table Layout"
        />
        <Show when={gridState.layout === "card"}>
          <input
            max="10"
            min="1"
            onInput={(e) =>
              setGridState("cardSize", Number(e.currentTarget.value))
            }
            style={{ "margin-left": "10px" }}
            type="number"
            value={gridState.cardSize}
          />
        </Show>
      </div>
    </div>
  );
}
