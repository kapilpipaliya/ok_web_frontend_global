
import { For, createSignal } from "solid-js";
import {Icon} from "@iconify-icon/solid";

interface TableTabProps{
  tabs:string[];
  setActiveTab?:(tab:string)=>string
}






export function TableTabs(props: TableTabProps){
  const [currentTab, setCurrentTab] = createSignal<string>("tabletab1");

    return (
    <div  class="flex flex:row gap-x:30 border-bottom:0.7 bb:#E0E0E0 ">


<For each={props.tabs} fallback={<div>Loading...</div>}>
  {(item) => 
  <div id={`tabletab`+`${item}`} style={{"align-items":"center"}} class={"px:20 f:sans f:15 cursor:pointer " }
     
  onClick={(event)=>{
    if(props.setActiveTab){
      props.setActiveTab(item as string)
    }
    
    
    const x = document.getElementById(currentTab());
    
    if(x?.className){
      x.className=x.className.replace("border-bottom:2","")
      x.className=x.className.replace("bb:blue","")
      x.className=x.className.replace("text-fill:rgb(10,92,246)","");
    }
  setCurrentTab("tabletab"+item);
  event.target.className =event.target.className.concat("border-bottom:2 bb:blue text-fill:rgb(10,92,246)")
   
    }
    } >
      <div style={{"align-items":'center',display:'flex'}}>
          {item.includes('Mobile Preview')?<Icon icon="mdi:cellphone"/>:<Icon icon="mdi:monitor"/>}&nbsp;
          {item}
      </div>  </div>}
</For>

   </div>
   )
}