import {createSignal, Match, Switch} from 'solid-js';
import {Icon} from "@iconify-icon/solid";

const PreviewSection = () => {
    const [selectedView, setSelectedView] = createSignal('Mobile'); // Initially set to the first step

    return (
        <div class={'mt:2rem'}>
            <div class={'w:100% h:50px display:flex align-items:center justify-content:center'}>
                <div class={'bg:rgb(83,98,170) p:5 pl:1rem pr:1rem  r:5|5|5|5'}>
                    <Icon style={{color: 'white'}}
                          class={`mr:1rem bb:${selectedView() == 'Mobile' ? '1.5px|solid|#ffffff' : ''}`}
                          onclick={() => {
                              setSelectedView('Mobile')
                          }} height={30} width={30}
                          icon={'prime:mobile'}/>
                    <Icon style={{color: 'white'}}
                          class={`mr:1rem bb:${selectedView() == 'Tablet' ? '1.5px|solid|#ffffff' : ''}`}
                          onclick={() => {
                              setSelectedView('Tablet')
                          }} height={30} width={30}
                          icon={'uil:tablet'}/>
                    <Icon style={{color: 'white'}}
                          class={`bb:${selectedView() == 'Desktop' ? '1.5px|solid|#ffffff' : ''}`}
                          onclick={() => {
                              setSelectedView('Desktop')
                          }} height={30} width={30}
                          icon={'humbleicons:desktop'}/>
                </div>
            </div>
            <div class={'flex align-items:center justify-content:center h:full w:full mt:5px'}>
                <Switch>


                    <Match when={selectedView() === 'Mobile'}>
                        <div
                            class={'b:1px|solid|rgb(37,99,253,0.5) bg:rgb(224,230,255,0.3) p:5 pl:1rem pr:1rem h:640px w:360px r:5|5|5|5'}></div>
                    </Match>
                    <Match when={selectedView() === 'Tablet'}>
                        <div
                            class={'b:1px|solid|rgb(37,99,253,0.5) bg:rgb(224,230,255,0.3) p:5 pl:1rem pr:1rem h:768px w:700px r:5|5|5|5'}></div>
                    </Match>
                    <Match when={selectedView() === 'Desktop'}>
                        <div
                            class={'b:1px|solid|rgb(37,99,253,0.5) bg:rgb(224,230,255,0.3) p:5 pl:1rem pr:1rem h:100vh w:full r:5|5|5|5'}></div>
                    </Match>


                </Switch></div>
        </div>
    );
};

export default PreviewSection;
