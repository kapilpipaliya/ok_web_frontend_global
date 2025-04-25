import { Icon } from "@iconify-icon/solid";
import { createSignal } from "solid-js";
import type { Vertex } from "~/lib/graph/graph";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { IconButton } from "~/components/styled/IconButton";
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { useTheme } from "~/lib/context/ThemeContext";

interface PermissionPanelProps {
  title?: string;
  data?: Vertex;
  meta: Vertex;
  addNewButtonText?: string;
  isNoPermissionCheck?: boolean;
  isRealTime?: boolean;
}

export function PermissionPanel(props: PermissionPanelProps) {
  const [addRowFn, setAddRowFn] = createSignal<(() => void) | undefined>();

  const handleAddNewRow = () => {
    const fn = addRowFn();
    if (fn) {
      fn();
    }
  };

  return (
    <As
      as="div"
      css={css`
        margin-top: 6px;
      `}
    >
      <As
        as="div"
        css={css`
          display: flex;
          gap: 0.5rem;
          align-items: center;
        `}
      >
        <As
          as="h3"
          css={css`
            color: rgb(17,24,39);
            font-size: 1rem;
            font-weight: 600;
            line-height: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          `}
        >
          <Icon icon="ph:lock" />
          {props.title || "Permissions"}
        </As>
        <IconButton
          icon="ph:plus"
          css={css`
            background-color: \${args.theme.var.color.primary_15};
            border: none;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            &:hover {
              background-color: \${args.theme.var.color.primary_50};
            }
          `}
          size="18"
          aria-label="Add new permission"
          onClick={handleAddNewRow}
        />
      </As>

      <As
        as="div"
        css={css`
          margin-top: 0.5rem;
        `}
      >
        <TableInputField
          addNewButtonText={props.addNewButtonText || "Add New Permission"}
          data={props.data}
          hideAddButton={true}
          isNoPermissionCheck={props.isNoPermissionCheck ?? true}
          isRealTime={props.isRealTime ?? false}
          meta={props.meta}
          onAddRef={setAddRowFn}
        />
      </As>
    </As>
  );
} 