import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { SETTINGS_CONSTANTS } from "../../settings/constants";
import { css } from "~/lib/styles";

export function addEditButtonSchema(label: string) {
  return {
    as: "",
    attributes: [
      {
        attributes: [
          {
            as: "button",
            css: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              onClick: () => {
                options.contextData.modalState[1]("showModal", true);
              },
              text: `Add New ${label}`,
            }),
            type: "button",
          },
        ],
        componentName: "Show",
        props: (options: FunctionArgumentType) => ({
          when: options.data?.id?.startsWith("-"),
        }),
      },
      {
        attributes: [
          {
            as: "button",
            attributes: [
              {
                componentName: "Html",
                as: "icon",
                height: 20,
                icon: "ph:pencil",
                width: 20,
              },
            ],
            css: css`
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: transparent;
  border: none;
  &:hover {
    background-color: \${args.theme.var.color.base_20};
  }
`,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              onClick: () => {
                options.contextData.modalState[1]("showModal", true);
              },
            }),
            type: "button",
          },
        ],
        componentName: "Show",
        props: (options: FunctionArgumentType) => ({
          when: !options.data?.id?.startsWith("-"),
        }),
      },
    ],
    componentName: "Html",
  } as FieldAttribute;
}
