import { Match, createMemo } from "solid-js";
import { For, Switch, createSignal } from "solid-js";

import {MultiSelectField} from "~/components/MultiSelect";

export function PageSetting() {
  const [selected, setSelected] = createSignal("thank-you-page");

  const menuItems: any = [
    {icon: "✅", id: "thank-you-page", label: "Thank You Page"},
  ];

  const selectedSection=() => createMemo(() => menuItems.find((item: any) => item.id === selected()));
  
  return (
    <div class="flex:column@<sm mt:1rem w:98vw" style={{display: "flex"}}>
      <div
        class="h:90vh@>sm"
        style={{
          "background-color": "rgb(64,74,86)",
          "border-radius": "5px",
          color: "#fff",
          padding: "20px",
          width: "250px",
        }}
      >
        <For each={menuItems}>
          {(item) => (
            <button
              onClick={() => setSelected(item.id)}
              style={{
                "align-items": "center",
                "background-color":
                  selected() === item.id ? "#343a40" : "transparent",
                "border-radius": "4px",
                cursor: "pointer",
                display: "flex",
                "margin-bottom": "10px",
                padding: "10px 20px",
              }}
            >
              <span style={{"margin-right": "10px"}}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )}
        </For>
      </div>
      <div style={{"background-color": "#f8f9fa", flex: 1, padding: "20px"}}>
        <Switch>
          <Match when={selected() === "thank-you-page"}>
            <ThankYouPage selectedSection={selectedSection()}/>
          </Match>
        </Switch>
      </div>
    </div>
  );
}

const ThankYouPage = (selectedSection: any) => {
  return <>
    <h2 class="font-weight:700 font:18 ">
      {selectedSection.icon}&nbsp;
      {selectedSection.label}
    </h2>
    <p class="font:14">Show Page After Submission Form</p>
    <MultiSelectField
      onRemove={(e)=>{
        
        console.log(e)
      }}
      onSelect={(e)=>{
        console.log(e)
      }}
      options={['thank-you-page', 'thank-you-page-2']}
      placeholder="Select thank you page"
      selectedValues={()=>["thank-you-page"]}
      selectionLimit={1}
    />
  </>;
}