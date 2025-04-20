import { As } from "~/components/As";
import { capitalizeFirstLetter } from "~/lib/data_structure/string/capitalizeFirstLetter";
import { css } from "~/lib/styles";

export interface TabButtonProps {
  data: string;
  isSelected: boolean;
  onClick: () => void;
}

export function TabButton(props: TabButtonProps) {
  return (
    <As
      as="li"
      css={css`
  cursor: pointer;
`}
    >
      <As
        as="button"
        css={[
          css`
  border: none;
  display: inline-block;
  padding: 10px;
  white-space: nowrap;
  background: transparent;
  outline: none;
`,
          props.isSelected
            ? css`
              font-weight: 600;
              color: \${args.theme.var.color.primary};
              border-bottom: 2.5px solid \${args.theme.var.color.primary_200};
            `
            : css`
              &:hover {
                color: \${args.theme.var.color.base};
                border-bottom: 2.5px solid \${args.theme.var.color.base};
              }
            `,
        ]}
        onClick={props.onClick}
        type="button"
      >
        {capitalizeFirstLetter(props.data)}
      </As>
    </As>
  );
}
