import { createContext, useContext } from 'solid-js';

import assert from '../../utils/assert';

interface FeedContextData {
  busy: boolean;
  contentID: string;
  focusNext: () => void;
  focusPrev: () => void;
  labelID: string;
  ownerID: string;
  size: number;
}

export const FeedContext = createContext<FeedContextData>();

export function useFeedContext(componentName: string): FeedContextData {
  const context = useContext(FeedContext);
  assert(context, new Error(`<${componentName}> must be used inside a <Feed>`));
  return context;
}
