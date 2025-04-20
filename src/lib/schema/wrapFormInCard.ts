import type { FieldAttribute } from "../meta/FormMetadataType";
import { css } from "../styles";

export const wrapFormInCard = (formSchema: FieldAttribute) => {
  return {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "form",
            attributes: [formSchema],
            componentName: "Html",
            props: () => ({
              onSubmit: (e: Event) => {
                e.preventDefault();
              },
            }),
          },
        ],
        css: css`
  background-color: \${args.theme.var.color.base_10};
  padding: 16px;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 1px 2px 3px \${args.theme.var.color.primary};
`, // max-width:700px width:90%
        componentName: "Html",
      },
    ],
    css: css`
  min-height: 100vh;
  background-color: \${args.theme.var.color.base_20};
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`,
    componentName: "Html",
  } as FieldAttribute;
};
