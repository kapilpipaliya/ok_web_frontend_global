import {
    Match,
    Show,
    Switch, useContext,
} from "solid-js";

import {IdAttr} from "../../lib/graph";
import {getTextColumnValue} from "./Components/Utils";
import {ComponentProps} from "../ComponentType";
import {
    Checkbox,
    Progress,
    Radio,
    RadioGroup,
    TextField,
} from "../solid-blocks/blocks";
import {PageItemRender} from "./GenaricField";

import {FileUploader} from "../solid-blocks/blocks/fileuploader";
import {setSelectedId} from "../pageStore";
import {setValueGlobal} from "../../lib/Utils";
import {WsContext} from "../../utils/ws_events_dispatcher";
import CommonDialog from "./Components/CommonDialog";
import {ExpressionBuilder} from "./Components/ExpressionBuilder";


export function GenericInputField(
    props: ComponentProps & {
        component: string;
        disabled: boolean;
        title: string;
        txnId: number;
    }
) {
    const {Ws} = useContext(WsContext);
    // const formContext = useContext(FormContext);
    // const outerOwner = getOwner();

    return (
        <div
            aria-labeledby={props["aria-labeledby"]}
            classList={{
                "width:100%": props.component === "TextArea",
            }}
        >
            <Show
                when={!props.disabled}
                fallback={getTextColumnValue(props.data?.P[props.meta.P[IdAttr]])}
            >
                <Switch>
                    <Match when={props.component === "Form"}>
                        <PageItemRender metaVertex={props.meta}/>
                    </Match>
                    <Match when={props.component === "FormSubmit"}>
                        <button
                            onClick={() => setSelectedId(props.meta.id)}
                            {...props.meta.P.props}
                        >
                            {props.data?.P[props.meta.P[IdAttr]] ??
                                props.meta.P.props.children}
                        </button>
                    </Match>
                    <Match when={props.component === "FormCancel"}>
                        <button
                            onClick={() => setSelectedId(props.meta.id)}
                            {...props.meta.P.props}
                        >
                            {props.data?.P[props.meta.P[IdAttr]] ??
                                props.meta.P.props.children}
                        </button>
                    </Match>
                    <Match when={props.component === "CheckBox"}>
                        <Checkbox
                            {...props.meta?.P.props}
                            onchange={(e: any) => {
                                props.setValue ? props.setValue(e.target.checked) : setValueGlobal(props.txnId!, props.meta, props.data, e.target.checked, Ws, false);
                            }}
                            align="left"
                            checked={
                                props.data?.P[props.meta.P[IdAttr]] ??
                                props.meta?.P.props?.checked
                            }
                        >{<PageItemRender metaVertex={props.meta}/>}</Checkbox>
                    </Match>
                    <Match when={props.component === "ColorBox"}>
                        <input
                            type="color"
                            {...props.meta?.P.props}
                            value={props.data?.P[props.meta.P[IdAttr]]}
                            onInput={e => {
                                props.setValue ? props.setValue(e.target.value) : setValueGlobal(props.txnId!, props.meta, props.data!, e.target.value, Ws, false);
                            }}
                        />
                    </Match>
                    <Match when={props.component === "DropDownBox"}>Dropdown</Match>
                    <Match when={props.component === "FileUploader"}>
                        <FileUploader
                            {...props.meta?.P.props}
                            image={props.meta?.P.props.image}
                        />
                    </Match>
                    <Match when={props.component === "HtmlEditor"}>
                        {props.data?.P[props.meta.P[IdAttr]]}
                    </Match>
                    <Match when={props.component === "NumberBox"}>
                        <TextField
                            placeholder={props.meta?.P.props.label ?? ""}
                            onchange={(e: any) => {
                                props.setValue ? props.setValue(e.target.value) : setValueGlobal(props.txnId!, props.meta, props.data!, e.target.value, Ws, false);
                            }}
                            {...props.meta?.P.props}
                            isNumber
                            value={props.data?.P[props.meta.P[IdAttr]]}
                        />
                    </Match>
                    <Match when={props.component === "Radio"}>
                        <Radio
                            {...props.meta?.P.props}
                            // value={props.data?.P[props.meta.P[IdAttr]] ?? ""}
                            onchange={(e: any) => {
                                props.setValue ? props.setValue(e.target.checked) : setValueGlobal(props.txnId!, props.meta, props.data!, e.target.checked, Ws, false);
                            }}
                            // name={props.meta?.P.props?.label ?? "radio"}
                            align="left"
                        >
                            {props.meta?.P.props?.label ?? "radio"}
                        </Radio>
                    </Match>
                    <Match when={props.component === "ProgressBar"}>
                        <Progress
                            style={{...props.meta?.P.props}}
                            {...props.meta?.P.props}
                        />
                    </Match>
                    <Match when={props.component === "RadioGroup"}>
                        <RadioGroup>
                            <PageItemRender metaVertex={props.meta}/>
                        </RadioGroup>
                    </Match>

                    <Match when={props.component === "TextArea"}>
                        <TextField
                            class="global-style"
                            {...props.meta?.P.props}
                            onchange={(e: any) => {
                                props.setValue ? props.setValue(e.target.value) : setValueGlobal(props.txnId!, props.meta, props.data!, e.target.value, Ws, false);
                            }}
                            placeholder={props.meta?.P.props?.label ?? props.title}

                            multiline
                            value={props.data?.P[props.meta.P[IdAttr]]}
                        />
                    </Match>
                    <Match
                        when={props.component === "TextBox" && props.data && props.meta && props.meta.P && props.meta.P[IdAttr] && props.data.P && props.data.P[props.meta.P[IdAttr]] && props.data.P[props.meta.P[IdAttr]].toString().includes(')+(')}>
                        <TextField
                            class="global-style"
                            {...props.meta?.P.props}
                            onchange={(e: any) => {
                                props.setValue ? props.setValue(e.target.value) : setValueGlobal(props.txnId!, props.meta, props.data!, e.target.value, Ws, false);
                            }}
                            placeholder={props.meta?.P.props?.label ?? props.title}
                            value={props.data?.P[props.meta.P[IdAttr]]}
                            trailing={<ExpressionBuilder content={props.data?.P[props.meta.P[IdAttr]]} meta={props.meta}
                                                     data={props.data} title={props.title} txnId={props.txnId} component={props.component}
                                                     setValue={props.setValue} disabled={props.disabled}/>}
                        />

                    </Match>
                    <Match when={props.component === "TextBox"}>
                        <TextField
                            class="global-style"
                            {...props.meta?.P.props}
                            placeholder={props.meta?.P.props?.label ?? props.title}
                            onchange={(e: any) => {
                                props.setValue ? props.setValue(e.target.value) : setValueGlobal(props.txnId!, props.meta, props.data!, e.target.value, Ws, false);
                            }}
                            value={props.data?.P[props.meta.P[IdAttr]]}
                        />
                    </Match>
                </Switch>
            </Show>
        </div>
    );
}

// Note:
// what if some properties are removed from meta.
// We should remember previous keys and remove when some keys are changed.
