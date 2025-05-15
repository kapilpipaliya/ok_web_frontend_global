import { For } from "solid-js";

import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { EXAMPLE_PROMPTS, type PromptGroup } from "./constants/EXAMPLE_PROMPTS";

interface PromptsMenuProps {
  examplesButtonRef: HTMLButtonElement;
  onClickOutside: () => void;
  onExampleClick: (example: string) => void;
  onMouseLeave: () => void;
}

export function PromptsMenu(props: PromptsMenuProps) {
  return (
    <DropdownMenu
      onClickOutside={props.onClickOutside}
      onMouseLeave={props.onMouseLeave}
      parentRef={props.examplesButtonRef}
    >
      <As
        as="div"
        css={css`
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          max-height: 420px;
          overflow-y: auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          width: 420px;
          min-width: 420px;
        `}
      >
        <As
          as="div"
          css={css`
            font-weight: 600;
            padding-bottom: 4px;
            border-bottom: 1px solid \${args.theme.var.color.base_10};
            margin-bottom: 4px;
          `}
        >
          Prompt Examples
        </As>
        <For each={EXAMPLE_PROMPTS}>
          {(group: PromptGroup) => (
            <As
              as="div"
              css={css`
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 8px;
              `}
            >
              <As
                as="div"
                css={css`
                  font-weight: 600;
                  color: \${args.theme.var.color.base_50};
                  font-size: 13px;
                  margin-top: 4px;
                `}
              >
                {group.title}
              </As>
              <For each={group.prompts}>
                {(example) => (
                  <As
                    as="button"
                    css={css`
                      text-align: left;
                      padding: 10px 12px;
                      background: \${args.theme.var.color.base_2};
                      border-radius: 6px;
                      border: 1px solid \${args.theme.var.color.base_10};
                      transition: all 0.2s;
                      font-size: 13px;
                      width: 100%;
                      
                      &:hover {
                        background: \${args.theme.var.color.base_5};
                        border-color: \${args.theme.var.color.base_15};
                      }
                    `}
                    onClick={() => props.onExampleClick(example)}
                    type="button"
                  >
                    {example}
                  </As>
                )}
              </For>
            </As>
          )}
        </For>
      </As>
    </DropdownMenu>
  );
}
