import { Match } from "solid-js";
import { For, Switch, createSignal } from "solid-js";

export function PageSetting() {
  const [selected, setSelected] = createSignal("thank-you-page");

  const menuItems: any = [
    { icon: "✅", id: "thank-you-page", label: "Thank You Page" },
  ];

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
            Content
          </Match>
        </Switch>
      </div>
    </div>
  );
}