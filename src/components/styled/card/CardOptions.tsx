import { createSignal, type JSX } from "solid-js";
import { For } from "solid-js/web";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

type CardOption = {
  action: () => void;
  label: string;
};

export function CardOptions(props: { options: CardOption[]; title: string }) {
  const [isDropdownOpen, setDropdownOpen] = createSignal(false);
  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen());

  return (
    <CardOptionsContainer>
      <As
        as="button"
        aria-expanded={isDropdownOpen()}
        aria-haspopup="true"
        css={css`
  color: rgb(156,163,175);
  display: block;
  margin: -0.625rem;
  padding: 0.625rem;
  &:hover {
    color: rgb(107,114,128);
  }
`}
        onClick={toggleDropdown}
        type="button"
      >
        <span class="sr-only">Open options</span>
        <As
          as="svg"
          aria-hidden="true"
          css={css`
  height: 1.25rem;
  width: 1.25rem;
`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
        </As>
      </As>
      {isDropdownOpen() && (
        <As
          as="div"
          aria-labelledby={`options-menu-${props.title}-button`}
          aria-orientation="vertical"
          css={css`
  background-color: rgb(255,255,255);
  border-radius: 0.375rem;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.5);
  margin-top: 0.125rem;
  outline-offset: 2px;
  outline: 2px solid transparent;
  position: absolute;
  padding-top: 0.5rem; padding-bottom: 0.5rem;
  right: 0px;
  transform-origin: top right;
  width: 8rem;
  z-index: 10;
`}
          role="menu"
          tabindex="-1"
        >
          <For each={props.options}>
            {(option, index) => (
              <As
                as="a"
                css={css`
  color: rgb(17,24,39);
  display: block;
  font-size: 0.875rem;
  padding-left: 0.75rem; padding-right: 0.75rem;
  padding-top: 0.25rem; padding-bottom: 0.25rem;
`}
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
              </As>
            )}
          </For>
        </As>
      )}
    </CardOptionsContainer>
  );
}

export function CardOptionsContainer(props: { children: JSX.Element }) {
  return (
    <As
      as="div"
      css={css`
  margin-left: auto;
  position: relative;
`}
    >
      {props.children}
    </As>
  );
}
