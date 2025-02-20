import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { SETTINGS_CONSTANTS } from "../../settings/constants";

export function addEditButtonSchema(label: string) {
  return {
    attributes: [
      {
        attributes: [
          {
            class: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS,
            componentName: "Button",
            props: (options: FunctionArgumentType) => ({
              onClick: () => {
                options.dataContext.modalState[1]("showModal", true);
              },
              text: `Add New ${label}`,
            }),
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
            attributes: [
              {
                componentName: "Icon",
                height: 20,
                icon: "ph:pencil",
                width: 20,
              },
            ],
            class: "flex ai:center",
            componentName: "Button",
            props: (options: FunctionArgumentType) => ({
              onClick: () => {
                options.dataContext.modalState[1]("showModal", true);
              },
            }),
          },
        ],
        componentName: "Show",
        props: (options: FunctionArgumentType) => ({
          when: !options.data?.id?.startsWith("-"),
        }),
      },
    ],
    componentName: "Fragment",
  } as FieldAttribute;
}
