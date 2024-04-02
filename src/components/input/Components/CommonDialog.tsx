import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "../../solid-blocks/blocks";
import {Icon} from "@iconify-icon/solid";

const CommonDialog = (props: any) => {

    return (
        <>
            <Modal  closeOnEsc={props.closeOnEsc} closeOnClickOutside={props.closeOnClickOutside}>
                {({ open, toggle }) => (
                    <>
                        {props.openButton !== false && (
                            <Icon height={25} width={25} color={'grey'} aria-disabled={open()} class={'bg:lightgrey:hover r:5|5|5|5 p:5|5|5|5'} onClick={toggle} icon={props.buttonLabel}></Icon>
                        )}
                        <ModalContent class={`${props.dialogClass}`} style={{'border-radius': '10px'}} >
                            <ModalHeader class={'p:4'}>
                                {props.title}
                                {props.closeButton !== false && (
                                    <button
                                        title={'Close'}
                                        onClick={toggle}
                                        class={'bg:lightgrey:hover r:5|5|5|5 p:0|5|0|5'}
                                        style={{float: "right"}}
                                    >
                                        ✕
                                    </button>
                                )}
                            </ModalHeader>
                            <hr class={'fg:#f4e9e9'}/>
                            <ModalBody class={`${props.bodyClass} m:.5rem`}>
                                {props.body}
                            </ModalBody>
                            <ModalFooter class={`${props.footerClass} mt:1.5rem`}>
                                {props.footer(toggle)}
                            </ModalFooter>
                        </ModalContent>
                    </>
                )}
            </Modal>
        </>
    );
};

export default CommonDialog;
