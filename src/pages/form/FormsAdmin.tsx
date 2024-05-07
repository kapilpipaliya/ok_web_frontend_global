// TODO make default component property applied to
import { GraphContext, IdAttr, Vertex } from "~/lib/graph";
import { createMemo, For, Match, Switch, useContext } from "solid-js";
import { A } from "@solidjs/router";
import { WsContext } from "~/lib/ws_events_dispatcher";
import { createStore } from "solid-js/store";
import { APP_BASE_URL, Record } from "~/lib/Utils";
import { SelectInputField } from "~/components/dynamic/fields/input/SelectInputField";
import { onDataDirectoryImportClick, updateImportRecord } from "~/lib/Import";
import {
  AbstractSingleForm,
  getComponentForCollRow,
} from "~/components/dynamic/components/DynamicForm";
import { DynamicComponent } from "~/components/dynamic/components/DynamicComponent";
import { GenericField } from "~/components/dynamic/fields/static/GenericFieldComponent";
import { toTitle } from "case-switcher-js";
import { ClassDesignTab } from "~/components/css-editor/PropertiesTabs";

export const AllForms = () => {
  const [graph, setGraph] = useContext(GraphContext)!;
  const allForms = () => graph.vertexLabelIdMap["Form"] || [];

  return (
    <div class="">
      <For each={allForms()}>
        {(vertexId) => (
          <A href={`${APP_BASE_URL}/${graph.vertexes[vertexId].P[IdAttr]}/new`}>
            {graph.vertexes[vertexId].P[IdAttr]}
          </A>
        )}
      </For>
    </div>
  );
};
export const SimpleImport = (props: {}) => {
  const { Ws } = useContext(WsContext);
  const config = createStore({} as { record: Record });
  const [graph, setGraph] = useContext(GraphContext)!;
  return (
    <>
      <SelectInputField
        component={"SelectBox"}
        data={{ P: {} } as Vertex}
        meta={
          {
            P: {
              [IdAttr]: "import",
              props: {
                stringValue: true,
                items: `dataType
component
dataTypeDefault
lookup
attribute
user
role
perm`,
              },
            },
          } as unknown as Vertex
        }
        // @ts-ignore
        setValue={(attr, vertex, data) =>
          updateImportRecord(graph, setGraph, data, config[0].record)
        }
      />
      <AbstractSingleForm
        id={"new"}
        formId={"Import"}
        config={config}
        graph={graph}
      />

      <GenericField
        meta={
          {
            P: {
              component: "Button",
              [IdAttr]: "meta",
              props: {
                children: "Import",
                onClick: () =>
                  onDataDirectoryImportClick(
                    config[0].record,
                    Ws,
                    graph,
                    setGraph,
                  ),
              },
            },
          } as unknown as Vertex
        }
      />
    </>
  );
}; // group of the fields
interface FormGroupPropertiesProps {
  metaAttributes: Vertex[];
  vertex: Vertex;

  setValue(meta: Vertex, data: any): Vertex | undefined;

  txnId: number;
  selectedLayout: Vertex;
}

export function FormGroupProperties(props: FormGroupPropertiesProps) {
  // @ts-ignore
  const { Ws } = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  return (
    <>
      {/*<div class="dx-field">*/}
      {/*  <div class="dx-field-label">*/}
      {/*    Data*/}
      {/*  </div>*/}
      {/*  <div class="dx-field-value flex gap:2 justify-content:space-between">*/}
      {/*    <GenericInputField*/}
      {/*        data={props.vertex}*/}
      {/*        meta={*/}
      {/*          {*/}
      {/*            P: {*/}
      {/*              [IdAttr]: "data",*/}
      {/*            },*/}
      {/*          } as unknown as Vertex*/}
      {/*        }*/}
      {/*        disabled={false}*/}
      {/*        component={"TextBox"}*/}
      {/*        setValue={props.setValue}*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*</div>*/}
      <table class="min-w:100%">
        <tbody>
          <For each={props.metaAttributes}>
            {(metaVertex) => {
              const id = props.vertex.id + metaVertex.P[IdAttr] + "Label";
              const component = createMemo(() =>
                getComponentForCollRow(
                  metaVertex,
                  props.vertex,
                  graph,
                  setGraph,
                ),
              );
              const Label = () => (
                <>
                  {toTitle(
                    metaVertex.P.displayName ||
                      metaVertex.P[IdAttr] ||
                      metaVertex.P.key ||
                      "",
                  )}
                </>
              );
              const Content = () => (
                <DynamicComponent
                  component={component()}
                  meta={metaVertex}
                  data={props.vertex}
                  setValue={(data) => props.setValue(metaVertex, data)}
                  // disabled={props.d}
                  txnId={props.txnId}
                  isRealTime={false}
                />
              );

              return (
                <Switch>
                  <Match when={metaVertex.P.name === "class"}>
                    <ClassDesignTab
                      component={component()}
                      meta={metaVertex}
                      data={props.vertex}
                      setValue={(data) => props.setValue(metaVertex, data)}
                      txnId={props.txnId}
                    />
                  </Match>
                  <Match when={component() === "Table"}>
                    <h3>
                      <Label />
                    </h3>
                    <Content />
                  </Match>
                  <Match when={component() === "CollectionOption"}>
                    <Content />
                  </Match>
                  <Match when={props.selectedLayout}>
                    <tr>
                      <td class="pr:2" id={id}>
                        <Label />
                      </td>
                      <td class="justify-content:end">
                        <Content />
                        {/* Select Rules: */}
                        {/*<SelectInputField*/}
                        {/* component={"SelectBox"}*/}
                        {/* data={{ P: {} } as Vertex}*/}
                        {/* meta={*/}
                        {/*   {*/}
                        {/*     P: {*/}
                        {/*       [IdAttr]: "import",*/}
                        {/*       props: {*/}
                        {/*         displayExpr: "$P.name",*/}
                        {/*         collection: `ids:'${props.selectedLayout.id}'->Rules`*/}
                        {/*       },*/}
                        {/*     },*/}
                        {/*   } as unknown as Vertex*/}
                        {/* }*/}
                        {/* setValue={(attr,vertex, data) => 0}*/}
                        {/*/>*/}
                      </td>
                    </tr>
                  </Match>
                </Switch>
              );
            }}
          </For>
        </tbody>
      </table>
    </>
  );
}
