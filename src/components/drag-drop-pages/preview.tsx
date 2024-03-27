import {createMemo, createSignal} from 'solid-js';
import {Icon} from "@iconify-icon/solid";

const PreviewSection = () => {
    const [selectedView, setSelectedView] = createSignal('Mobile'); // Initially set to the first step

    const dynamicStyle = createMemo(() => {
        switch (selectedView()) {
            case 'Mobile':
                return { height: '640px', width: '360px' }; // Example sizes for Mobile
            case 'Tablet':
                return { height: '768px', width: '700px' }; // Example sizes for Tablet
            case 'Desktop':
                return { height: '100vh', width: '100%' }; // Example sizes for Desktop
            default:
                return { height: '640px', width: '360px' };
        }
    });
    const renderIcon = (view: string, icon: string) => (
        <Icon style={{ color: 'white' }}
              class={`mr:1rem bb:${selectedView() === view ? '1.5px|solid|#ffffff' : ''} ${view === 'Desktop' ? '' : 'mr:1rem'}`}
              onclick={() => setSelectedView(view)}
              height={30} width={30}
              icon={icon}/>
    );
    return (
        <div class={'mt:2rem'}>
            <div class={'w:100% h:50px display:flex align-items:center justify-content:center'}>
                <div class={'bg:rgb(83,98,170) p:5 pl:1rem pr:1rem  r:5|5|5|5'}>
                    {renderIcon('Mobile', 'prime:mobile')}
                    {renderIcon('Tablet', 'uil:tablet')}
                    {renderIcon('Desktop', 'humbleicons:desktop')}
                </div>
            </div>
            <div class={'flex align-items:center justify-content:center h:full w:full mt:5px'}>
                    <div
                        class="b:1px|solid|rgb(37,99,253,0.5) bg:rgb(224,230,255,0.3) p:5 pl:1rem pr:1rem r:5|5|5|5"
                        style={dynamicStyle()}>
                    </div>
                </div>
        </div>
    );
};

export default PreviewSection;
