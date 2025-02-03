import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';

import { APIHandler } from '@solidjs/start/server';
import { graphInterfaceSchema } from './schema';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// https://platform.openai.com/docs/guides/reasoning/beta-limitations
// guidelines: https://cdn.openai.com/spec/model-spec-2024-05-08.html#follow-the-chain-of-command
export const POST: APIHandler = async ({ request }) => {
  const context = await request.json();
  
  const result = streamObject({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'system',
          content: `You are tasked with generating a graph structure for a Page Builder application Item tree. Follow these specifications carefully:

Basic Structure:
1. The graph consists of vertices (nodes) and edges (connections)
2. Each vertex represents a UI Item and has the label 'Attr'
3. Parent-child relationships between Items are represented by 'Attr' edges

Attr Vertex:
  - Required Properties:
    - pos: number - Determines Item order among siblings
  - Optional Properties:
    - componentName: string - name of the component
    - otherProps: Function Body string - dynamic properties for the Item e.g. 'otherProps: "return {}"'
      - Use 'otherProps' for dynamic values. It is a Function Body string that should return an object with key-value pairs. in the function body you can use 'args' key to access the function arguments whose type is FunctionArgumentBaseType:
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
        dataContext: Record<string | symbol, any>; // Data sharing between Items
        fns: (name: string) => Function | undefined;
        runWithOwner: <T>(fn: () => T) => T | undefined;
        runWithParentOwner: <T>(fn: () => T) => T | undefined;
      }
      - any property can be either added to the 'otherProps' function body return value or directly to the vertex, prefer the 'otherProps' when value is dynamic.
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
      - 'Data' Item is used for similar repeating components in the siblings, i.e. when all properties are same, except some, use 'Data' Item and use repeated Item in the children of the 'Data' Item. in the 'Data' Item in the 'otherProps' function body pass data key the array of values it should iterate over.
      - Requires 'name' property in Attr vertex, In the 'Data' Item children to read the value of the context, in 'otherProps' function body use 'args.dataContext["name"]' property.
      - use 'Data' Item whenever possible.
    * 'Switch' - Conditional rendering
    * 'Match' - Pattern matching
    * 'ComponentChildren' - Component slots
  - Text Content:
    Add text via 'text' property either:
    - Directly on vertex
    - In otherProps return value
    Renders as: <>{text}{children}</>

Styling System:
  - Use the 'class' property for styling. It MUST follow this exact structure:
    class: {
      [state: string]: {
        [css_property_name: string]: string | number
      }
    }
  
  - Valid states are ONLY:
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
    

Reusable Components:
  - Can have variants and internal structure
  1. Create vertex with "Component" label
  2. Define variants:
    - Add "ComponentVariant" vertices
    - Connect with "ComponentVariant" edge
    - Specify key, type, defValue properties:
      - key: string - name of the variant
      - type: string - The data type ('string', 'number', 'boolean', 'array', 'object', etc)
      - defValue?: any - default value of the variant
  3. Add variant options:
    - Create "ComponentVariantOption" vertices
    - Connect with "ComponentVariantOption" edge
    - Specify key, value, description properties:
      - key: string - name of the option
      - value: any - value of the option
      - description?: string - Explains the purpose/usage of this option
  4. Use components:
    - Connect Item vertex to Component with "AttrComp" edge
    - Omit componentName property

Important Guidelines:
- Create visually balanced layouts
- Include proper spacing and structure
- Always output complete code
- Use responsive design patterns
- Never abbreviate or skip components
- Do not skip any vertexes or edges.

The graph must be a directed acyclic graph (DAG) to prevent circular dependencies.`
        },
        // Use responsive css states to adjust padding, text sizes, and spacing for mobile and desktop viewports.
        // Reduce text sizes and padding on mobile while maintaining larger sizes on desktop screens using responsive css states.
        {
          role: 'user',
          content: context.prompt
        }
      ],
      schema: graphInterfaceSchema,
    async onFinish({ object, usage, error, warnings, providerOptions, experimental_providerMetadata }) {
      // implement your own logic here, e.g. for storing messages
      // or recording token usage
    },
  });

  return result.toTextStreamResponse(); 
};
