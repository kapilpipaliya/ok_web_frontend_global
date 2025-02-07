import type { Message } from 'ai';

import Tooltip from '@corvu/tooltip';
import { createSignal, For, type JSX, Show } from 'solid-js';

import { DropdownMenu } from '~/components/styled/DropdownMenu';
import { IconButton } from '~/components/styled/IconButton';

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
  onInputChange: JSX.ChangeEventHandlerUnion<HTMLInputElement | HTMLTextAreaElement, Event>;
  onSubmit: (e: SubmitEvent, model: string) => void;
  showExamples: () => boolean;
}

export function ChatInput(props: ChatInputProps) {
  const [selectedModel, setSelectedModel] = createSignal<string>('gpt-4-turbo');
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  let deleteButtonRef: HTMLButtonElement;

  const models: string[] = [
    'o1',
    'o1-mini',
    'o1-preview',
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo'
  ];

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    props.onSubmit(e, selectedModel());
  };

  const MessagesCount = () => {
    return (
      <div class="display:flex justify-content:space-between align-items:center">
        <Show when={props.chatMessages.length > 0}>
          <Tooltip
            floatingOptions={{
              flip: true,
              offset: 13,
              shift: true,
            }}
            openDelay={200}
            placement="top"
          >
            <Tooltip.Trigger class="color:rgb(107,114,128)">
              Messages: {props.chatMessages.length}
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content class="rounded-lg bg:rgb(243,244,246) px:3 py:2 font-medium data-open:animate-in data-open:fade-in-50% data-open:slide-in-from-bottom-1 data-closed:animate-out data-closed:fade-out-50% data-closed:slide-out-to-bottom-1">
                <For each={props.chatMessages}>
                  {(msg) => (
                    <div class="display:flex gap:8px max-width:800px">
                      <span class="font-weight:bold">{msg.role}:</span>
                      <span>{msg.content}</span>
                    </div>
                  )}
                </For>
                <Tooltip.Arrow class="text:rgb(243,244,246)" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip>
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
        </Show>
      </div>
    );
  };

  return (
    <form
      class="background:white border-top:1px|solid|rgb(229,231,235)"
      onSubmit={handleSubmit}
    >
      <div class="display:flex flex-direction:column gap:8px">
        <select
          class="padding:8px border:1px|solid|rgb(209,213,219) border-radius:6px width:fit-content"
          disabled={props.isLoading()}
          onChange={(e) => setSelectedModel(e.currentTarget.value)}
          value={selectedModel()}
        >
          <For each={models}>
            {model => (
              <option value={model}>{model}</option>
            )}
          </For>
        </select>
        <MessagesCount />
        <div class="display:flex gap:8px">
          <textarea
            class="flex:1 padding:8px border:1px|solid|rgb(209,213,219) border-radius:6px disabled:opacity:50 disabled:cursor:not-allowed min-height:40px resize:vertical"
            disabled={props.isLoading()}
            onChange={props.onInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if ((e.metaKey || e.ctrlKey) && !props.isLoading() && (e.target as HTMLTextAreaElement).value.trim()) {
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

        <div class="display:flex gap:8px">
          <input
            class="flex:1 cursor:pointer"
            multiple
            onChange={e => props.onFilesChange(e.currentTarget.files ?? undefined)}
            ref={props.fileInputRef}
            type="file"
          />
          <Show when={props.files()}>
            <IconButton
              icon="ph:x-circle"
              onClick={() => {
                props.onFilesChange(undefined);
                if (props.fileInputRef) {
                  props.fileInputRef.value = '';
                }
              }}
              size={22}
              title="Clear files"
            />
          </Show>
        </div>

        <Show when={props.files()}>
          <div class="display:flex gap:8px margin-bottom:8px">
            <For each={Array.from(props.files()!)}>
              {file => (
                <Show when={file.type.startsWith('image/')}>
                  <img
                    alt={file.name}
                    class="width:48px height:48px object-fit:cover border-radius:4px"
                    src={URL.createObjectURL(file)}
                  />
                </Show>
              )}
            </For>
          </div>
        </Show>

        <Show when={props.showExamples()}>
          <DropdownMenu
            onClickOutside={() => props.onExamplesToggle(false)}
            onMouseLeave={() => props.onExamplesToggle(false)}
            parentRef={props.examplesButtonRef!}
          >
            <div class="display:flex flex-direction:column gap:4px padding:8px">
              <For each={props.examples}>
                {example => (
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
