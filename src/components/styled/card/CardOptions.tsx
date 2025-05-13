import { createSignal, type JSX } from "solid-js";
import { For } from "solid-js/web";
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

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
        css={(args: FunctionArgumentType) => css`
  color: ${args.theme.var.color.primary_45};
  display: block;
  margin: -0.625rem;
  padding: 0.625rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  &:hover {
    color: ${args.theme.var.color.primary_75};
    background-color: ${args.theme.var.color.primary_15};
  }
  &:focus {
    outline: 2px solid ${args.theme.var.color.primary_35};
    outline-offset: 2px;
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
          css={(args: FunctionArgumentType) => [
            css`
              background-color: ${args.theme.var.color.base_5};
              border-radius: 0.5rem;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
              border: 1px solid ${args.theme.var.color.primary_25};
              margin-top: 0.25rem;
              outline-offset: 2px;
              outline: 2px solid transparent;
              position: absolute;
              padding: 0.5rem;
              right: 0px;
              transform-origin: top right;
              width: 10rem;
              z-index: 10;
              animation: dropdown 0.2s ease forwards;
          `,
            `@keyframes dropdown {
                  from {
                      opacity: 0;
                      transform: translateY(-8px) scale(0.96);
                  }
                  to {
                      opacity: 1;
                      transform: translateY(0) scale(1);
                  }
              }`,
          ]}
          role="menu"
          tabindex="-1"
        >
          <For each={props.options}>
            {(option, index) => (
              <As
                as="a"
                css={(args: FunctionArgumentType) => css`
  color: ${args.theme.var.color.base_75};
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  transition: all 0.15s ease;
  text-decoration: none;
  &:hover {
    color: ${args.theme.var.color.base_95};
    background-color: ${args.theme.var.color.primary_15};
  }
  &:focus {
    outline: 2px solid ${args.theme.var.color.primary_35};
    outline-offset: -1px;
  }
`}
                href="#"
                id={`options-menu-${props.title}-item-${index()}`}
                onClick={(e) => {
                  e.preventDefault();
                  option.action();
                  setDropdownOpen(false);
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
