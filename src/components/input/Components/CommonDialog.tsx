import '../../css/modal.css'
import Dismiss from "solid-dismiss";
import {createSignal} from "solid-js";
import {Icon} from "@iconify-icon/solid";

const CustomModal = (props) => {
    const [open, setOpen] = createSignal(false);
    let btnEl;

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
                <Icon ref={btnEl} height={props.iconSize ?? 25} width={props.iconSize ?? 25} color={'grey'} aria-disabled={open()}
                      class={`cursor:pointer bg:lightgrey:hover r:5|5|5|5 p:5|5|5|5 ${props.iconClass}`} onClick={() => setOpen(true)}
                      icon={props.buttonLabel}>
                </Icon>
            )}
            <Dismiss
                menuButton={btnEl}
                open={open}
                setOpen={setOpen}
                modal
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
                                    onClick={onClickOverlay}
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
