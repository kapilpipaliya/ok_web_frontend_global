import { Link } from "solid-app-router";
import { Icon } from "solid-heroicons";
import { JSX, For } from "solid-js";
import { css } from "solid-styled-components";

interface Item {
  href: string;
  current: string;
  icon: {
    path: () => Element | Element[] | string;
    outline: boolean;
  };
  name: string;
}
interface MenuProps {
  items: Item[];
}
export const Menu = (props: MenuProps) => {
  return (
    <div
      class={css`
        display: flex;
        flex-direction: column;
        font: inherit;
        text-align: left;
        width: 30ex;
        height: 100%;
        padding: 0;
        background: #688CB0;
        position: absolute;
 
      `}
    >
      <For each={props.items} fallback={<div>Loading...</div>}>
        {(item) => (<Link
            href={item.href}
              class={css`
              display: flex;
              align-items: center; 
                color: gren;
                text-decoration: none;
                list-style: none;
                transition: all 0.5s ease;
                padding: 10px 10px;
                font-size: 18px;
                position: relative;
                color: #EEF4FA;
                ${item.current ? "" : ""}
              `}
            aria-current={item.current ? "page" : undefined}
          >
            <Icon
              path={item.icon}
              class={css`
                width: 18px;
                height: 18px;
                margin-right: 0.25em;
              `}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        )}
      </For>
    </div>
  );
};
