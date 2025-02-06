
import type { Vertex } from '~/lib/graph/graph';

import { IconButton } from '~/components/styled/IconButton';
import { headerIconButtonClass } from '~/pages/admin_layout/constant';

import type { DBMessage } from './types';

import { Preview } from './Preview';

interface ChatResponseProps {
  disabled?: boolean;
  insertMode: () => 'after' | 'before' | 'center';
  message: Vertex<DBMessage>;
  onDelete: (message: Vertex) => void;
  onInsert: (message: Vertex) => void;
  setInsertMode: (mode: 'after' | 'before' | 'center') => void;
}

export function ChatResponse(props: ChatResponseProps) {
  return (
    <div class="padding:12px background:white border:1px|solid|rgb(229,231,235) border-radius:6px">
      <div class="font-weight:500 margin-bottom:4px">Response:</div>
      <div class="white-space:pre-wrap">{props.message.P.response}</div>

      <div class="margin-top:16px border-top:1px|solid|rgb(229,231,235) padding-top:16px">
        <div class="font-weight:500 margin-bottom:8px">Preview:</div>
        <div class="border:1px|dashed|rgb(209,213,219) padding:16px border-radius:6px min-height:100px">
          <Preview 
            formId={`${props.message.id}FormStore`} 
            object={JSON.parse(props.message.P.data || '{}')} 
          />
        </div>

        <div class="display:flex gap:8px margin-top:12px justify-content:space-between">
          <div class="display:flex gap:8px">
            <select
              class="padding:8px border:1px|solid|rgb(209,213,219) border-radius:6px"
              onChange={(e) => props.setInsertMode(e.currentTarget.value as any)}
              value={props.insertMode()}
            >
              <option value="before">Insert Before</option>
              <option value="after">Insert After</option>
              <option value="center">Insert Into</option>
            </select>

            <IconButton
              class={headerIconButtonClass}
              disabled={props.disabled}
              icon="ph:plus-circle"
              onClick={() => props.onInsert(props.message)}
              title="Insert"
            />
          </div>

          <IconButton
            class={`${headerIconButtonClass} color:rgb(239,68,68)`}
            icon="ph:trash"
            onClick={() => props.onDelete(props.message)}
            title="Delete"
          />
        </div>
      </div>
    </div>
  );
} 