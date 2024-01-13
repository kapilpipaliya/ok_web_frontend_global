
import { Icon } from "@iconify-icon/solid";
import { JSXElement, Show, useContext } from "solid-js";
import { PageContext } from "../lib/Record";
import { createEffect, createSignal } from "solid-js";
import {DisplayComponentProps} from "./ComponentType";

export function Navbar(props: DisplayComponentProps & { left?: JSXElement, right?: JSXElement }) {
  const [isDarkMode, setDarkMode] = createSignal(false);

  let { events } = useContext(PageContext);

  const toggleTheme = () => {
    const newTheme = isDarkMode() ? 'light' : 'dark';
    setDarkMode(!isDarkMode());
    localStorage.setItem('theme', newTheme);

    document.documentElement.style.backgroundColor = newTheme === 'dark' ? '#2b2b2b' : '#ffffff';
    document.documentElement.style.color = newTheme === 'dark' ? '#ffffff' : '#000000';
  };

  createEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setDarkMode(storedTheme === 'dark');
    }
  }, []);

  return (
    <nav class={`p:7.5 flex jc:space-between ai:center ${props.meta?.P.class || ''}`}>
      <Show when={props.meta?.P.menuPosition === "left" || !props.meta?.P.menuPosition}>
        <Icon icon="mdi:hamburger-menu" width={20} onclick={() => { events?.setSideBarOpen((v: any) => !v); }} />

        <div class={'f:gray-80@light f:gray-20@dark bg:fade-20@dark bg:fade-80@light position:fixed top:10px right:10px transform:translate(-50%, -50%) z-index:999'}>
          <label>
            <input type="checkbox" checked={isDarkMode()} onChange={toggleTheme} style={{ display: 'none' }} />
            <div style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}>
              <Icon icon="icon-park-outline:dark-mode" width="1.5em" height="1.5em" />
            </div>
          </label>
        </div>
      </Show>
      {props.left}
      <div>{props.meta?.P?.title}</div>
      {/* Actions */}
      <div class="flex ai:center jc:center gap:8">
        <Icon icon="material-symbols:search" width={20} class="cursor:pointer" />
        {props.right}
        <Show when={props.meta?.P.menuPosition === "right"}>
          <Icon icon="mdi:hamburger-menu" width={20} onclick={() => { events?.setSideBarOpen((v: any) => !v); }} />
        </Show>
      </div>
    </nav>
  );
}
