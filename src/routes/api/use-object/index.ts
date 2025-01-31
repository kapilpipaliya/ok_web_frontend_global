import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';

import { APIHandler } from '@solidjs/start/server';

import { DeepPartial } from 'ai';
import { z } from 'zod';

// define a schema for the notifications
export const notificationSchema = z.object({
  notifications: z.array(
    z.object({
      name: z.string().describe('Name of a fictional person.'),
      message: z.string().describe('Message. Do not use emojis or links.'),
      minutesAgo: z.number(),
    }),
  ),
});

// define a type for the partial notifications during generation
export type PartialNotification = DeepPartial<typeof notificationSchema>;



// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const POST: APIHandler = async ({ request }) => {
  const context = await request.json();

  const result = streamObject({
    model: openai('gpt-4o'),
    prompt: `Generate 3 notifications for a messages app in this context: ${context}`,
    schema: notificationSchema,
  });

  return result.toTextStreamResponse();
};
