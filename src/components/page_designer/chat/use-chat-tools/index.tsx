/* eslint-disable react/jsx-key */
import { useChat } from "@ai-sdk/solid";
import { For, Show } from "solid-js";

export function UseChatTools() {
  const { addToolResult, handleInputChange, handleSubmit, input, messages } =
    useChat({
      api: "/api/use-chat-tools",
      maxSteps: 5,

      // run client-side tools that are automatically executed:
      async onToolCall({ toolCall }) {
        if (toolCall.toolName === "getLocation") {
          const cities = [
            "New York",
            "Los Angeles",
            "Chicago",
            "San Francisco",
          ];
          return cities[Math.floor(Math.random() * cities.length)];
        }
      },
    });

  return (
    <div class="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <For each={messages()} fallback={<div>No messages</div>}>
        {(message) => (
          <div class="whitespace-pre-wrap">
            <strong>{`${message.role}: `}</strong>
            {message.content}
            <For each={message.toolInvocations || []}>
              {(toolInvocation) => (
                <Show
                  fallback={
                    <Show
                      fallback={
                        <div class="text-gray-500">
                          Calling {toolInvocation.toolName}...
                        </div>
                      }
                      keyed
                      when={"result" in toolInvocation && toolInvocation}
                    >
                      {(toolInvocation) => (
                        <div class="text-gray-500">
                          Tool call {`${toolInvocation.toolName}: `}
                          {toolInvocation.result}
                        </div>
                      )}
                    </Show>
                  }
                  keyed
                  when={
                    toolInvocation.toolName === "askForConfirmation" &&
                    toolInvocation
                  }
                >
                  {(toolInvocation) => (
                    <div class="text-gray-500">
                      {toolInvocation.args.message}
                      <div class="flex gap-2">
                        <Show
                          fallback={
                            <>
                              <button
                                class="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                                onClick={() =>
                                  addToolResult({
                                    result: "Yes, confirmed.",
                                    toolCallId: toolInvocation.toolCallId,
                                  })
                                }
                              >
                                Yes
                              </button>
                              <button
                                class="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                                onClick={() =>
                                  addToolResult({
                                    result: "No, denied",
                                    toolCallId: toolInvocation.toolCallId,
                                  })
                                }
                              >
                                No
                              </button>
                            </>
                          }
                          keyed
                          when={"result" in toolInvocation && toolInvocation}
                        >
                          {(toolInvocation) => <b>{toolInvocation.result}</b>}
                        </Show>
                      </div>
                    </div>
                  )}
                </Show>
              )}
            </For>
            <br />
            <br />
          </div>
        )}
      </For>

      <form onSubmit={handleSubmit}>
        <input
          class="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          onChange={handleInputChange}
          placeholder="Say something..."
          value={input()}
        />
      </form>
    </div>
  );
}
