import type { Message } from "ai";

import { createSignal, For, type JSX, Match, Show, Switch } from "solid-js";

import { IconButton } from "~/components/styled/IconButton";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { TooltipWrapper } from "~/components/styled/modal/TooltipWrapper";
import { STYLES } from "~/pages/settings/constants";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

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
    e.preventDefault;
    props.onSubmit(e, selectedModel());
  };

  return (
    <As
      as="form"
      css={css`
  background: \${args.theme.var.color.base_10};
  border-top: 1px solid \${args.theme.var.color.base_16};
  padding: 4px;
  margin-bottom: 4px;
`}
      onSubmit={handleSubmit}
    >
      <As
        as="div"
        css={css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`}
      >
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
        <As
          as="div"
          css={css`
  display: flex;
  gap: 8px;
`}
        >
          <As
            as="textarea"
            css={css`
  display: flex;
  padding: 8px;
  border: 1px solid \${args.theme.var.color.base_16};
  border-radius: 6px;
  disabled: opacity;
  disabled: cursor;
  min-height: 40px;
  resize: vertical;
`}
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
            css={css`
              background-color: transparent;
              border: none;
            `}
            icon="ph:list"
            onClick={() => props.onExamplesToggle(!props.showExamples())}
            ref={props.examplesButtonRef}
            size={22}
            title="Show Examples"
          />
          <IconButton
            css={css`
              background-color: transparent;
              border: none;
              cursor: pointer;
            `}
            disabled={props.isLoading()}
            icon="ph:paper-plane-right"
            onClick={(e) => handleSubmit(e as any)}
            size={22}
            title="Submit"
            type="button"
          />
        </As>
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
            <As
              as="div"
              css={css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
`}
            >
              <For each={props.examples}>
                {(example) => (
                  <As
                    as="button"
                    css={css`
  text-align: left;
  padding: 8px;
  background: rgb(243,244,246);
  border-radius: 6px;
`}
                    onClick={() => props.onExampleClick(example)}
                    type="button"
                  >
                    {example}
                  </As>
                )}
              </For>
            </As>
          </DropdownMenu>
        </Show>
      </As>
    </As>
  );
}

function FileInput(props: {
  files: () => FileList | undefined;
  onFilesChange: (files: FileList | undefined) => void;
  ref: HTMLInputElement | undefined;
}) {
  return (
    <As
      as="div"
      css={css`
  display: flex;
  gap: 8px;
`}
    >
      <IconButton
        css={css`
          cursor: pointer;
          background-color: transparent;
          border: none;
        `}
        icon="ph:paperclip"
        onClick={() => props.ref?.click()}
        size={22}
        title="Select File"
      />
      <As
        as="input"
        css={css`
  display: none;
`}
        multiple
        onChange={(e) =>
          props.onFilesChange(e.currentTarget.files ?? undefined)
        }
        ref={props.ref}
        type="file"
      />
      <Show when={props.files()}>
        <As
          as="div"
          css={css`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`}
        >
          <For each={Array.from(props.files()!)}>
            {(file) => (
              <As
                as="div"
                css={css`
  position: relative;
`}
              >
                <Switch
                  fallback={
                    <As
                      as="div"
                      css={css`
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgb(243,244,246);
  border-radius: 4px;
`}
                    >
                      <As
                        as="span"
                        css={css`
  font-size: 24px;
`}
                      >
                        📄
                      </As>
                    </As>
                  }
                >
                  <Match when={file.type.startsWith("image/")}>
                    <As
                      as="img"
                      alt={file.name}
                      css={css`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
`}
                      src={URL.createObjectURL(file)}
                    />
                  </Match>
                  <Match when={file.type.startsWith("video/")}>
                    <As
                      as="video"
                      css={css`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
`}
                      src={URL.createObjectURL(file)}
                    />
                  </Match>
                  <Match when={file.type.startsWith("audio/")}>
                    <As
                      as="div"
                      css={css`
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgb(243,244,246);
  border-radius: 4px;
`}
                    >
                      <As
                        as="span"
                        css={css`
  font-size: 24px;
`}
                      >
                        🎵
                      </As>
                    </As>
                  </Match>
                </Switch>
                <IconButton
                  icon="ph:x-circle"
                  css={css`
                    background-color: transparent;
                    border: none;
                  `}
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
              </As>
            )}
          </For>
        </As>
      </Show>
    </As>
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
      <As
        as="div"
        css={css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`}
      >
        <TooltipWrapper
          arrowCss={STYLES.tooltip.arrowCss}
          content={
            <As
              as="div"
              css={[
                STYLES.overflowCss,
                STYLES.tooltip.contentCss,
                css`
  max-height: 600px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px;
`,
              ]}
            >
              <For each={props.chatMessages}>
                {(msg) => (
                  <>
                    <As
                      as="span"
                      css={css`
  font-weight: bold;
`}
                    >
                      {msg.role}:
                    </As>
                    <As
                      as="span"
                      css={css`
  white-space: pre-wrap;
`}
                    >
                      {msg.content}
                    </As>
                  </>
                )}
              </For>
            </As>
          }
          triggerCss={css`color:rgb(107,114,128);`}
        >
          <As
            as="span"
            css={css`
  color: rgb(107,114,128);
`}
          >
            Messages: {props.chatMessages.length}
          </As>
        </TooltipWrapper>
        <IconButton
          css={css`
            background-color: transparent;
            border: none;
          `}
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
            <As
              as="div"
              css={css`
  padding: 0.50rem;
`}
            >
              <As
                as="div"
                css={css`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`}
              >
                <As
                  as="div"
                  css={css`
  padding-left: 1rem; padding-right: 1rem;
  padding-top: 0.5rem; padding-bottom: 0.5rem;
`}
                >
                  Are you sure?
                </As>
                <As
                  as="button"
                  css={css`
  text-align: left;
  padding-left: 1rem; padding-right: 1rem;
  padding-top: 0.5rem; padding-bottom: 0.5rem;
  &:hover {
    background-color: \${args.theme.var.color.base_10};
  }
`}
                  onClick={() => {
                    props.onClearMessages();
                    setShowDeleteConfirm(false);
                  }}
                >
                  Yes, clear messages
                </As>
                <As
                  as="button"
                  css={css`
  text-align: left;
  padding-left: 1rem; padding-right: 1rem;
  padding-top: 0.5rem; padding-bottom: 0.5rem;
  &:hover {
    background-color: \${args.theme.var.color.base_10};
  }
`}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </As>
              </As>
            </As>
          </DropdownMenu>
        </Show>
      </As>
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
    <As
      as="select"
      css={css`
  padding: 8px;
  border: 1px solid \${args.theme.var.color.base_16};
  border-radius: 6px;
  width: fit-content;
`}
      disabled={props.isLoading()}
      onChange={(e) => props.setSelectedModel(e.currentTarget.value)}
      value={props.selectedModel()}
    >
      <For each={props.models}>
        {(model) => <option value={model}>{model}</option>}
      </For>
    </As>
  );
}
