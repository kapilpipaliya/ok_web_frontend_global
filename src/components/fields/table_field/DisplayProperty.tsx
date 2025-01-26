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
import { getPropsFromMetaExpressionMGCall } from "~/cypher/get/client/getPropsFromMetaExpressionMGCall";
import { getSelectionOptionsMGCall } from "~/cypher/get/client/getSelectionOptionsMGCall";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { removeUndefinedProperties } from "~/lib/data_structure/removeUndefinedProperties";
import { getPropsFromMetaExpression } from "~/lib/graph/get/sync/getPropsFromMetaExpression";

import { getStringComponent } from "~/lib/graph/get/sync/getStringComponent";
import { type Id, IdAttr, useGraph, type Vertex } from "~/lib/graph/graph";
import { replaceVertexProperties } from "~/lib/graph/mutate/vertex";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";

import { useFormContext, type FormStoreObject } from "../../form/context/FormContext";
import { CssEditor } from "./CssEditor";
import { DefaultValue } from "./DefaultValue";
import { klona } from "klona/json";
import { getComponentLabel } from "~/components/page_designer/functions/getComponentLabel";
import { evalExpression } from "~/lib/expression_eval";

export const getComponentClass = (componentName: string) => {
  switch (componentName) {
    case "CheckBox":
      return "min-w:50px";
    case "Select":
      return "min-w:200px";
    case "TextArea":
      return "min-w:200px";
    case "TextField":
      return "min-w:150px";
    default:
      return "";
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
    onChange?: (data: any) => void;
    txnId: number;
  }>,
) {
  const formId = useFormContext();
  const [graph, setGraph] = useGraph();
  const formVertex = () => formId ? graph.vertexes[formId] as Vertex<FormStoreObject> : undefined;
  const metaVertex = createMemo(() => props.column);
  const outerOwner = getOwner();

  const [componentName, setComponentName] = createWritableMemo(() =>
    getComponent(props.column),
  );
  function getComponent(column: Vertex) {
    const componentNameValue = column.P.componentName || getComponentLabel(graph, column);
    if (componentNameValue?.includes("::")) {
      createComputed(
        on(
          () =>
            evalExpression(componentNameValue, {
            graph,
            setGraph,
            vertexes: [props.joinVertex]
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
              const mutationData = formVertex()?.P.txnId
                ? commitTxn(formVertex()!.P.txnId, graph)
                : undefined;
              const res = await getSelectionOptionsMGCall(
                [props.joinVertex],
                componentNameValue,
                mutationData,
                10,
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
      <Match when={metaVertex().P.hidden}>
        <td class="align-content:center">
          <div
            class={`${getComponentClass(componentName())} flex ai:center jc:center`}
          >
            <DefaultValue
              joinVertex={props.joinVertex}
              metaVertex={metaVertex()}
            />
          </div>
        </td>
      </Match>
      <Match
        when={
          metaVertex().P.key === "value" &&
          ((props.joinVertex?.P.key ?? "").endsWith("Class") ||
            (props.joinVertex?.P.key ?? "") === "class")
        }
      >
        <td class="align-content:center">
          <div class="flex ai:center jc:center">
            <CssEditor
              joinVertex={props.joinVertex}
              metaVertex={metaVertex()}
              txnId={props.txnId}
            />
          </div>
        </td>
      </Match>
      <Match when={componentName() === "DynamicTable"}>
        <td class="align-content:center">
          <Show when={!props.disabled()}>
            <div
              class={`${getComponentClass(componentName())} flex ai:center jc:center`}
            >
              <DefaultValue
                joinVertex={props.joinVertex}
                metaVertex={metaVertex()}
              />
              <Content />
            </div>
          </Show>
        </td>
      </Match>
      <Match when={true}>
        <td
          class={`${getComponentClass(componentName())} align-content:center padding:1px`}
        >
          <div class="align-items:center">
            <DefaultValue
              joinVertex={props.joinVertex}
              metaVertex={metaVertex()}
            />
            <Content />
          </div>
        </td>
      </Match>
    </Switch>
  );
}
