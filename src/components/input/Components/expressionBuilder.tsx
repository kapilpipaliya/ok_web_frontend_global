import CommonDialog from "./CommonDialog";
import {Show} from "solid-js";
import {For} from "solid-js";
import {TextField} from "../../solid-blocks/blocks";
import CustomButton from "../../solid-blocks/blocks/buttons";
import {Icon} from "@iconify-icon/solid";
import {Vertex} from "../../../lib/graph";
import MultiSelect from "../../solid-multiselect";
import {binops, unops} from "../../../lib/jsep";
import {createStore} from "solid-js/store";
import {Option} from "../../solid-multiselect/Option";

export const ExpressionBuilder = (props: {content: string, meta: Vertex}) => {

    let state = props.content.split("+").map(value => ({value} as { unAryOperator?: Option, value: string, binAryOperator?: Option}));

    const [contentList, setContentList] = createStore(state);

    const handleInsert = () => {
        setContentList(prev => [...prev, {value: ''}]);
    };

    const handleDelete = (index: number) => {
        setContentList(prev => prev.filter((_, i) => i !== index));
    };

    const onUnaryOperatorChange = (index: number, value?: Option) => {
      setContentList(index, {unAryOperator: value});
    };
    const onBinaryOperatorChange = (index: number, value?: Option) => {
      setContentList(index, {binAryOperator: value});
    };

    return (
        <div>
            <CommonDialog
                buttonLabel={'carbon:settings-edit'}
                title="Expression Builder"
                body={
                    <div>
                        <For each={contentList}>
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
                                        <div class={'flex'}>
                                            <MultiSelect
                                                isObject
                                                displayValueParent="P"
                                                displayValueChild="name"
                                                options={Object.keys(unops).map((key) => ({id: key, P: {name: key}}))}
                                                avoidHighlightFirstOption
                                                placeholder={'Unary'}
                                                onSelect={(e) => onUnaryOperatorChange(index(),e[0])}
                                                onRemove={(e) => onUnaryOperatorChange(index())}
                                                customCloseIcon={<Icon icon={"ic:round-close"}/>}
                                                selectionLimit={1}
                                                singleSelect
                                                // selectedValues={}
                                            />
                                        </div>
                                        <TextField
                                            labelClass={'w:100% mr:.5rem ml:.5rem'}
                                            class="global-style flex-col"
                                            {...props.meta?.P.props}
                                            placeholder={'Write Expression...'}
                                            onchange={(e: any) => {
                                                const updatedList = [...contentList];
                                                updatedList[index()] = e.target.value;
                                                setContentList(updatedList);
                                            }}
                                            value={item.value}
                                        />
                                        <div class={'flex'}>
                                            <MultiSelect
                                                isObject
                                                displayValueParent="P"
                                                displayValueChild="name"
                                                options={Object.keys(binops).map((key) => ({id: key, P: {name: key}}))}
                                                avoidHighlightFirstOption
                                                placeholder={'Binary'}
                                                onSelect={(e) => onBinaryOperatorChange(index(),e[0])}
                                                onRemove={(e) => onBinaryOperatorChange(index())}
                                                customCloseIcon={<Icon icon={"ic:round-close"}/>}
                                                selectionLimit={1}
                                                singleSelect
                                                // selectedValues={}
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
                            class="border-color:#FF0000 color:#FF0000 mr:5"

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
