import type { Vertex } from "~/lib/graph/type/vertex";
import type { Edge } from "~/lib/graph/type/edge";

/**
 * Generates a schema for a text input field with the same functionality as TextInputField
 * The function reads all props from args.contextData.props
 *
 * @param id - Optional ID for the vertex, defaults to "root"
 * @returns A graph JSON structure representing the text input component
 */
export function getTextInputSchema(id = "root") {
  // Use the provided ID or default to "root"

  return {
    vertexes: [
      {
        id,
        L: "Attr",
        P: {
          displayOrder: 1,
          componentName: "Html",
          props: `
// Access component props from args.contextData.props
const props = args.contextData.props || {};

// Create input element properties
const as = props.type === "textarea" ? "textarea" : "input";
const type = props.type === "textarea" ? undefined : (props.type || "text");
const placeholder = props.placeholder || "";
const disabled = props.disabled || false;
const readOnly = props.readOnly || false;
const value = props.type === "checkbox" 
  ? { checked: !!args.data?.P[args.contextData.props.key] } 
  : { value: args.data?.P[args.contextData.props.key] !== undefined ? args.data.P[args.contextData.props.key] : "" };
const maxLength = props.maxLength;
const minLength = props.minLength;
const required = props.required || false;
const rows = props.rows || (props.type === "textarea" ? 3 : undefined);
const error = props.error;
const errorClass = props.errorClass;
const isViewMode = props.isViewMode || false;
const viewModeClass = props.viewModeClass;
const showValue = props.showValue || false;
const suffixToValue = props.suffixToValue;

// Define the onChange handler
const onChange = (event) => {
  if (disabled || readOnly) {
    return;
  }
  
  const target = event.target;
  let newValue;
  
  if (props.type === "checkbox") {
    newValue = target.checked;
  } else if (props.type === "number") {
    const targetValue = target.value.trim();
    if (targetValue === "") {
      newValue = "";
    } else {
      const parsedValue = Number.parseFloat(targetValue);
      newValue = isNaN(parsedValue) ? "" : parsedValue;
    }
  } else if (props.type === "file") {
    const files = target.files;
    if (files && files.length > 0) {
      newValue = files;
    } else {
      return; // No files selected, do nothing
    }
  } else if (props.type === "date") {
    newValue = target.value;
  } else {
    newValue = target.value;
  }
  
  // Use the key from props to update the data
  if (props.context.onChange) {
    props.context.onChange(newValue);
  }
};

// Return the properties
return {
  as,
  type,
  placeholder,
  disabled,
  readOnly,
  ...value,
  maxLength,
  minLength,
  required,
  rows,
  error,
  errorClass,
  isViewMode,
  viewModeClass,
  showValue,
  suffixToValue,
  onChange
};`,
          css: `
// Access component props from args.contextData.props
const props = args.contextData.props || {};
const errorClass = props.errorClass || "error-field";
const isTextarea = props.type === "textarea";
const disabled = props.disabled || false;
const readOnly = props.readOnly || false;

return \`._id {
  padding: \${props.type === "checkbox" ? "0" : "0.625rem"};
  border: \${props.type === "checkbox" ? "none" : \`1px solid \${args.theme.var.color.base_200}\`};
  border-radius: 0.25rem;
  font-size: 0.875rem;
  width: \${props.type === "checkbox" ? "auto" : "100%"};
  \${isTextarea ? "min-height: 6rem;" : ""}
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  outline: none;
  background-color: \${disabled || readOnly ? args.theme.var.color.base_100 : "white"};
  
  &:focus {
    border-color: \${args.theme.var.color.primary};
    box-shadow: 0 0 0 2px \${args.theme.var.color.primary}30;
  }
  
  &.\${errorClass} {
    border-color: \${args.theme.var.color.error};
    
    &:focus {
      box-shadow: 0 0 0 2px \${args.theme.var.color.error}30;
    }
  }
}\`;`,
        },
      },
    ],
    edges: [],
  };
}

/**
 * Returns a more complex schema for a text input field with label and error message
 * The function reads all props from args.contextData.props
 *
 * @returns A graph JSON structure representing the complete text input component with label and error
 */
export function getTextInputWithLabelSchema() {
  // Generate unique IDs for vertices
  const containerId = "1";
  const labelId = "2";
  const inputId = "3";
  const errorId = "4";

  // Get the base text input schema with the input ID
  const textInputSchema = getTextInputSchema(inputId);
  const inputVertex = textInputSchema.vertexes[0];

  // Create a complete schema with label and error
  return {
    vertexes: [
      // Container
      {
        id: containerId,
        L: "Attr",
        P: {
          displayOrder: 1,
          componentName: "Html",
          props: `
// Access component props from args.contextData.props
const props = args.contextData.props || {};
            
return {
  as: "div"
};`,
          css: `
// Access component props from args.contextData.props
const props = args.contextData.props || {};
const labelPosition = props.labelPosition || "top";
const labelInline = props.labelInline || false;

return \`._id {
  display: flex;
  flex-direction: \${labelPosition === "left" || labelInline ? "row" : "column"};
  \${labelPosition === "left" || labelInline ? "align-items: center;" : ""}
  gap: 0.5rem;
  width: 100%;
}\`;`,
        },
      },
      // Label
      {
        id: labelId,
        L: "Attr",
        P: {
          displayOrder: 1,
          componentName: "Html",
          props: `
// Access component props from args.contextData.props
const props = args.contextData.props || {};
            
return {
  as: "label",
  text: props.label || "",
  class: \`\${props.labelClass || ""} \${props.labelLayoutClass || ""}\`,
  style: props.hideLabel ? "display: none;" : undefined
};`,
          css: `
// Access component props from args.contextData.props
const props = args.contextData.props || {};
const labelPosition = props.labelPosition || "top";
const labelInline = props.labelInline || false;
const required = props.required || false;
const noRequiredIndicator = props.noRequiredIndicator || false;

return \`._id {
  font-size: 0.875rem;
  font-weight: 500;
  \${labelPosition === "left" || labelInline ? \`
    min-width: 8rem;
    text-align: right;
    margin-right: 0.5rem;
  \` : ""}
}

._id::after {
  content: \${required && !noRequiredIndicator ? '"*"' : '""'};
  color: \${args.theme.var.color.error};
  margin-left: 0.25rem;
}\`;`,
        },
      },
      // Input - reuse the input vertex from getTextInputSchema but add a class for error styling
      inputVertex,
      // Error message
      {
        id: errorId,
        L: "Attr",
        P: {
          displayOrder: 3,
          componentName: "Html",
          props: `
// Access component props from args.contextData.props
const props = args.contextData.props || {};
            
return {
  as: "div",
  text: props.error || "",
  class: "error-message",
  style: props.error ? undefined : "display: none;"
};`,
          css: `
return \`._id {
  color: \${args.theme.var.color.error};
  font-size: 0.75rem;
  margin-top: 0.25rem;
}\`;`,
        },
      },
    ],
    edges: [
      // Label is child of container
      {
        id: "e1",
        T: "Attr",
        S: containerId,
        E: labelId,
      },
      // Input is child of container
      {
        id: "e2",
        T: "Attr",
        S: containerId,
        E: inputId,
      },
      // Error is child of container
      {
        id: "e3",
        T: "Attr",
        S: containerId,
        E: errorId,
      },
    ],
  } as unknown as {
    vertexes: Vertex[];
    edges: Edge[];
  };
}
