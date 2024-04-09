import {createSignal} from 'solid-js';
import RadioInputs from "../solid-blocks/blocks/radioInput";
import {ComponentUtils, IconifyIcon} from "../componentUtils";


const StyleEditor = () => {
    // Signals for the style values
    const [display, setDisplay] = createSignal('flex');
    const [flexDirection, setFlexDirection] = createSignal('row');
    const [justifyContent, setJustifyContent] = createSignal('start');
    const [alignItems, setAlignItems] = createSignal('stretch');
    const [gap, setGap] = createSignal(0);
    const [flexWrap, setFlexWrap] = createSignal('nowrap');
    const {ContainerLabel,Container,IconifyIcon} = ComponentUtils();

    const applyStyles = () => {
        const elementStyle = {
            display: display(),
            flexDirection: flexDirection(),
            justifyContent: justifyContent(),
            alignItems: alignItems(),
            gap: `${gap()}px`,
            flexWrap: flexWrap(),
        };
    };


    const LayoutSection = () => {
        return <div class={'w:full p:5 r:5 mt:5'}>
            <div class={'flex ai:center jc:space-between mt:2'}>
                <ContainerLabel title={'Display'} />
                <select class={'b:1px|solid|lightgrey r:5 p:2 f:14'} value={display()} onInput={(e) => setDisplay(e.currentTarget.value)}>
                    <option value="flex">Block</option>
                    <option value="block">Inline</option>
                    <option value="inline-flex">Inline Block</option>
                    <option value="inline-flex">Flex</option>
                    <option value="inline-flex">None</option>
                    {/* other display options */}
                </select>
            </div>

            <ContainerLabel title={'Direction'} class={'mt:1rem'}/>
            <RadioInputs
                value={flexDirection()}
                onChange={(value) => {
                    setFlexDirection(value)
                }}
                options={[
                    {'key': <IconifyIcon icon={'tabler:arrow-right'} />, 'value': 'row'},
                    {'key': <IconifyIcon icon={'tabler:arrow-left'} />, 'value': 'row-reverse'},
                    {'key': <IconifyIcon icon={'tabler:arrow-up'} />, 'value': 'column-reverse'},
                    {'key': <IconifyIcon icon={'tabler:arrow-down'} />, 'value': 'column'},
                ]} defaultCheckedIndex={1}/>

            <ContainerLabel title={'Justify'} class={'mt:.5rem'}/>
            <RadioInputs
                value={justifyContent()}
                onChange={(value) => {
                    setJustifyContent(value)
                }}
                options={[
                    {'key': <IconifyIcon icon={'solar:align-left-outline'} />, 'value': 'start'},
                    {'key': <IconifyIcon icon={'solar:align-horizontal-center-outline'} />, 'value': 'center'},
                    {'key': <IconifyIcon icon={'solar:align-right-outline'} />, 'value': 'end'},
                    {'key': <IconifyIcon icon={'material-symbols:align-space-between'} />, 'value': 'space-between'},
                    {'key': <IconifyIcon icon={'material-symbols:align-space-around-rounded'} />, 'value': 'space-around'},
                    {'key': <IconifyIcon icon={'material-symbols:align-justify-space-even-rounded'} />, 'value': 'space-evenly'},
                ]} defaultCheckedIndex={1}/>

        </div>
    }

    return <>
        <LayoutSection/>
    </>


};

export default StyleEditor;

