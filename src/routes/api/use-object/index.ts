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
    prompt: `Generate any graph.`,
    schema: graphInterfaceSchema,
  });

  return result.toTextStreamResponse(); 
};
