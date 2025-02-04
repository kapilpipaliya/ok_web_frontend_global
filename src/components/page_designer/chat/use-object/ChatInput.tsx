import { Show, For, JSX, createSignal } from 'solid-js';
import { IconButton } from '~/components/styled/IconButton';
import { DropdownMenu } from '~/components/styled/DropdownMenu';

interface ChatInputProps {
  input: () => string;
  isLoading: () => boolean;
  files: () => FileList | undefined;
  showExamples: () => boolean;
  examples: string[];
  onSubmit: (e: SubmitEvent, model: string) => void;
  onInputChange: JSX.ChangeEventHandlerUnion<HTMLInputElement | HTMLTextAreaElement, Event>;
  onFilesChange: (files: FileList | undefined) => void;
  onExamplesToggle: (show: boolean) => void;
  onExampleClick: (example: string) => void;
  fileInputRef: HTMLInputElement | undefined;
  examplesButtonRef: HTMLButtonElement | undefined;
}

export function ChatInput(props: ChatInputProps) {
  const [selectedModel, setSelectedModel] = createSignal<string>('gpt-4-turbo');

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

  return (
    <form
      onSubmit={handleSubmit}
      class="background:white border-top:1px|solid|rgb(229,231,235)"
    >
      <div class="display:flex flex-direction:column gap:8px">
        <select
          value={selectedModel()}
          onChange={(e) => setSelectedModel(e.currentTarget.value)}
          class="padding:8px border:1px|solid|rgb(209,213,219) border-radius:6px width:fit-content"
          disabled={props.isLoading()}
        >
          <For each={models}>
            {model => (
              <option value={model}>{model}</option>
            )}
          </For>
        </select>

        <div class="display:flex gap:8px">
          <textarea
            class="flex:1 padding:8px border:1px|solid|rgb(209,213,219) border-radius:6px disabled:opacity:50 disabled:cursor:not-allowed min-height:40px resize:vertical"
            value={props.input()}
            disabled={props.isLoading()}
            placeholder="Generate a page... (Press Cmd+Enter to submit)"
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
          />
          <IconButton
            icon="ph:list"
            onClick={() => props.onExamplesToggle(!props.showExamples())}
            disabled={props.isLoading()}
            ref={props.examplesButtonRef}
            title="Show Examples"
            size={22}
          />
          <IconButton
            type="submit"
            icon="ph:paper-plane-right"
            disabled={props.isLoading() || !props.input().trim()}
            title="Submit"
            size={22}
            class="cursor:pointer cursor:not-allowed:disabled"
          />
        </div>

        <div class="display:flex gap:8px">
          <input
            type="file"
            onChange={e => props.onFilesChange(e.currentTarget.files ?? undefined)}
            multiple
            ref={props.fileInputRef}
            class="flex:1 cursor:pointer"
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
              title="Clear files"
              size={22}
            />
          </Show>
        </div>

        <Show when={props.files()}>
          <div class="display:flex gap:8px margin-bottom:8px">
            <For each={Array.from(props.files()!)}>
              {file => (
                <Show when={file.type.startsWith('image/')}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    class="width:48px height:48px object-fit:cover border-radius:4px"
                  />
                </Show>
              )}
            </For>
          </div>
        </Show>

        <Show when={props.showExamples()}>
          <DropdownMenu
            parentRef={props.examplesButtonRef!}
            onClickOutside={() => props.onExamplesToggle(false)}
            onMouseLeave={() => props.onExamplesToggle(false)}
          >
            <div class="display:flex flex-direction:column gap:4px padding:8px">
              <For each={props.examples}>
                {example => (
                  <button
                    type="button"
                    class="text-align:left padding:8px background:rgb(243,244,246) border-radius:6px hover:background:rgb(229,231,235)"
                    onClick={() => props.onExampleClick(example)}
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