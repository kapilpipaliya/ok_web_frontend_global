import CommonDialog from "./CommonDialog";
import {createSignal} from "solid-js";
import {For} from "solid-js";
import {TextField} from "../../solid-blocks/blocks";
import CustomButton from "../../solid-blocks/blocks/buttons";
import {Icon} from "@iconify-icon/solid";

export const ExpressionBuilder = (props: any) => {

    const [contentList, setContentList] = createSignal(props.content.split("+"));

    const handleInsert = () => {
        setContentList(prev => [...prev, '']);
    };

    const handleDelete = (index: number) => {
        setContentList(prev => prev.filter((_, i) => i !== index));
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
                                    <span class={'font-weight:medium f:14'}>Expression : {index() + 1}</span>
                                    <TextField
                                        class="global-style"
                                        {...props.meta?.P.props}
                                        placeholder={props.meta?.P.props?.label ?? props.title}
                                        onchange={(e: any) => {
                                            const updatedList = [...contentList()];
                                            updatedList[index()] = e.target.value;
                                            setContentList(updatedList);
                                        }}
                                        value={item}
                                        trailing={<Icon icon={'fluent:delete-28-regular'} height={22} width={22}
                                                        class={'cursor:pointer'} style={{"color": 'red'}}
                                                        onclick={() => handleDelete(index())}/>}
                                    />

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
