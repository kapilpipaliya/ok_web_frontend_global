import type {
  FunctionArgumentType,
  GenericField,
  IconField,
} from "~/components/form/FieldSchemaType";

import { getRequiredFields } from "~/components/form/functions/getRequiredFields";
import { validateFields } from "~/components/form/functions/validateFields";
import { path } from "~/utils/path";

export function getStatus(
  options: FunctionArgumentType,
  requiredFields?: string[],
) {
  const parentValue = path(
    [...(options.projections || [])],
    options.formValueStore,
  );
  const fieldsToCheck = requiredFields || getRequiredFields(options.formSchema);
  const filledFields = fieldsToCheck.filter((field) => parentValue[field]);
  const totalRequired = fieldsToCheck.length;

  if (totalRequired === 0) {
    return "completed";
  }
  if (filledFields.length === 0) {
    return "not-started";
  }
  if (filledFields.length < totalRequired) {
    return "semi-completed";
  }
  if (
    !(
      requiredFields ||
      validateFields(options.formSchema, options.formValueStore, false, false)
    )
  ) {
    return "semi-completed";
  }
  return "completed";
}

export function getStepBorder(
  requiredFields: string[],
  options: FunctionArgumentType,
) {
  const status = getStatus(options, requiredFields);
  let className = " ";
  switch (status) {
    case "completed":
      className += "border-primary/90";
      break;
    case "semi-completed":
      className += "border-primary/90";
      break;
    default:
      className += "border-gray/30";
      break;
  }
  return className;
}

export function getStepStatusIconField(
  requiredFields?: string[],
): GenericField {
  return {
    componentName: "icon",
    height: 22,
    icon: "ph:circle",
    name: "circle",
    otherProps: (options) => {
      const status = getStatus(options, requiredFields);

      let icon;
      let className;
      switch (status) {
        case "completed": {
          icon = "ph:check-circle";
          className = "text-green-500";
          break;
        }
        case "semi-completed": {
          icon = "ph:chart-pie";
          className = "text-primary";
          break;
        }
        default: {
          icon = "ph:circle";
          className = undefined;
          break;
        }
      }

      return {
        class: className,
        icon: icon,
      };
    },
    width: 22,
  } as IconField;
}
