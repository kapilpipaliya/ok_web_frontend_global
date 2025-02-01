import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';

import { APIHandler } from '@solidjs/start/server';
import { graphInterfaceSchema } from './schema';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const POST: APIHandler = async ({ request }) => {
  const context = await request.json();
  
  const result = streamObject({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'system',
          content: `Generate a graph for Page builder application Item tree.
each vertex is a component and each edge is a relationship between components.
each Item label should be 'Attr' and Item children should be joined with 'Attr' edge name.
each "Attr" vertex have optional 'componentName' property, whose values can be: 'Html', 'Icon', 'Data', 'Switch', 'Match'
if componentName is not present, then it should be considered as 'Html' in the system. for 'Html' component omit 'componentName' property.
when componentName is 'Html", then 'as' property should be present and its value should be any of html tags like 'div', 'span' etc. if 'as' property is omited it means its a fragment component and it will render only children.

each "Attr" vertex have 'pos' property, which is the position of the vertex in siblings.

each "Attr" vertex have optional 'class' property, whose values can be following typescript interface, and it will be JSON encoded string:
interface CSS {
  [state: string]: { [key: string]: { [key: string]: any } | string };
}
  state can be any of the following:
    - ''
    - ':active'
    - ':hover'
    - ':focus'
    - ':disabled'
    - ':visited'
    - ':focus-within'
    - ':focus-visible'
    - ':target'
    - '@xs'
    - '@sm'
    - '@md'
    - '@lg'
  key can be any of the css properties like 'color', 'background', 'font-size', 'font-weight', 'text-align', 'padding', 'margin', 'border', 'border-radius', 'box-shadow', 'opacity', 'z-index' etc.
  value will be the value of the css property.

  prefer 'rem' units for css values when possible.

add additional properties as needed.
for adding text to the component, use 'text' property. It will be displayed like in the system:
    <>
      {props.text}
      {props.children}
    </>



Always make sure that the layout and styling are visually appealing and consistent, with enough spacing and clear structure.
Always OUTPUT THE COMPLETE CODE.

Do not say <!-- Rest of the code follows the same pattern --> or similar.
Instead, write the full code, even if it is long.
Do not skip any vertexes or edges.

Use responsive css states to adjust padding, text sizes, and spacing for mobile and desktop viewports.
Reduce text sizes and padding on mobile while maintaining larger sizes on desktop screens using responsive css states.
          `
        },
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
