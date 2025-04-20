import { createWritableMemo } from "@solid-primitives/memo";
import { toTitle } from "case-switcher-js";
import {
  type Accessor,
  createComputed,
  createMemo,
  getOwner,
  Match,
  on,
  runWithOwner,
  Show,
  Switch,
} from "solid-js";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { getComponentLabel } from "~/features/page_designer/functions/component/getComponentLabel";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { evalExpression } from "~/lib/expression_eval";
import { getStringComponent } from "~/lib/graph/get/sync/format/getStringComponent";
import { IdAttr, type Vertex } from "~/lib/graph/graph";
import { useGraph } from "~/lib/graph/GraphContext";

import {
  type FormStoreObject,
  useFormContext,
} from "../../../form/context/FormContext";
import { CssEditor } from "./CssEditor";
import { DefaultValue } from "./DefaultValue";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export const getComponentClass = (componentName: string) => {
  switch (componentName) {
    case "CheckBox":
      return "min-width:50px";
    case "Select":
      return "min-width:200px";
    case "TextArea":
      return "min-width:200px";
    default:
      return "min-width:150px";
  }
};

// Component to display individual properties
export function DisplayProperty(
  props: Readonly<{
    column: Vertex;
    disabled: Accessor<boolean>;
    isNoPermissionCheck?: boolean;
    isRealTime: boolean;
    joinVertex: Vertex;
    // onChange?: (data: any) => void;
    txnId: number;
  }>,
) {
  const formId = useFormContext();
  const [graph, setGraph] = useGraph();
  const formVertex = () =>
    formId ? (graph.vertexes[formId] as Vertex<FormStoreObject>) : undefined;
  const metaVertex = createMemo(() => props.column);
  const outerOwner = getOwner();

  const [componentName, setComponentName] = createWritableMemo(() =>
    getComponent(props.column),
  );

  function getComponent(column: Vertex) {
    const componentNameValue = getComponentLabel(graph, column);
    if (componentNameValue?.includes("::")) {
      createComputed(
        on(
          () =>
            evalExpression(componentNameValue, {
              graph,
              setGraph,
              vertexes: [props.joinVertex],
            }),
          async (value) => {
            // to avoid error:  ReferenceError: Cannot access 'setComponentName' before initialization
            setTimeout(() => {
              runWithOwner(outerOwner, () => {
                setComponentName(value || getStringComponent());
              });
            });
            let componentNameNew = "";
            if (formVertex()?.P.txnId) {
              const res = await fetchDataFromDB(
                { expression: componentNameValue },
                {
                  nodes: {},
                  relationships: {},
                  vertexes: [props.joinVertex],
                },
              );
              if (isValidResponse(res) && typeof res.result === "string") {
                componentNameNew = res.result;
              } else {
                componentNameNew = value;
              }
            } else {
              componentNameNew = value;
            }
            if (!componentNameNew) {
              componentNameNew = getStringComponent();
            }
            setTimeout(() => {
              runWithOwner(outerOwner, () => {
                setComponentName(componentNameNew);
              });
            });
          },
        ),
      );
    } else {
      return componentNameValue;
    }
  }

  const Content = () => (
    <>
      <Show when={componentName() === "Error"}>Error</Show>
      <DynamicComponent
        // Dynamic component only supported on table
        componentName={componentName()}
        data={props.joinVertex}
        disabled={props.disabled()}
        isLabelWrap={false}
        isNoPermissionCheck={props.isNoPermissionCheck}
        isRealTime={props.isRealTime}
        // TODO: Remove this prop
        isTableInside={false}
        // When we have a Table we pass original Table Meta Vertex
        meta={metaVertex()}
        noLabel={true}
        // we cant use props.onChange in table cell, let dynamic component use its own onChange for the data.
        // onChange={props.onChange}
        title={toTitle(
          props.column.P.displayName || props.column.P[IdAttr] || "",
        )}
        txnId={props.txnId}
      />
    </>
  );

  return (
    <Switch>
      <Match when={metaVertex().P.hide}>
        <As
          as="td"
          css={css`
  align-content: center;
`}
        >
          <As
            as="div"
            css={css`
            ${getComponentClass(componentName()!)}
            display: flex;
            align-items: center;
            justify-content: center;
`}
          >
            <DefaultValue
              joinVertex={props.joinVertex}
              metaVertex={metaVertex()}
            />
          </As>
        </As>
      </Match>
      <Match
        when={
          metaVertex().P.key === "value" &&
          ((props.joinVertex?.P.key ?? "").endsWith("Class") ||
            (props.joinVertex?.P.key ?? "") === "class")
        }
      >
        <As
          as="td"
          css={css`
  align-content: center;
`}
        >
          <As
            as="div"
            css={css`
  display: flex;
  align-items: center;
  justify-content: center;
`}
          >
            <CssEditor
              joinVertex={props.joinVertex}
              metaVertex={metaVertex()}
              txnId={props.txnId}
            />
          </As>
        </As>
      </Match>
      <Match when={componentName() === "DynamicTable"}>
        <As
          as="td"
          css={css`
  align-content: center;
`}
        >
          <Show when={!props.disabled()}>
            <As
              as="div"
              css={css`
  ${getComponentClass(componentName()!)}
  display: flex;
  align-items: center;
  justify-content: center;
`}
            >
              <DefaultValue
                joinVertex={props.joinVertex}
                metaVertex={metaVertex()}
              />
              <Content />
            </As>
          </Show>
        </As>
      </Match>
      <Match when={true}>
        <As
          as="td"
          css={css`
  ${getComponentClass(componentName()!)}
  align-content: center;
  padding: 1px;
`}
        >
          <As
            as="div"
            css={css`
  align-items: center;
`}
          >
            <DefaultValue
              joinVertex={props.joinVertex}
              metaVertex={metaVertex()}
            />
            <Content />
          </As>
        </As>
      </Match>
    </Switch>
  );
}
