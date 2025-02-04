import { Show, For, JSX } from 'solid-js';
import { IconButton } from '~/components/styled/IconButton';
import { DropdownMenu } from '~/components/styled/DropdownMenu';

interface ChatInputProps {
  input: () => string;
  isLoading: () => boolean;
  files: () => FileList | undefined;
  showExamples: () => boolean;
  examples: string[];
  onSubmit: (e: SubmitEvent) => void;
  onInputChange: JSX.ChangeEventHandlerUnion<HTMLInputElement | HTMLTextAreaElement, Event>;
  onFilesChange: (files: FileList | undefined) => void;
  onExamplesToggle: (show: boolean) => void;
  onExampleClick: (example: string) => void;
  fileInputRef: HTMLInputElement | undefined;
  examplesButtonRef: HTMLButtonElement | undefined;
}

export function ChatInput(props: ChatInputProps) {
  return (
    <form
      onSubmit={props.onSubmit}
      class="padding:16px background:white border-top:1px|solid|rgb(229,231,235)"
    >
      <div class="display:flex flex-direction:column gap:8px">
        <div class="display:flex gap:8px">
          <input
            type="file"
            onChange={e => props.onFilesChange(e.currentTarget.files ?? undefined)}
            multiple
            ref={props.fileInputRef}
            class="flex:1"
          />
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

        <div class="display:flex gap:8px">
          <input
            class="flex:1 padding:8px border:1px|solid|rgb(209,213,219) border-radius:6px disabled:opacity:50 disabled:cursor:not-allowed"
            value={props.input()}
            disabled={props.isLoading()}
            placeholder="Generate a page... (Press Cmd+Enter to submit)"
            onChange={props.onInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !props.isLoading()) {
                props.onSubmit(e as any);
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
          />
        </div>

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