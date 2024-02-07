import { createSignal } from "solid-js";

interface TableTabProps{
  tabs:string[];
  setActiveTab:(tab:string)=>string
}

const [currentTab, setCurrentTab] = createSignal<string>("tabletab0");


export function TableTabs(props: TableTabProps){
 
    return (
    <div  class="flex flex:row gap-x:30 border-bottom:0.7 bb:#E0E0E0 ">
    {props.tabs.map((item,key)=>(
      //always leave space after writig mastercss in the below class
      <div id={`tabletab`+`${key}`} class={"px:20 f:sans f:15 cursor:pointer " }
     
      onClick={(event)=>{
        props.setActiveTab(item as string)
        const x = document.getElementById(currentTab());
        if(x?.className){
          x.className=x.className.replace("border-bottom:2","")
          x.className=x.className.replace("bb:blue","")
          x.className=x.className.replace("text-fill:rgb(10,92,246)","");
        }
      setCurrentTab("tabletab"+key);
      event.target.className =event.target.className.concat("border-bottom:2 bb:blue text-fill:rgb(10,92,246)")
       
        }
        } >
        {item}
      </div>
    ))}
   </div>
   )
}