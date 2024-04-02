import CommonDialog from "./CommonDialog";
import {batch, createResource, createSignal, getOwner, runWithOwner, Show} from "solid-js";
import {For} from "solid-js";
import {TextField} from "../../solid-blocks/blocks";
import CustomButton from "../../solid-blocks/blocks/buttons";
import {Icon} from "@iconify-icon/solid";
import {commitTxn, getNewTxnId, graph, Vertex} from "../../../lib/graph";
import MultiSelect from "../../solid-multiselect";
import {binops} from "../../../lib/jsep";
import {
    getChildVertex,
    getSelectionOptions,
    getValueFromVertexOrKey,
    onChangeHandler,
    setValueGlobal
} from "../../../lib/Utils";
import {setSelectionValue} from "../SelectionUtils";
import {selectedValue, setParentValue} from "../SelectInputField";

export const ExpressionBuilder = (props: any) => {

    const [contentList, setContentList] = createSignal(props.content.split("+"));

    const handleInsert = () => {
        setContentList(prev => [...prev, '']);
    };

    const handleDelete = (index: number) => {
        setContentList(prev => prev.filter((_, i) => i !== index));
    };
    const outerOwner = getOwner();
    const onChangeSelect = (e: any, isRemove: any) => {
        let data;
        let optionId: number | number[] | undefined;
        let optionvalue: any;
        if (isRemove && e.length > 0) {
            data = [];
        } else {
            data = e[0];
            optionId = data!.id;
            optionvalue = data!.P.name;
        }
        runWithOwner(outerOwner, () => {
            batch(() => {
                // note: valueChanged is fired even when the value is changed programmatically,
                // that is causing problem: when transaction is reverted, it again calls onValueChanged callback.
                // used e.event check to prevent this.
                // on simple import screen when value is selected first time event is not there
                // if (e.previousValue && !e.event) {
                // TODO: TO Prevent Onchange event firing on select set a flag
                // when it should not fire the event In the form
                // and remove it
                // when calculations are done.
                // return;
                // }
                // only way to solve multi onValueChangeFire is set null value only. when undefined we assume value should not be set and changed programmatically again.

                if (!props.data) {
                    return;
                }
                if (props.isRealTime) {
                    props.txnId = getNewTxnId();
                }
                if (getValueFromVertexOrKey(props.meta.P.props, "stringValue")) {
                    props.setValue ? props.setValue(optionvalue) : setValueGlobal(props.txnId!, props.meta, props.data, data, Ws, false);
                } else if (getValueFromVertexOrKey(props.meta.P.props, "items")) {
                    props.setValue ? props.setValue(optionvalue) : setValueGlobal(props.txnId!, props.meta, props.data, data, Ws, false);
                } else if (getValueFromVertexOrKey(props.meta.P.props, "inward")) {
                    setParentValue(props.txnId || 0, props.data, props.meta, optionId);
                } else {
                    setSelectionValue(props.txnId || 0, props.data, props.meta, optionId);
                }
                onChangeHandler(
                    props.txnId || 0,
                    record?.vertex,
                    props.data,
                    props.meta
                );
                console.log(optionvalue);
                if (props.isRealTime) commitTxn(props.txnId || 0, Ws);
            });
        });
    };
    return (
        <div>
            <CommonDialog
                buttonLabel={'carbon:settings-edit'}
                title="Expression Builder"
                body={
                    <div>
                        <For each={contentList()}>
                            {(item, index) =>
                                <div class={'p:2'}>
                                    <div class={'flex ai:center jc:space-between mt:4 mb:2'}><span
                                        class={'font-weight:medium f:14'}>Expression : {index() + 1}</span>
                                        <Show when={index() > 0}>
                                            <Icon
                                                icon={'fluent:delete-28-regular'} height={20} width={20}
                                                class={'cursor:pointer'} style={{"color": 'red'}}
                                                onclick={() => handleDelete(index())}/>
                                        </Show></div>
                                    <div class={'flex ai:center jc:space-between'}>
                                        <TextField
                                            labelClass={'w:100% mr:.5rem'}
                                            class="global-style flex-col"
                                            {...props.meta?.P.props}
                                            placeholder={'Write Expression...'}
                                            onchange={(e: any) => {
                                                const updatedList = [...contentList()];
                                                updatedList[index()] = e.target.value;
                                                setContentList(updatedList);
                                            }}
                                            value={item}
                                        />
                                        <div class={'flex'}>
                                            <MultiSelect
                                                disable={props.disabled!}
                                                options={Object.keys(binops)}
                                                avoidHighlightFirstOption
                                                placeholder={'Expression'}
                                                onSelect={(e) => onChangeSelect(e, false)}
                                                onRemove={(e) => onChangeSelect(e, true)}
                                                customCloseIcon={<Icon icon={"ic:round-close"}/>}
                                                selectionLimit={1}
                                                singleSelect
                                            />
                                        </div>
                                    </div>
                                </div>
                            }
                        </For>
                    </div>
                }
                footer={(toggle: () => void) =>
                    <div>
                        <CustomButton
                            variant={'contained'}
                            style={{'margin-right': '5px'}}
                            {...props.meta.P.props}
                            onclick={handleInsert}
                            {...props.meta.P.props}
                        >
                            Add
                        </CustomButton>
                        <CustomButton
                            variant={'custom'} class={'fg:rgb(252,0,0) b:1|solid|rgb(252,0,0)'}
                            style={{'margin-right': '5px'}}
                            onclick={toggle}
                            {...props.meta.P.props}
                        >
                            Cancel
                        </CustomButton>
                        <CustomButton
                            variant="contained"
                            {...props.meta.P.props}
                        >
                            Submit
                        </CustomButton>
                    </div>
                }
                closeOnEsc={true}
                dialogClass="min-w:30% r:10px"
            />
        </div>
    );
};
