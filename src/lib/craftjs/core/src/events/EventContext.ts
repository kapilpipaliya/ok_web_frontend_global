import { createContext, useContext } from 'solid-js';

import { CoreEventHandlers } from './CoreEventHandlers';

export const EventHandlerContext = createContext<CoreEventHandlers>(null);

export const useEventHandler = () => useContext(EventHandlerContext);
