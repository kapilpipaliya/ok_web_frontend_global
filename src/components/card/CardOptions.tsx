import { createSignal, type JSX } from "solid-js";
import { For } from "solid-js/web";

type CardOption = {
  action: () => void;
  label: string;
};

export function CardOptions(props: { options: CardOption[]; title: string }) {
  const [isDropdownOpen, setDropdownOpen] = createSignal(false);
  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen());

  return (
    <CardOptionsContainer>
      <button
        aria-expanded={isDropdownOpen()}
        aria-haspopup="true"
        class="color:rgb(156,163,175) color:rgb(107,114,128):hover display:block m:-0.625rem p:0.625rem"
        onClick={toggleDropdown}
        type="button"
      >
        <span class="sr-only">Open options</span>
        <svg
          aria-hidden="true"
          class="h:1.25rem w:1.25rem"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
        </svg>
      </button>
      {isDropdownOpen() && (
        <div
          aria-labelledby={`options-menu-${props.title}-button`}
          aria-orientation="vertical"
          class="bg:rgb(255,255,255) border-radius:0.375rem box-shadow:0|0|0|1px|rgba(0,0,0,0.5) mt:0.125rem outline-offset:2px:focus outline:2px|solid|transparent position:absolute py:0.5rem right:0 transform-origin:top|right w:8rem z:10"
          role="menu"
          tabindex="-1"
        >
          <For each={props.options}>
            {(option, index) => (
              <a
                class="lh:1.25rem color:rgb(17,24,39) display:block f:0.875rem leading:1.5rem px:0.75rem py:0.25rem"
                href="#"
                id={`options-menu-${props.title}-item-${index()}`}
                onClick={(e) => {
                  e.preventDefault();
                  option.action();
                }}
                role="menuitem"
                tabindex="-1"
              >
                {option.label}
                <span class="sr-only">, {props.title}</span>
              </a>
            )}
          </For>
        </div>
      )}
    </CardOptionsContainer>
  );
}

export function CardOptionsContainer(props: { children: JSX.Element }) {
  return <div class="ml:auto position:relative">{props.children}</div>;
}
