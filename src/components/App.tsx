import { createSignal, For } from "solid-js";
import { styled, ThemeProvider, DefaultTheme } from "solid-styled-components";
import { Link, Route, Router, Routes } from "solid-app-router";
import { css } from "solid-styled-components";
import { Icon } from "solid-heroicons";
import { clock, home, scale } from "solid-heroicons/outline";
import SchemaDetail from "./core/schemaDetail";
import SchemaTable from "./core/schemaTable";
import Page404 from "./errors/404";
import { CollectionEditor } from "./collection_editor";
import { FormLayoutEditor } from "./fom_layout_editor";
import { useDebugger } from "./core/SolidDebug";
import { graph, resetDatabase } from "../db/graph";
import { Menu } from "./core/Menu";
import { BackupRestore } from "./core/BackupRestore";

const navigationNew = {
  Dashboard: [
    { name: "Home", href: "/", icon: home, current: true },
    { name: "FormAttributeTypes", href: "/FormAttributeType", icon: clock },
    { name: "Attributes", href: "/Attribute", icon: clock },
  ],
  "Control Panel": [
    { name: "Collections", href: "/Collection", icon: scale },
    { name: "Form Layout", href: "/formLayout", icon: scale },
    { name: "Table Layout", href: "/TableLayout", icon: scale },
    { name: "Card Layout", href: "/CardLayout", icon: scale }
  ]
};
const navigation = [
  { name: "Home", href: "/", icon: home, current: true },
  { name: "FormAttributeTypes", href: "/FormAttributeType", icon: clock },
  { name: "Attributes", href: "/Attribute", icon: clock },
  { name: "Collections", href: "/Collection", icon: scale },
  { name: "Form Layout", href: "/FormLayout", icon: scale },
  { name: "Table Layout", href: "/TableLayout", icon: scale },
  { name: "Card Layout", href: "/CardLayout", icon: scale },
  { name: "Backup & Restore", href: "/backup_restore", icon: scale }
];

const theme: DefaultTheme = {
  colors: {
    primary: "hotpink"
  }
};

export const App = () => {
  const debugGraph = useDebugger("graph");
  debugGraph(graph);

  return (
    <ThemeProvider theme={theme}>
      <button type="button" onclick={resetDatabase}>clear</button>
      <Router>
        <div
          class={css`
            display: grid;
            grid-template-columns: 220px 1fr;
            grid-template-areas: "menu main";
            gap: 10px;
          `}
        >
          <div
            class={css`
              grid-area: menu;
            `}
          >
            <Menu items={navigation} />
          </div>
          <main
            class={css`
              grid-area: main;
            `}
          >
            <Routes>
              <Route path="/" component={() => <>Home</>} />
              <Route path="/Collection/:id" component={() => <CollectionEditor />} />
              <Route path="/FormLayout/:id" component={() => <FormLayoutEditor />} />
              <Route path="/:entity" component={() => <SchemaTable />} />
              <Route path="/:entity/:id" component={() => <SchemaDetail />} />
              <Route path="/backup_restore" component={() => <BackupRestore />} />
              <Route path="/**" component={() => <Page404 />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
};
