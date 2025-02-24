import type { Message } from "ai";

import { createSignal, For, type JSX, Match, Show, Switch } from "solid-js";

import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { IconButton } from "~/components/styled/IconButton";
import { TooltipWrapper } from "~/components/styled/TooltipWrapper";

interface ChatInputProps {
  chatMessages: Message[];
  examples: string[];
  examplesButtonRef: HTMLButtonElement | undefined;
  fileInputRef: HTMLInputElement | undefined;
  files: () => FileList | undefined;
  input: () => string;
  isLoading: () => boolean;
  onClearMessages: () => void;
  onExampleClick: (example: string) => void;
  onExamplesToggle: (show: boolean) => void;
  onFilesChange: (files: FileList | undefined) => void;
  onInputChange: JSX.ChangeEventHandlerUnion<
    HTMLInputElement | HTMLTextAreaElement,
    Event
  >;
  onSubmit: (e: SubmitEvent, model: string) => void;
  showExamples: () => boolean;
}

export function ChatInput(props: ChatInputProps) {
  const [selectedModel, setSelectedModel] = createSignal<string>("gpt-4-turbo");

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    props.onSubmit(e, selectedModel());
  };

  return (
    <form
      class="background:base-5 border-top:1px|solid|rgb(229,231,235) p:4 mb:4"
      onSubmit={handleSubmit}
    >
      <div class="display:flex flex-direction:column gap:8px">
        <ModelSelector
          isLoading={props.isLoading}
          models={[
            "o1",
            "o1-mini",
            "o1-preview",
            "gpt-4o",
            "gpt-4o-mini",
            "gpt-4-turbo",
            "gpt-4",
            "gpt-3.5-turbo",
          ]}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
        <MessagesCount
          chatMessages={props.chatMessages}
          onClearMessages={props.onClearMessages}
        />
        <div class="display:flex gap:8px">
          <textarea
            class="flex:1 padding:8px border:1px|solid|base border-radius:6px disabled:opacity:50 disabled:cursor:not-allowed min-height:40px resize:vertical"
            disabled={props.isLoading()}
            onChange={props.onInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (
                  (e.metaKey || e.ctrlKey) &&
                  !props.isLoading() &&
                  (e.target as HTMLTextAreaElement).value.trim()
                ) {
                  (props.onInputChange as any)(e);
                  handleSubmit(e as any);
                } else {
                  // Prevent form submission on regular Enter
                  e.stopPropagation();
                }
              }
            }}
            placeholder="Generate a page... (Press Cmd+Enter to submit)"
            value={props.input()}
          />
          <IconButton
            disabled={props.isLoading()}
            icon="ph:list"
            onClick={() => props.onExamplesToggle(!props.showExamples())}
            ref={props.examplesButtonRef}
            size={22}
            title="Show Examples"
          />
          <IconButton
            class="cursor:pointer"
            disabled={props.isLoading()}
            icon="ph:paper-plane-right"
            size={22}
            title="Submit"
            type="submit"
          />
        </div>
        <FileInput
          files={props.files}
          onFilesChange={props.onFilesChange}
          ref={props.fileInputRef}
        />
        <Show when={props.showExamples()}>
          <DropdownMenu
            onClickOutside={() => props.onExamplesToggle(false)}
            onMouseLeave={() => props.onExamplesToggle(false)}
            parentRef={props.examplesButtonRef!}
          >
            <div class="display:flex flex-direction:column gap:4px padding:8px">
              <For each={props.examples}>
                {(example) => (
                  <button
                    class="text-align:left padding:8px background:rgb(243,244,246) border-radius:6px hover:background:rgb(229,231,235)"
                    onClick={() => props.onExampleClick(example)}
                    type="button"
                  >
                    {example}
                  </button>
                )}
              </For>
            </div>
          </DropdownMenu>
        </Show>
      </div>
    </form>
  );
}

function FileInput(props: {
  files: () => FileList | undefined;
  onFilesChange: (files: FileList | undefined) => void;
  ref: HTMLInputElement | undefined;
}) {
  return (
    <div class="display:flex gap:8px">
      <IconButton
        class="cursor:pointer"
        icon="ph:paperclip"
        onClick={() => props.ref?.click()}
        size={22}
        title="Select File"
      />
      <input
        class="hidden"
        multiple
        onChange={(e) =>
          props.onFilesChange(e.currentTarget.files ?? undefined)
        }
        ref={props.ref}
        type="file"
      />
      <Show when={props.files()}>
        <div class="display:flex gap:8px margin-bottom:8px">
          <For each={Array.from(props.files()!)}>
            {(file) => (
              <div class="relative">
                <Switch
                  fallback={
                    <div class="width:48px height:48px display:flex justify-content:center align-items:center background:rgb(243,244,246) border-radius:4px">
                      <span class="font-size:24px">📄</span>
                    </div>
                  }
                >
                  <Match when={file.type.startsWith("image/")}>
                    <img
                      alt={file.name}
                      class="width:48px height:48px object-fit:cover border-radius:4px"
                      src={URL.createObjectURL(file)}
                    />
                  </Match>
                  <Match when={file.type.startsWith("video/")}>
                    <video
                      class="width:48px height:48px object-fit:cover border-radius:4px"
                      src={URL.createObjectURL(file)}
                    />
                  </Match>
                  <Match when={file.type.startsWith("audio/")}>
                    <div class="width:48px height:48px display:flex justify-content:center align-items:center background:rgb(243,244,246) border-radius:4px">
                      <span class="font-size:24px">🎵</span>
                    </div>
                  </Match>
                </Switch>
                <IconButton
                  icon="ph:x-circle"
                  onClick={() => {
                    const currentFiles = props.files();
                    if (currentFiles) {
                      const newFiles = Array.from(currentFiles).filter(
                        (f) => f !== file,
                      );
                      props.onFilesChange(
                        newFiles.length > 0 ? newFiles : undefined,
                      );
                      if (newFiles.length === 0 && props.fileInputRef) {
                        props.fileInputRef.value = "";
                      }
                    }
                  }}
                  size={22}
                  title="Clear file"
                />
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

function MessagesCount(props: {
  chatMessages: Message[];
  onClearMessages: () => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  let deleteButtonRef: HTMLButtonElement;

  return (
    <Show when={props.chatMessages.length > 0}>
      <div class="display:flex justify-content:space-between align-items:center">
        <TooltipWrapper
          arrowClass="text:rgb(243,244,246)"
          content={
            <For each={props.chatMessages}>
              {(msg) => (
                <div class="display:flex gap:8px max-width:800px">
                  <span class="font-weight:bold">{msg.role}:</span>
                  <span>{msg.content}</span>
                </div>
              )}
            </For>
          }
          triggerClass="color:rgb(107,114,128)"
        >
          <span class="color:rgb(107,114,128)">
            Messages: {props.chatMessages.length}
          </span>
        </TooltipWrapper>
        <IconButton
          icon="ph:trash"
          onClick={() => setShowDeleteConfirm(true)}
          ref={deleteButtonRef!}
          size={22}
          title="Clear Messages"
        />
        <Show when={showDeleteConfirm()}>
          <DropdownMenu
            onClickOutside={() => setShowDeleteConfirm(false)}
            parentRef={deleteButtonRef!}
          >
            <div class="padding:0.50rem">
              <div class="flex flex:col gap:0.5rem">
                <div class="px:1rem py:0.5rem">Are you sure?</div>
                <button
                  class="text-align:left px:1rem py:0.5rem hover:bg:gray-10"
                  onClick={() => {
                    props.onClearMessages();
                    setShowDeleteConfirm(false);
                  }}
                >
                  Yes, clear messages
                </button>
                <button
                  class="text-align:left px:1rem py:0.5rem hover:bg:gray-10"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </DropdownMenu>
        </Show>
      </div>
    </Show>
  );
}

function ModelSelector(props: {
  isLoading: () => boolean;
  models: string[];
  selectedModel: () => string;
  setSelectedModel: (model: string) => void;
}) {
  return (
    <select
      class="padding:8px border:1px|solid|base border-radius:6px width:fit-content"
      disabled={props.isLoading()}
      onChange={(e) => props.setSelectedModel(e.currentTarget.value)}
      value={props.selectedModel()}
    >
      <For each={props.models}>
        {(model) => <option value={model}>{model}</option>}
      </For>
    </select>
  );
}
