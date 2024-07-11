import type { ToggleField } from "./FieldType";

import { Icons } from "./Icons";

export const GeneralSection = {
  visibility: {
    component: "toggleButton",
    label: "Visibility",
    name: "visibility",
    options: [
      { icon: true, key: Icons.visibility.yes, value: "visible" },
      { icon: true, key: Icons.visibility.no, value: "hidden" },
    ],
  } as ToggleField,
};
