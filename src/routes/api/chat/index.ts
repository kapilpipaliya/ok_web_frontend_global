import type { APIEvent } from '@solidjs/start/server';

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

import { SYSTEM_PROMPT } from './SYSTEM_PROMPT';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const POST = async (event: APIEvent) => {
  // Extract the messages, model, and extra message from the body of the request
  const { extraMessages, messages, model } = await event.request.json();

  // Call the language model with streaming
  const result = streamText({
    messages: [
      ...(extraMessages || []),
      {
        content: SYSTEM_PROMPT,
        role: 'system'
      },
      ...messages
    ],
    model: openai(model || 'gpt-4-turbo'),
    async onFinish({ finishReason, text, toolCalls, toolResults, usage }) {
      // Implement custom logic for message storage and usage tracking
    },
  });

  // Return streaming response
  return result.toDataStreamResponse();
};
