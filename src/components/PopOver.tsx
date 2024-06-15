import { Popover } from '@kobalte/core/popover';
import { Component, createSignal, JSX } from 'solid-js';

export function CustomPopover(props: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  trigger: JSX.Element;
  children: JSX.Element;
  title?: string;
  description?: string;
}) {
  return (
    <Popover placement='right' open={props.isOpen} onOpenChange={props.setIsOpen}>
      <Popover.Trigger>
        <div onMouseEnter={() => {
          props.setIsOpen(true)
        }}>
          {props.trigger}
        </div>
      </Popover.Trigger>
      <Popover.Content style={{
        width: '50vw',
        "max-height": '90vh'
        ,
        "max-width": '90vw',
        'background-color': 'white',
        'border-radius': '0.25rem',
        border: '1px solid #e5e7eb',
        "z-index": 10,
        overflow: 'auto'
      }}>

        <div style={{padding: '1rem'}}>
          {props.title && (
            <h3 style={{'font-size': '1.125rem', 'font-weight': 700, 'margin-bottom': '0.5rem'}}>
              {props.title}
            </h3>
          )}
          {props.children}
        </div>
        <button
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            'margin-top': '0.25rem',
            'margin-right': '0.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            'font-size': '1.5rem',
            'line-height': 1,
          }}
          onClick={() => props.setIsOpen(false)}
        > &times;
        </button>
      </Popover.Content>
    </Popover>
  );
}
