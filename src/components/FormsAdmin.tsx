// TODO make default component property applied to
import {graph, IdAttr, Vertex} from "../lib/graph";
import {createMemo, For, Match, Switch, useContext} from "solid-js";
import {Link} from "@solidjs/router";
import {WsContext} from "../utils/ws_events_dispatcher";
import {createStore} from "solid-js/store";
import {Record} from "../lib/Record";
import {SelectInputField} from "./input/SelectInputField";
import {onDataDirectoryImportClick, updateImportRecord} from "../lib/Import";
import {AbstractSingleForm, DynamicComponent, getComponentForCollRow} from "./DynamicForm";
import {GenericField} from "./input/GenaricField";
import {toTitle} from "case-switcher-js";

export const AllForms = () => {
    const allForms = () => graph.vertexLabelIdMap["Form"] || [];

    return (
        <div class="">
            <For each={allForms()}>{(vertexId) => <Link
                href={`/${graph.vertexes[vertexId].P[IdAttr]}/new`}>{graph.vertexes[vertexId].P[IdAttr]}</Link>}</For>
        </div>
    );
};
export const SimpleImport = (props: {}) => {
    const {Ws} = useContext(WsContext);
    const config = createStore({} as { record: Record });

    return (
        <>
            <SelectInputField
                component={"SelectBox"}
                data={{P: {}} as Vertex}
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
perm`
                            },
                        },
                    } as unknown as Vertex
                }
                setValue={(attr, vertex, data) => updateImportRecord(data, config[0].record)}
            />
            <AbstractSingleForm id={"new"} formId={"Import"} config={config}/>

            <GenericField
                meta={
                    {
                        P: {
                            component: "Button",
                            [IdAttr]: "meta",
                            props: {stylingMode: "contained", width: "120", type: "success"},
                        },
                    } as unknown as Vertex
                }
                data={{P: {meta: "Import"}} as unknown as Vertex}
                onClick={() => onDataDirectoryImportClick(config[0].record, Ws)}
            />
        </>
    );
}; // group of the fields
interface FormGroupPropertiesProps {
    metaAttributes: Vertex[];
    vertex: Vertex;

    setValue(attribute: Vertex, vertex: Vertex, data: any, valueSet?: boolean): Vertex | undefined;

    setValueGeneric(attribute: Vertex, vertex: Vertex, data: any): void;

    txnId: number;
    selectedLayout: Vertex;
}

export function FormGroupProperties(props: FormGroupPropertiesProps) {
    const {Ws} = useContext(WsContext);
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
                        const component = createMemo(() => getComponentForCollRow(metaVertex, props.vertex));
                        const Label = () => <>{toTitle(metaVertex.P.displayName || metaVertex.P[IdAttr] || metaVertex.P.key || '')}</>
                        const Content = () => <DynamicComponent
                            component={component()}
                            meta={metaVertex}
                            data={props.vertex}
                            setValue={props.setValue}
                            // disabled={props.d}
                            txnId={props.txnId}
                            isRealTime={false}
                        />

                        return (
                            <Switch>
                                <Match when={component() === "Table"}>
                                    <h3><Label/></h3>
                                    <Content/>
                                </Match>
                                <Match when={component() === "CollectionOption"}>
                                    <Content/>
                                </Match>
                                <Match when={props.selectedLayout}>
                                    <tr>
                                        <td class="pr:2" id={id}>
                                            <Label/>
                                        </td>
                                        <td class="flex gap:2 justify-content:space-between">
                                            <Content/>
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