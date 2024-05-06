import CustomButton from "~/components/solid-blocks/blocks/buttons";
import CustomModal from "./CommonDialog";
import { JSX } from "solid-js";

export const DeleteDialog = (props: { onConfirm: () => void, title?: string, message?: string, buttonLabel?: JSX.Element, onCancel?: () => void}) => {

    const handleConfirm = () => {
        props.onConfirm();
    };

    const handleCancel = () => {

        props.onCancel ? props.onCancel() : () => {};
    };
    return (
        <CustomModal
            bodyStyle={{ 'max-height': 'none', 'overflow': 'auto' }}
            openButton={false}
            buttonLabel={props.buttonLabel || <div class="color:rgb(255,0,0)">Delete</div>}
            customTitle={<span class="color:rgb(255,2,2)">{props.title || "Delete Confirmation"}</span>}
            body={
                <p class="p:10px|0px">{props.message || "Are you sure you want to delete this item?"}</p>
            }
            footer={(toggle) =>
                <div class={'flex ai:center jc:end'}>
                    <CustomButton variant="outlined" class="danger" onClick={() => { handleCancel(); toggle(v=>!v);}}>Cancel</CustomButton>
                    <CustomButton variant="contained" onClick={handleConfirm} style="margin-right: 10px;">Confirm</CustomButton>
                </div>
            }
            dialogClass="min-w:20% r:10px p:0"
        />
    );
};