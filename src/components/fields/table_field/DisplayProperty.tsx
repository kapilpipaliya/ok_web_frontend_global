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
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { getStringComponent } from "~/lib/graph/get/sync/getStringComponent";
import { type Id, IdAttr, useGraph, type Vertex } from "~/lib/graph/graph";
import { getColumnProps } from "~/lib/graph/mutate/form/addNewRow";
import { replaceVertexProperties } from "~/lib/graph/mutate/vertex";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";

import { useFormContext } from "../../form/FormContext";
import { CssEditor } from "./CssEditor";
import { DefaultValue } from "./DefaultValue";

export const getComponentClass = (componentName: string) => {
  switch (componentName) {
    case "CheckBox":
      return "min-w:50px";
    case "SelectBox":
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
    getMetaVertex: (columnId: Id) => Vertex;
    isNoPermissionCheck?: boolean;
    isRealTime: boolean;
    joinVertex: Vertex;
    onChange?: (data: any) => void;
    txnId: number;
  }>,
) {
  // if there is no parent FormContext, it should still work.
  const [formStore] = useFormContext();
  const [graph, setGraph] = useGraph();
  const metaVertex = createMemo(() => props.getMetaVertex(props.column.id));
  const outerOwner = getOwner();

  // this is used to add props to meta when meta is configured in json
  if (metaVertex().P.meta) {
    // TODO: when meta changed realtime its not updating.
    createComputed(
      on(
        () =>
          getPropsFromMetaExpression(
            graph,
            setGraph,
            metaVertex(),
            props.joinVertex,
          ),
        async (v) => {
          if (metaVertex().P.meta) {
            let metaData;
            if (formStore?.txnId) {
              const mutationData = formStore.txnId
                ? commitTxn(formStore.txnId, graph)
                : undefined;
              metaData = await getPropsFromMetaExpressionMGCall(
                metaVertex(),
                [props.joinVertex],
                mutationData,
                10,
              );
            } else {
              metaData = v;
            }
            const metaDataVal = removeUndefinedProperties(metaData, false, 10);

            const newMetaData = Object.assign(
              // when componentName is rendered dynamically graph.vertexes[metaVertex.P.templateId] value is undefined
              getColumnProps(
                graph.vertexes[metaVertex().P.templateId] ?? { P: {} },
                graph,
              ),
              metaDataVal,
            );

            replaceVertexProperties(
              0,
              metaVertex().id,
              graph,
              setGraph,
              newMetaData,
            );
          }
        },
      ),
    );
  }
  const [componentName, setComponentName] = createWritableMemo(() =>
    getComponent(props.column.id),
  );
  function getComponent(columnId: Id) {
    const columnMetaVertex = props.getMetaVertex(columnId);
    if (columnMetaVertex.P.componentName.includes("-")) {
      createComputed(
        on(
          () =>
            getSelectionOptions(
              graph,
              setGraph,
              columnMetaVertex.P.componentName,
              [props.joinVertex],
            ).vertexes,
          async (vertexes) => {
            let componentName = "";
            if (formStore?.txnId) {
              const mutationData = formStore.txnId
                ? commitTxn(formStore.txnId, graph)
                : undefined;
              const res = await getSelectionOptionsMGCall(
                [props.joinVertex],
                columnMetaVertex.P.componentName,
                mutationData,
                10,
              );
              if (isValidResponse(res) && typeof res.result === "string") {
                componentName = res.result;
              }
            } else {
              componentName = vertexes;
            }
            if (!componentName) {
              componentName = getStringComponent(graph)?.P.name;
            }
            setTimeout(() => {
              runWithOwner(outerOwner, () => {
                setComponentName(componentName);
              });
            });
          },
        ),
      );
    } else {
      return columnMetaVertex.P.componentName;
    }
  }

  const Content = () => (
    <>
      <Show when={componentName() === "Error"}>Error</Show>
      <DynamicComponent
        componentName={componentName()}
        data={props.joinVertex}
        disabled={props.disabled()}
        isLabelWrap={false}
        isNoPermissionCheck={props.isNoPermissionCheck}
        isRealTime={props.isRealTime}
        isTableInside={false}
        // When we have a Table we pass original Table Meta Vertex
        meta={
          componentName() === "DynamicTable"
            ? graph.vertexes[metaVertex().P.templateId]
            : metaVertex()
        }
        onChange={props.onChange}
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
          metaVertex().P.name === "value" &&
          ((props.joinVertex?.P.name ?? "").endsWith("Class") ||
            (props.joinVertex?.P.name ?? "") === "class")
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
