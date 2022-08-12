import { For } from "solid-js";
import { Link, Route, Router, Routes } from "solid-app-router";
import { css } from "solid-styled-components";
import { Icon } from "solid-heroicons";
import { clock, home, scale } from "solid-heroicons/outline";
import SchemaDetail from "./core/schemaDetail";
import SchemaTable from "./core/schemaTable";
import Page404 from "./errors/404";
import { CollectionEditor } from "./collection_editor";
import { FormLayoutEditor } from "./fom_layout_editor";

const navigation = [
  { name: "Home", href: "/", icon: home, current: true },
  { name: "AttributeTypes", href: "/AttributesType", icon: clock, current: false },
  { name: "Attributes", href: "/Attribute", icon: clock, current: false },
  { name: "Collections", href: "/Collection", icon: scale, current: false },
  { name: "Form Layout", href: "/formLayout", icon: scale, current: false },
  { name: "Table Layout", href: "/TableLayout", icon: scale, current: false },
  { name: "Card Layout", href: "/CardLayout", icon: scale, current: false },
];

export const App = () => {
  return (
    <Router>
      <div
        class={css`
          display: grid;
          grid-template-columns: 100px 1fr;
          grid-template-areas: "menu main";
          gap: 10px;
        `}
      >
        <div
          class={css`
            grid-area: menu;
          `}
        >
          <div
            class={css`
              display: flex;
              flex-direction: column;
            `}
          >
            <For each={navigation} fallback={<div>Loading...</div>}>
              {(item) => (
                <Link
                  href={item.href}
                  class={css`
                    ${item.current ? "" : ""}
                  `}
                  aria-current={item.current ? "page" : undefined}
                >
                  <Icon
                    path={item.icon}
                    class={css`
                      width: 10px;
                      height: 10px;
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )}
            </For>
          </div>
        </div>
        <main
          class={css`
            grid-area: main;
          `}
        >
          <Routes>
            <Route path="/" component={() => <>Home</>} />
            <Route path="/collections/:id" component={() => <CollectionEditor />} />
            <Route path="/formLayouts/:id" component={() => <FormLayoutEditor />} />
            <Route path="/:entity" component={() => <SchemaTable />} />
            <Route path="/:entity/:id" component={() => <SchemaDetail />} />
            <Route path="/**" component={() => <Page404 />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};
