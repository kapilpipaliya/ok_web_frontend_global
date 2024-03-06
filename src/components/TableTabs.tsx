import {For, createSignal} from "solid-js";
import {Icon} from "@iconify-icon/solid";

interface TableTabProps {
    tabs: string[];
    setActiveTab?: (tab: string) => string
}


export function TableTabs(props: TableTabProps) {
    const [currentTab, setCurrentTab] = createSignal<string>(props.tabs[0]);

    return (
        <div class="flex flex:row gap-x:30 border-bottom:0.7 bb:#E0E0E0 ">


            <For each={props.tabs} fallback={<div>Loading...</div>}>
                {(item) =>
                    <div id={`tabletab-${item}`}
                         style={{
                             "border-bottom": currentTab() === `${item}` ? "2px solid green" : "2px solid transparent"
                         }}
                         class="px-20 f-sans f-15 cursor-pointer"
                         onClick={() => {
                             if (props.setActiveTab) {
                                 props.setActiveTab(item);
                             }
                             setCurrentTab(item);
                         }}
                    >
                        <div style={{"align-items": 'center', display: 'flex'}} class={'f-15'}>
                            {item.includes('Mobile Preview') ? <Icon icon="mdi:cellphone"/> :
                                <Icon icon="mdi:monitor"/>}&nbsp;
                            {item.replace('Preview', '')}
                        </div>
                    </div>}
            </For>


        </div>
    )
}