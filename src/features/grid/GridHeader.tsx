import { useNavigate } from "@solidjs/router";
import { type JSX, Show } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { TooltipWrapper } from "~/components/styled/TooltipWrapper";
import { SearchBar } from "~/features/css_editor/StyleEditor/SearchBar";
import { headerIconButtonClass } from "~/pages/constants/constant";

import { IconButton } from "../../components/styled/IconButton";
import { AddNewButton } from "./AddNewButton";
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

  const isTableLayout = () => gridState.layout === "table";

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
      <div class="flex ai:center gap:8 mb:10">
        <SearchBar
          handleChange={props.onSearch}
          placeholder="Search Data..."
          value={gridState.search}
        />
        <IconButton
          class={headerIconButtonClass}
          icon={isTableLayout() ? "ph:identification-card" : "ph:table"}
          onClick={() =>
            setGridState("layout", isTableLayout() ? "card" : "table")
          }
          title={`Switch to ${isTableLayout() ? "Card" : "Table"} Layout`}
        />
        <Show when={!isTableLayout()}>
          <TooltipWrapper content="Column Size">
            <input
              class={`${PROPERTIES.Css.TextField.replace("w:100%", "")}`}
              max="10"
              min="1"
              onInput={(e) =>
                setGridState("cardSize", Number(e.currentTarget.value))
              }
              type="number"
              value={gridState.cardSize}
            />
          </TooltipWrapper>
        </Show>
      </div>
    </div>
  );
}
