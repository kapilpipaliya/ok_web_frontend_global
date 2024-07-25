import { type Component, createMemo, onMount } from 'solid-js';

import type { ToastContainerProps } from '../';

import { defaultToastOptions, dispatch } from '../core';
import { ActionType, resolveValue } from '../types';
import { getToastWrapperStyles, getWrapperYAxisOffset, updateToastHeight } from '../util';
import { ToastBar } from './ToastBar';

export const ToastContainer: Component<ToastContainerProps> = (props) => {
  const calculatePosition = () => {
    const position = props.toast.position || defaultToastOptions.position;
    const offset = getWrapperYAxisOffset(props.toast, position);
    const positionStyle = getToastWrapperStyles(position, offset);

    return positionStyle;
  };

  const positionStyle = createMemo(() => calculatePosition());

  let el: HTMLDivElement | undefined;
  onMount(() => {
    if (el) {
      updateToastHeight(el, props.toast);
    }
  });

  return (
    <div
      class={props.toast.visible ? 'sldt-active' : ''}
      onMouseEnter={() =>
        dispatch({
          time: Date.now(),
          type: ActionType.START_PAUSE,
        })
      }
      onMouseLeave={() =>
        dispatch({
          time: Date.now(),
          type: ActionType.END_PAUSE,
        })
      }
      ref={el}
      style={positionStyle()}
    >
      {props.toast.type === 'custom' ? (
        resolveValue(props.toast.message, props.toast)
      ) : (
        <ToastBar position={props.toast.position || defaultToastOptions.position} toast={props.toast} />
      )}
    </div>
  );
};
