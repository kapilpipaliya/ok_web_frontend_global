import  { useContext, createMemo, JSXElement, Show } from 'solid-js';

import { EventHandlerContext } from './EventContext';
import { RenderEditorIndicator } from './RenderEditorIndicator';

import { EditorContext } from '../editor/EditorContext';

type EventsProps = {
  children?: JSXElement;
};

export const Events = (props: EventsProps) => {
  const store = useContext(EditorContext);

  const handler = createMemo(() => store.query.getOptions().handlers(store), [
    store,
  ]);

  return (
    <Show when={handler}>
      <EventHandlerContext.Provider value={handler()}>
        <RenderEditorIndicator />
        {props.children}
      </EventHandlerContext.Provider>
    </Show>
    
  );
};
