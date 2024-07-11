import { Match, createMemo } from "solid-js";
import { For, Switch, createSignal } from "solid-js";

import { MultiSelectField } from "~/components/MultiSelect";

export function PageSetting() {
  const [selected, setSelected] = createSignal("thank-you-page");

  const menuItems: any = [
    { icon: "✅", id: "thank-you-page", label: "Thank You Page" },
  ];

  const selectedSection = () =>
    createMemo(() => menuItems.find((item: any) => item.id === selected()));

  return (
    <div class="flex flex:column@<sm mt:1rem w:98vw">
      <div class="bg:rgb(64,74,86) border-radius:5px color:#fff h:90vh@>sm p:20 w:250px">
        <For each={menuItems}>
          {(item) => (
            <button
              class={`${selected() === item.id ? "bg:#343a40" : "bg:transparent"} align-items:center border-radius:4px cursor:pointer display:flex mb:10px p:10px|20px`}
              onClick={() => setSelected(item.id)}
            >
              <span class="mr:10px">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )}
        </For>
      </div>
      <div class="bg:#f8f9fa flex:1 p:20">
        <Switch>
          <Match when={selected() === "thank-you-page"}>
            <ThankYouPage selectedSection={selectedSection()} />
          </Match>
        </Switch>
      </div>
    </div>
  );
}

const ThankYouPage = (selectedSection: any) => {
  return (
    <>
      <h2 class="font-weight:700 font:18">
        {selectedSection.icon}&nbsp;
        {selectedSection.label}
      </h2>
      <p class="font:14">Show Page After Submission Form</p>
      <MultiSelectField
        onRemove={(e) => {
          console.log(e);
        }}
        onSelect={(e) => {
          console.log(e);
        }}
        options={["thank-you-page", "thank-you-page-2"]}
        placeholder="Select thank you page"
        selectedValues={() => ["thank-you-page"]}
        selectionLimit={1}
      />
    </>
  );
};
