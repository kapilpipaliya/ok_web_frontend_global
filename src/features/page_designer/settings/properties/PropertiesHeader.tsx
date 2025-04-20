import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { useGraph } from "~/lib/graph/GraphContext";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

// depricated:
export function PropertiesHeader() {
  const [graph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const _formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <As
      as="div"
      css={css`
  display: flex;
  align-items: center;
  cursor: pointer;
  justify-content: space-between;
`}
    >
      <As
        as="div"
        css={css`
  font-size: 16px;
  display: flex;
  font-weight: bold;
  margin-bottom: 2px;
  margin-left: 5px;
  padding: 3px 0px;
  text-align: left;
`}
      >
        Properties
        {/* <OpenComponentSettings id={formStoreVertex()?.P.selectedComponent as string} />
        <OpenComponentURL
          meta={graph.vertexes[formStoreVertex()?.P.selectedComponent]}
        /> */}
      </As>
    </As>
  );
}
