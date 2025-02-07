/* eslint-disable @next/next/no-img-element */
import { useChat } from '@ai-sdk/solid';
import { getTextFromDataUrl } from '@ai-sdk/ui-utils';
import { createSignal, For } from 'solid-js';

export function UseChatAttachments() {
  const [files, setFiles] = createSignal<FileList | undefined>(undefined);
  let fileInputRef: HTMLInputElement | undefined;

  const {
    error,
    handleInputChange,
    handleSubmit,
    input,
    isLoading,
    messages,
    reload,
    stop,
  } = useChat({
    onFinish(message, { finishReason, usage }) {
      console.log('Usage', usage);
      console.log('FinishReason', finishReason);
    },
  });

  const onSend = async (e: Event) => {
    e.preventDefault();
    handleSubmit(e, {
      experimental_attachments: files(),
    });

    setFiles(undefined);
    if (fileInputRef) {
      fileInputRef.value = '';
    }
  };

  return (
    <div class="flex flex-col gap-2">
      <div class="flex flex-col p-2 gap-2">
        <For each={messages()}>
          {message => (
            <div class="flex flex-row gap-2">
              <div class="w-24 text-zinc-500 flex-shrink-0">
                {`${message.role}: `}
              </div>

              <div class="flex flex-col gap-2">
                {message.content}

                <div class="flex flex-row gap-2">
                  <For each={message.experimental_attachments}>
                    {(attachment, index) =>
                      attachment.contentType?.includes('image/') ? (
                        <img
                          alt={attachment.name}
                          class="w-24 rounded-md"
                          src={attachment.url}
                        />
                      ) : attachment.contentType?.includes('text/') ? (
                        <div class="w-32 h-24 rounded-md text-xs overflow-hidden p-2 text-zinc-500 border">
                          {getTextFromDataUrl(attachment.url)}
                        </div>
                      ) : null
                    }
                  </For>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>

      {isLoading() && (
        <div class="mt-4 text-gray-500">
          <div>Loading...</div>
          <button
            class="px-4 py-2 mt-4 text-blue-500 border border-blue-500 rounded-md"
            onClick={stop}
            type="button"
          >
            Stop
          </button>
        </div>
      )}

      {error() && (
        <div class="mt-4">
          <div class="text-red-500">An error occurred.</div>
          <button
            class="px-4 py-2 mt-4 text-blue-500 border border-blue-500 rounded-md"
            onClick={() => reload()}
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      <form
        class="flex flex-col gap-2 fixed bottom-0 p-2 w-full bg-white"
        onSubmit={onSend}
      >
        <div class="flex flex-row gap-2 fixed right-2 bottom-14 items-end">
          <For each={files() ? Array.from(files()!) : []}>
            {attachment => {
              const type = attachment.type;
              return type.startsWith('image/') ? (
                <div>
                  <img
                    alt={attachment.name}
                    class="w-24 rounded-md"
                    src={URL.createObjectURL(attachment)}
                  />
                  <span class="text-sm text-zinc-500">{attachment.name}</span>
                </div>
              ) : type.startsWith('text/') ? (
                <div class="w-24 text-zinc-500 flex-shrink-0 text-sm flex flex-col gap-1">
                  <div class="w-16 h-20 bg-zinc-100 rounded-md" />
                  {attachment.name}
                </div>
              ) : null;
            }}
          </For>
        </div>

        <input
          multiple
          onChange={e => setFiles(e.currentTarget.files ?? undefined)}
          ref={fileInputRef}
          type="file"
        />

        <input
          class="bg-zinc-100 w-full p-2"
          disabled={isLoading()}
          onInput={handleInputChange}
          placeholder="Send message..."
          value={input()}
        />
      </form>
    </div>
  );
}
