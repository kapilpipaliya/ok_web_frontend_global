import '../../css/modal.css'
import Dismiss from "solid-dismiss";
import {createSignal} from "solid-js";
import {Icon} from "@iconify-icon/solid";

const CustomModal = (props) => {
    const [open, setOpen] = createSignal(false);
    let btnEl;
    let btnSaveEl;

    const onClickClose = () => {
        setOpen(false);
    };

    const onClickOverlay = (e) => {
        if (e.target !== e.currentTarget) return;
        setOpen(false);
    };

    return (
        <>
            {props.openButton !== false && (
                <Icon height={25} width={25} color={'grey'} aria-disabled={open()}
                      class={'bg:lightgrey:hover r:5|5|5|5 p:5|5|5|5'} onClick={() => setOpen(true)}
                      icon={props.buttonLabel}></Icon>
            )}
            <Dismiss
                menuButton={btnEl}
                open={open}
                setOpen={setOpen}
                modal
                focusElementOnOpen={() => btnSaveEl}
            >
                <div
                    class="modal-container"
                    onClick={onClickOverlay}
                    role="presentation"
                >
                    <div class="modal r:10" role="dialog" aria-modal="true" tabindex="-1">
                        <div class={'mb:4 font-weight:bold'}>
                            {props.title}
                            {props.closeButton !== false && (
                                <button
                                    title={'Close'}
                                    onClick={onClickClose}
                                    class={'bg:lightgrey:hover r:5|5|5|5 p:0|5|0|5'}
                                    style={{float: "right"}}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <hr class={'fg:lightgrey'}/>
                        <div class={'p:3 max-h:50vh overflow:auto'}>
                            {props.body}
                        </div>
                        <div class={'pt:5'}>
                            {props.footer(setOpen)}
                        </div>
                    </div>
                </div>
            </Dismiss>
        </>
    );
};

export default CustomModal;
