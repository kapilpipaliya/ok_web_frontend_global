import { Icon } from "@iconify-icon/solid";
import { createSignal } from "solid-js";
import type { Vertex } from "~/lib/graph/graph";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { PlusIconButton } from "~/components/styled/PlusIconButton";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

interface TablePanelProps {
  title?: string;
  icon?: string;
  data?: Vertex;
  meta: Vertex;
  addButtonAriaLabel?: string;
  isNoPermissionCheck?: boolean;
  isRealTime?: boolean;
}

export function TablePanel(props: TablePanelProps) {
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
          {props.icon && <Icon icon={props.icon} />}
          {props.title}
        </As>
        <PlusIconButton
          onClick={handleAddNewRow}
          ariaLabel={props.addButtonAriaLabel || "Add new row"}
        />
      </As>

      <As
        as="div"
        css={css`
          margin-top: 0.5rem;
        `}
      >
        <TableInputField
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
