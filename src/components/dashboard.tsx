import { For } from "solid-js";
import { css } from "solid-styled-components";
import { Icon } from "@amoutonbrady/solid-heroicons";
import {
  clock,
  home,
  scale,
} from "@amoutonbrady/solid-heroicons/outline";
import { Link, Route, Routes } from "solid-app-router";
import SchemaDetail from "./core/schemaDetail";
import SchemaTable from "./core/schemaTable";
import Page404 from "./errors/404";
import { CollectionEditor } from "./collection_editor";

const navigation = [
  { name: "Home", href: "/", icon: home, current: true },
  { name: "Attributes", href: "/attributes", icon: clock, current: false },
  { name: "Collections", href: "/collections", icon: scale, current: false },
  { name: "New Collection", href: "/collections/new", icon: scale, current: false }
];

export const FullDashboard = () => {
  return (
    <div class={css`
      display: grid;
      grid-template-areas:'menu main';
      gap: 10px;
    `}>
      <div class={css`
        grid-area: menu;
      `}>
        <div class={css`
          display: flex;
          flex-direction: column;
        `}>
          <For each={navigation} fallback={<div>Loading...</div>}>
            {(item) => (
              <Link
                href={item.href}
                class={css`

                  ${item.current ? "" : ""}
                `}
                aria-current={item.current ? "page" : undefined}
              >
                <Icon path={item.icon} class={css`
                  width: 10px;
                  height: 10px;
                `} aria-hidden="true" />
                {item.name}
              </Link>
            )}
          </For>
        </div>
      </div>
      <Routes>
        <Route path="/" component={() => <>Home</>} />
        <Route path="/collections/new" component={() => <CollectionEditor />} />
        <Route path="/:entity" component={() => <SchemaTable />} />
        <Route path="/:entity/:id" component={() => <SchemaDetail />} />
        <Route path="/**" component={() => <Page404 />} />
      </Routes>
    </div>
  );
};
