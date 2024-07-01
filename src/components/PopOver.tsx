import type { JSX } from 'solid-js';

import { Popover } from '@kobalte/core/popover';

export function CustomPopover(props: Readonly<{
  children: JSX.Element;
  description?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title?: string;
  trigger: JSX.Element;
}>) {
  return (
    <Popover onOpenChange={props.setIsOpen} open={props.isOpen} placement='right'>
      <Popover.Trigger>
        <div onMouseEnter={() => {
          props.setIsOpen(true)
        }}>
          {props.trigger}
        </div>
      </Popover.Trigger>
      <Popover.Content style={{
        'background-color': 'white',
        border: '1px solid #e5e7eb'
        ,
        'border-radius': '0.25rem',
        "max-height": '90vh',
        "max-width": '90vw',
        overflow: 'auto',
        width: '50vw',
        "z-index": 10
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
          onClick={() => props.setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            'font-size': '1.5rem',
            'line-height': 1,
            'margin-right': '0.25rem',
            'margin-top': '0.25rem',
            position: 'absolute',
            right: '1rem',
            top: '1rem',
          }}
        > &times;
        </button>
      </Popover.Content>
    </Popover>
  );
}
