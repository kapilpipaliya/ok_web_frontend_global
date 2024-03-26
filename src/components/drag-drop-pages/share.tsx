import { createSignal } from 'solid-js';
import {Icon} from "@iconify-icon/solid";
import {Tooltip} from "../solid-blocks/blocks";

const ShareSection = () => {
    const [link, setLink] = createSignal('https://www.easyform.com/534656546756');
    const [access, setAccess] = createSignal('everyone');

    const copyToClipboard = () => {
        navigator.clipboard.writeText(link());
        // Add logic to show feedback to the user (e.g., a tooltip)
    };

    const inlineStyles = {
        shareSection: {
            background: 'rgb(223 225 231)',
            padding: '20px',
            "border-radius": '10px',
            "box-shadow": '0 4px 8px rgba(0, 0, 0, 0.1)',
            width: '40%',
            margin: 'auto',
            marginTop: '10px',
        },
        shareLink: {
            display: 'flex',
            "margin-bottom": '20px',
        },
        button: {
            padding: '10px',
            border: 'none',
            'background-color': '#f5f5f5',
            'border-left': '1px solid #ddd',
            cursor: 'pointer',
        },
        accessToggle: {
            "margin-bottom": '20px',
        },
        accessButton: {
            padding: '10px 20px',
            border: 'none','border-radius': '6px',
            'background-color': '#f5f5f5',
            "margin-right": '10px',
            cursor: 'pointer',
        },
        activeButton: {
            "background-color": '#554FDC','border-radius': '6px',
            color: 'white',
        },
        invitePeople: {
            "margin-bottom": '20px','border-radius': '6px',
        },
        shareOther: {
            button: {
                "margin-right": '10px',
                cursor: 'pointer',
            },
        },
    };

    return (
        <div style={inlineStyles.shareSection} class={'mt:2rem'}>
            <div style={inlineStyles.shareLink}>
                <input type="text" value={link()} readOnly class={'w:full r:5|0|0|5 p:10'} />
                <Tooltip content={'Copy to clipboard'}><button onClick={copyToClipboard} style={inlineStyles.button} class={'r:0|5|5|0 p:10'} >📋</button></Tooltip>
            </div>
            <div style={inlineStyles.accessToggle}>
                <button onClick={() => setAccess('everyone')} style={access() === 'everyone' ? {...inlineStyles.accessButton, ...inlineStyles.activeButton} : inlineStyles.accessButton}>Everyone</button>
                <button onClick={() => setAccess('invite')} style={access() === 'invite' ? {...inlineStyles.accessButton, ...inlineStyles.activeButton} : inlineStyles.accessButton}>Invite only</button>
            </div>
            <div style={inlineStyles.shareLink}>
                <button onClick={copyToClipboard} class={'r:5|0|0|5 p:10 bg:#F5F5F5'}><Icon
                    icon={'system-uicons:mail'} height={25} width={25}/></button>

                <input className={'w:full r:0|5|5|0 p:10'} type={'email'} name='email'
                    placeholder="Enter email, for multiple email use ';' separate"/>
            </div>
            <div style={inlineStyles.shareOther}>
                <button style={inlineStyles.shareOther.button}>🌐</button>
                <button style={inlineStyles.shareOther.button}>💬</button>
                <button style={inlineStyles.shareOther.button}>✉️</button>
                <button style={inlineStyles.shareOther.button}>🔗</button>
            </div>
        </div>
    );
};

export default ShareSection;
