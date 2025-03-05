import type { FunctionArgumentType } from "~/components/form/FieldSchemaType";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { SETTINGS_CONSTANTS } from "../../settings/constants";

export function addEditButtonSchema(label: string) {
  return {
    attributes: [
      {
        attributes: [
          {
            as: "button",
            class: SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS,
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              onClick: () => {
                options.dataContext.modalState[1]("showModal", true);
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
                componentName: "Icon",
                height: 20,
                icon: "ph:pencil",
                width: 20,
              },
            ],
            class: "flex ai:center",
            componentName: "Html",
            props: (options: FunctionArgumentType) => ({
              onClick: () => {
                options.dataContext.modalState[1]("showModal", true);
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
    componentName: "Fragment",
  } as FieldAttribute;
}
