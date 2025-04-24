import { klona } from "klona";
import { Icon } from "@iconify-icon/solid";
import { createSignal } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { IconButton } from "~/components/styled/IconButton";
import { generateTableInputMeta } from "~/features/page_designer/settings/properties/formgroup/permission_field/functions/generateTableInputMeta";
import { useGraph } from "~/lib/graph/GraphContext";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function Permission() {
  const [graph] = useGraph();
  const [addRowFn, setAddRowFn] = createSignal<(() => void) | undefined>();

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const uniqueConstrainsMetaAttribute = klona(
    FormMetaData[formStoreVertex()?.P.formId as keyof typeof FormMetaData]
      .attributes,
  ).find((meta) => meta.key === "PermGlobal");
  if (!uniqueConstrainsMetaAttribute) {
    return <></>;
  }
  
  const { metaVertexId } = generateTableInputMeta(
    uniqueConstrainsMetaAttribute,
  );

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
          Permissions
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
          data={formStoreVertex()?.P.formDataId ? graph.vertexes[formStoreVertex().P.formDataId] : undefined}
          hideAddButton={true}
          isNoPermissionCheck={true}
          isRealTime={false}
          meta={graph.vertexes[metaVertexId]}
          onAddRef={setAddRowFn}
        />
      </As>
    </As>
  );
}
