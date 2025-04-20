import { As } from "~/components/As";
import { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { capitalizeFirstLetter } from "~/lib/data_structure/string/capitalizeFirstLetter";
import { css } from "~/lib/styles";

export interface TabButtonProps {
  data: string;
  isSelected: boolean;
  onClick: () => void;
}

export function TabButton(props: TabButtonProps) {
  return (
    <As as="li" css={css`
  cursor: pointer;
`}>
      <As as="button"
        css={[css`
  border-bottom-width: 2.5px;
  border-color: transparent;
  display: inline-block;
  padding: 10px;
  white-space: nowrap;
`,
        props.isSelected 
          ? `
              font-weight: 600;
              color: \${args.theme.var.color.primary_40};
              border-bottom-width: 2.5px;
              border-color: \${args.theme.var.color.primary_40};
            `
          : `
              &:hover {
                color: \${args.theme.var.color.base_16};
                border-color: \${args.theme.var.color.base};
              }
            `
        ]}
        onClick={props.onClick}
        type="button"
      >
        {capitalizeFirstLetter(props.data)}
      </As>
    </As>
  );
}
