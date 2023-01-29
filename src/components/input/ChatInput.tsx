import { createSignal, JSX } from "solid-js";
import { throttle, debounce } from "lodash";
import { TextareaField } from "../../UI/core/form-textarea/src/TextareaField";
import { Ws } from "../../utils/ws_events_dispatcher";

interface Properties {
  disabled?: boolean;
  onChange: JSX.EventHandler<HTMLTextAreaElement, Event>;
  // isSaving?: boolean
  required?: boolean;
  value: string;
  error?: string;
  placeholder?: string;
  label?: string;
  props?: {};
  dom?: HTMLTextAreaElement;
  class?: string;
}

export const ChatInput = (props: Properties) => {
  const typingEvent = [...props.field.options.typing_event];
  typingEvent.push(Ws.uid);

  const [editing, setEditing] = createSignal(false);
  const [typing, setTyping] = createSignal(false);
  const [paused, setPaused] = createSignal(false);
  const [composing, setComposing] = createSignal(false);

  const sendTypingEvent = throttle(() => {
    Ws.trigger([[typingEvent, { ...props.field.container().state.options.optionsState.fetchConfig }]]);
  }, 400);
  const handleKeyDown = (e) => {
    const arrowKeys = {
      37: true, // left
      38: true, // up
      39: true, // right
      40: true, // down
    };

    if (e.which === 13 && !e.shiftKey) {
      // this.sendChat();
      e.preventDefault();
    } else if (e.which === 38 && props.field.value === "") {
      // const prev = this._previousMessage();
      // if (prev) {
      //   setEditing(true);
      //   setComposing(true);
      //   props.field.value = prev.body;
      //   this.prevMessageID = prev.id;
      // } else {
      //   setEditing(false);
      //   this.prevMessageID = undefined;
      // }

      e.preventDefault();
    } else if (e.which === 40 && editing()) {
      // setEditing(false);
      e.preventDefault();
    } else if (!arrowKeys[e.which] && !e.ctrlKey && !e.metaKey && (!typing() || paused())) {
      // setTyping(true);
      // setPaused(false);
      // this.sendChatState('composing');
      sendTypingEvent();
    }
  };
  const handleKeyUp = () => {
    // this.resizeInput();
    // if (this.typing && this.chatInput.value.length === 0) {
    //   this.typing = false;
    //   this.sendChatState('active');
    // } else if (this.typing) {
    //   this.handlePausedTyping();
    // }
  };

  return (
    <>
      <TextareaField
        inputId={props.field.id}
        label={props.field.label || ""}
        value={props.field.value as string}
        onChange={props.onChange}
        onBlur={props.field.onBlur}
        onFocus={props.field.onFocus}
        required={props.field.isRequired}
        disabled={props.disabled}
        error={props.field.error}
        isInvalid={props.field.error}
        props={props.field.options}
        inputAttrs={{ onKeyDown: handleKeyDown }}
      />
    </>
  );
};
