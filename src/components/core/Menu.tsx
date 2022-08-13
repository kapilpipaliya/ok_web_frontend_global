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
      `}
    >
      <For each={props.items} fallback={<div>Loading...</div>}>
        {(item) => (
          <Link
            href={item.href}
            class={css`
              color: gren;
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
  );
};
