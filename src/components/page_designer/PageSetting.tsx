import { Match, createMemo } from "solid-js";
import { For, Switch, createSignal } from "solid-js";
import {MultiSelectField} from "~/components/MultiSelect";

export function PageSetting() {
  const [selected, setSelected] = createSignal("thank-you-page");

  const menuItems: any = [
    {id: "thank-you-page", label: "Thank You Page", icon: "✅"},
  ];

  const selectedSection=() => createMemo(() => menuItems.find((item: any) => item.id === selected()));
  
  return (
    <div style={{display: "flex"}} class="mt:1rem w:98vw flex:column@<sm">
      <div
        class="h:90vh@>sm"
        style={{
          width: "250px",
          "background-color": "rgb(64,74,86)",
          padding: "20px",
          color: "#fff",
          "border-radius": "5px",
        }}
      >
        <For each={menuItems}>
          {(item) => (
            <button
              onClick={() => setSelected(item.id)}
              style={{
                padding: "10px 20px",
                cursor: "pointer",
                "background-color":
                  selected() === item.id ? "#343a40" : "transparent",
                "margin-bottom": "10px",
                "border-radius": "4px",
                display: "flex",
                "align-items": "center",
              }}
            >
              <span style={{"margin-right": "10px"}}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )}
        </For>
      </div>
      <div style={{flex: 1, padding: "20px", "background-color": "#f8f9fa"}}>
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
      options={['thank-you-page', 'thank-you-page-2']}
      selectedValues={()=>["thank-you-page"]}
      onSelect={(e)=>{
        console.log(e)
      }}
      placeholder="Select thank you page"
      selectionLimit={1}
      onRemove={(e)=>{
        
        console.log(e)
      }}
    />
  </>;
}