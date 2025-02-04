import { openai } from '@ai-sdk/openai';
import { APIEvent } from '@solidjs/start/server';
import { streamText } from 'ai';
import { SYSTEM_PROMPT } from './SYSTEM_PROMPT';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const POST = async (event: APIEvent) => {
  // Extract the messages and model from the body of the request
  const { messages, model } = await event.request.json();

  // Call the language model with streaming
  const result = streamText({
    model: openai(model || 'gpt-4-turbo'),
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      ...messages
    ],
    async onFinish({ text, toolCalls, toolResults, usage, finishReason }) {
      // Implement custom logic for message storage and usage tracking
    },
  });

  // Return streaming response
  return result.toDataStreamResponse();
};
