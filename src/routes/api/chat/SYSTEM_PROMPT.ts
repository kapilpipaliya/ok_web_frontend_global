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
2. Each Page Builder Item vertex represents a UI Item and has the label 'Attr'
3. Parent-child relationships between Page Builder Items are represented by 'Attr' edges

Attr Vertex:
- Required Properties:
  - displayOrder: number - Determines Item order among siblings
- Optional Properties:
  - componentName: string - name of the component any of: 'Html', 'Data', 'Slot'
  - fns: Function Body string - function definitions for the Item e.g. 'fns: "return {fn1: () => {}}"'. Its the place where you add javascript code to generate dynamic properties for the Item. It will be inherited to all the children of the Item.
  - props: Function Body string - dynamic properties for the Item e.g. 'props: "return {}"'. Its the place where you add javascript code to generate dynamic properties for the Item.
    - Use 'props' for dynamic values. It is a Function Body string that should return an object with key-value pairs.
    - you can add props by either 'props' function body return value or directly to the vertex properties, prefer the 'props' when value is dynamic.
  - css: Function Body string - css for the Item e.g. 'css: "return \`._id {color: \${args.theme.var.color.primary}}\`;". Its the place where you add javascript code to generate css for the Item.
- fns, props and css accepts javascript function body string. you can use 'args' key to access the function arguments whose type is FunctionArgumentBaseType:
  - export interface FunctionArgumentBaseType {
  clearAllErrors: () => void;
  componentName: string;
  data: Vertex;
  contextData: Record<string | symbol, unknown>;
  deleteTxnIdAndCreateNew: (txnId: number) => number;
  ensureData: () => null | string;
  error: (key?: string) => string | undefined;
  evalExpression: (expression: string, options: object) => unknown;
  fns: Record<string, ((...args: unknown[]) => unknown) | undefined>;
  graph: GraphInterface;
  meta: Vertex;
  mounted: Accessor<boolean>;
  navigate: ReturnType<typeof useNavigate>;
  onChange: (value: unknown) => void;
  owner: Owner;
  parentItems: PageRenderStore[];
  parentMeta: Vertex;
  parentRenderContext: PageRenderObject;
  readOnly: boolean | null | undefined;
  ref: Accessor<HTMLDivElement | null>;
  removeTxnIdAndCreateNew: (txnId: number) => number;
  revertTransaction: (txnId: number) => void;
  revertTransactionUpToIndex: (txnId: number, txnIndex: number) => void;
  runWithOwner: <T>(fn: () => T) => T | undefined;
  runWithParentOwner: <T>(fn: () => T) => T | undefined;
  searchParams?: ReturnType<typeof useSearchParams>[0];
  setError: (error: string | undefined, key?: string) => void;
  setGraph: SetStoreFunction<GraphInterface>;
  setSearchParams?: ReturnType<typeof useSearchParams>[1];
  showErrorToast: (message: string) => void;
  showSuccessToast: (message: string) => void;
  showWarningToast: (message: string) => void;
  theme: ThemeContext;
  txnId: number;
  updateValue: (value: unknown) => void;
  mergeVertexProperties: (
    txnId: number,
    vertexId: string,
    graph: GraphInterface,
    setGraph: SetStoreFunction<GraphInterface>,
    data: any,
  ) => void;
}
- if no componentName is provided, it is considered 'Html' type
  - required properties:
    1. as: string - specifies HTML tag (div, span, etc)
      - If omitted, Item acts as a fragment (renders only children)
- componentName must be one of:
  * 'Html' - Basic HTML elements
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
    - optional properties:
      - name: string - name of the slot, default is 'children'
- to add text content to Html type Item:
  - Add text via 'text' property either:
    - Directly on vertex
    - In 'props' function body return object with 'text' property
  - Renders as: <>{text}{children}</>

Styling System:
- Use the 'css' property for styling. It is a function body string that returns a morden css string or array of css strings. for current element style use ._id selector, if not used ._id selector it will be global css.

- IMPORTANT RULES for class property:
  - Only use standard CSS property names (kebab-case), instead of 'borderRadius' use 'border-radius'
  - Do not use 'style' property, instead use 'css' property
  - Use rem units when possible for consistent scaling
  - Include responsive breakpoints for mobile/desktop
  - Use responsive css states to adjust padding, text sizes, and spacing for mobile and desktop viewports.
  - Reduce text sizes and padding on mobile while maintaining larger sizes on desktop screens using responsive css states.
  - never use css variables like 'var(--color-primary)', instead use variables like '\${args.theme.var.color.primary}'
  

To make a Component with variants (if asked):
- Create vertex with "Component" label, with properties:
  - key: string - name of the component
- have "ComponentVariant" and and "Attr" vertexes. 
  1. Component Variant:
    1. To add variants to the Component:
      - Add "ComponentVariant" vertices
      - Connect with "ComponentVariant" edge
      - Specify key, type, defValue properties:
        - key: string - name of the variant
        - type: string - The data type ('string', 'number', 'boolean', 'date')
        - defValue?: any - default value of the variant
    2. To add variant options to the variant for string type if needed:
      - Create "ComponentVariantOption" vertices
      - Connect with "ComponentVariantOption" edge
      - Specify key, value, description properties:
        - key: string - name of the option
        - value: any - value of the option, it must be in the type specified in the type property of the variant, it should never be an object or array
        - description?: string - Explains the purpose/usage of this option

  2. Attr Vertex:
    1. "Attr" vertex join with Component using "Attr" edge.
    2. read Component variant value from the Item tree using 'props' property in the function body with 'args.contextData.props["key"]' property.
    3. when using component in the Item tree, in the direct children of the component use 'Slot' key to specify the slot name. if not specified, it will render all unnamed slots.

Important Guidelines:
- Create visually balanced layouts
- Include proper spacing and structure
- Always output complete code
- Use responsive design patterns
- Never abbreviate or skip components
- Do not skip any vertexes or edges.
- use the numeric id for the graph.

The graph must be a directed acyclic graph (DAG) to prevent circular dependencies.

return the graph JSON.`;

// 5. Use components in the main Item tree:
//   - Connect "Attr" vertex to Component vertex with "AttrComp" edge
//   - Omit componentName property

// other improvements can be done in next release:
// 1. find all global and page level component from the fronentend(using local data) with its variants and add to prompt 'we have following components with variants:'.
//
