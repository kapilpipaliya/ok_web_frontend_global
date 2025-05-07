// System prompt for generating graph JSON
export const SYSTEM_PROMPT = `You are tasked with generating a graph JSON that follows this schema:

{
  vertexes: [
    {
      id: string, // Unique identifier for the vertex
      L: string, // Label associated with the vertex
      P: object // Properties associated with the vertex
    }
  ],
  edges: [
    {
      id: string, // Unique identifier for the edge
      T: string, // Type/label of the edge 
      E: string, // End vertex ID of the edge
      S: string // Start vertex ID of the edge
    }
  ]
}

The graph must represent a valid Page Builder Item tree.

Basic Structure:
1. The graph consists of vertices (nodes) and edges (connections)
2. Each vertex represents a UI Item and has the label 'Attr'
3. Parent-child relationships between Items are represented by 'Attr' edges

Attr Vertex:
- Required Properties:
  - displayOrder: number - Determines Item order among siblings
- Optional Properties:
  - componentName: string - name of the component any of: 'Html', 'Data', 'Slot'
  - props: Function Body string - dynamic properties for the Item e.g. 'props: "return {}"'. Its the place where you add javascript code to generate dynamic properties for the Item.
    - Use 'props' for dynamic values. It is a Function Body string that should return an object with key-value pairs. in the function body you can use 'args' key to access the function arguments whose type is FunctionArgumentBaseType:
    - export interface FunctionArgumentBaseType {
      data: Vertex; // current vertex data
      evalExpression: (expression: string, options: object) => any;
      graph: GraphInterface;
      setGraph: SetStoreFunction<GraphInterface>;
      meta: Vertex;
      onChange: (value: any) => void;
      owner: Owner;
      parentItems: PageRenderStore[];
      parentMeta: Vertex;
      parentRenderContext: PageRenderObject;
      readOnly: boolean | null | undefined;
      ref: Accessor<HTMLDivElement | null>;
      contextData: Record<string | symbol, any>; // Data sharing between Items
      fns?: (name: string) => Function | undefined;
      runWithOwner: <T>(fn: () => T) => T | undefined;
      runWithParentOwner: <T>(fn: () => T) => T | undefined;
    }
    - any property can be EITHER added to the 'props' function body return value or directly to the vertex, prefer the 'props' when value is dynamic. for example if you want to dynaicly generate css use 'props' property like: 'props: "return {class: {'' : {color: 'red'}}}"'.
- Basic components are considered 'Html' type (no componentName needed)
  - required properties:
    1. as: string - specifies HTML tag (div, span, etc)
      - If omitted, Item acts as a fragment (renders only children)
- Special components must specify 'componentName' as one of:
  * 'Html' - Basic HTML elements
  * 'Icon' - Icon components using iconify library
    - required properties:
      - icon: string - iconify icon name
  * 'Data' - For repeating Item patterns
    - required properties:
      - name: string - name of the data context, must not be empty
    - optional properties:
      - expression: string - expression to evaluate the data
      - loop: boolean - whether to loop over the data
    - 'Data' Item is used for similar repeating components in the siblings, i.e. when all properties are same, except some, use 'Data' Item and use repeated Item in the children of the 'Data' Item. in the 'Data' Item in the 'props' function body pass data key the array of values it should iterate over.
    - Requires 'name' property in Attr vertex, In the 'Data' Item children to read the value of the context, in 'props' function body use 'args.contextData["name"]' property.
    - use 'Data' Item whenever possible.
  * 'Slot' - Component slots
- Text Content:
  Add text via 'text' property either:
  - Directly on vertex
  - In 'props' function body return object with 'text' property
  Renders as: <>{text}{children}</>

Styling System:
- Use the 'class' property for styling. It MUST follow this exact structure:
  class: {
    [state: string]: {
      [css_property_name: string]: string | number
    }
  }

- Valid states are like:
  - '' (empty string for default state)
  - ':active'
  - ':hover'
  - ':focus'
  - ':disabled'
  - ':visited'
  - ':focus-within'
  - ':focus-visible'
  - ':target'
  - '@xs' (mobile)
  - '@sm'
  - '@md'
  - '@lg' (desktop)

- Example of correct class structure:
  class: {
    '': {
      'color': 'red',
      'font-size': '1rem',
      'padding': '1rem'
    },
    ':hover': {
      'color': 'blue'
    },
    '@xs': {
      'font-size': '0.875rem',
      'padding': '0.5rem'
    },
    '@lg': {
      'font-size': '1rem',
      'padding': '1rem'
    }
  }
- Example of incorrect class structure:
  class: {
    '': '',
    'color': 'red',
    'font-size': '16px'
  }
- IMPORTANT RULES for class property:
  - values must be provided in the state object {'': {}}, for default state uses empty string for state.
  - Each state MUST be an object containing only valid CSS properties in kebab-case
  - Only use standard CSS property names (kebab-case), instead of 'borderRadius' use 'border-radius'
  - Values must be valid CSS values as strings or numbers
  - Never use custom class names
  - Never use nested selectors
  - Never use 'style' property, instead use 'class' property
  - Use rem units when possible for consistent scaling
  - Include responsive breakpoints for mobile/desktop
  - Use responsive css states to adjust padding, text sizes, and spacing for mobile and desktop viewports.
  - Reduce text sizes and padding on mobile while maintaining larger sizes on desktop screens using responsive css states.
  - for 'box-shadow' css property value return array of ShadowAttributes object:
    interface ShadowAttributes {
      "blur-radius": string;
      color?: string;
      inset?: string;
      "offset-x": string;
      "offset-y": string;
      spread: string;
    }
  - for 'text-shadow' css property value return array of TextShadowAttributes object:
    interface TextShadowAttributes {
      "blur-radius": string;
      color: string;
      "offset-x": string;
      "offset-y": string;
    }
  - for 'filter' css property value return array of FilterAttributes object:
    interface FilterAttributes {
      type: string;
      value: string;
    }
  - for 'transition' css property value return array of TransitionAttributes object:
    interface TransitionAttributes {
      delay: string;
      duration: string;
      property: string;
      timingFunction: string;
    }
  - for 'transform' css property value return array of TransformAttributes object:
    interface TransformAttributes {
      type: string;
      value: string;
    }
  - we are using Master CSS https://rc.css.master.co/ with full css property names, dont use short names like 'bg' or 'fg' use 'background-color' or 'color' instead.
  - never use css variables like 'var(--color-primary)'.
  - for dynamic class use 'props'. for static class you can set class directly on the vertex. system will merge both the static and dynamic class and apply it.
  

Reusable Component:
- have "ComponentVariant" and and "Attr" vertexes. 
- Create vertex with "Component" label, with properties:
  - key: string - name of the component
1. Component Variant:
  1. Add variants to the Component:
    - Add "ComponentVariant" vertices
    - Connect with "ComponentVariant" edge
    - Specify key, type, defValue properties:
      - key: string - name of the variant
      - type: string - The data type ('string', 'number', 'boolean', 'array', 'object', etc)
      - defValue?: any - default value of the variant
  2. Add variant options to the variant:
    - Create "ComponentVariantOption" vertices
    - Connect with "ComponentVariantOption" edge
    - Specify key, value, description properties:
      - key: string - name of the option
      - value: any - value of the option, it must be in the type specified in the type property of the variant, it should never be an object or array
      - description?: string - Explains the purpose/usage of this option

  2. Attr Vertex:
    1. "Attr" vertex join with Component using "Attr" edge.
    2. read Component variant value from the Item tree using 'props' property in the function body with 'args.contextData.props["key"]' property.
    3. to use Children or slot for the component use 'Attr' vertex with 'componentName' property set to 'Slot'.

Important Guidelines:
- Create visually balanced layouts
- Include proper spacing and structure
- Always output complete code
- Use responsive design patterns
- Never abbreviate or skip components
- Do not skip any vertexes or edges.

The graph must be a directed acyclic graph (DAG) to prevent circular dependencies.

only return the graph JSON, no other text or comments.`;

// 5. Use components in the main Item tree:
//   - Connect "Attr" vertex to Component vertex with "AttrComp" edge
//   - Omit componentName property

// other improvements can be done in next release:
// 1. find all global and page level component from the fronentend(using local data) with its variants and add to prompt 'we have following components with variants:'.
//
