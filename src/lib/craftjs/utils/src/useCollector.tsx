import { createEffect, createSignal, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';

// Assuming SubscriberAndCallbacksFor and ConditionallyMergeRecordTypes types are adapted or directly usable
import { SubscriberAndCallbacksFor } from './useMethods';
import { ConditionallyMergeRecordTypes } from './utilityTypes';

type CollectorMethods<S extends SubscriberAndCallbacksFor<any, any>> = {
  actions: S['actions'];
  query: S['query'];
};

export type useCollectorReturnType<
  S extends SubscriberAndCallbacksFor<any, any>,
  C = null
> = ConditionallyMergeRecordTypes<C, CollectorMethods<S>>;
export function useCollector<S extends SubscriberAndCallbacksFor<any, any>, C>(
  store: S,
  collector?: (
    state: ReturnType<S['getState']>['current'],
    query: S['query']
  ) => C
): useCollectorReturnType<S, C> {
  const { subscribe, getState, actions, query } = store;

  // Initial state setup
  let collected = collector ? collector(getState(), query) : null;
  const [renderCollected, setRenderCollected] = createStore({
    ...collected,
    actions,
    query,
  });

  // Effect for subscription and cleanup
  createEffect(() => {
    const unsubscribe = subscribe(
      (current) => {
        const newCollected = collector ? collector(current, query) : null;
        setRenderCollected({ ...newCollected, actions, query });
      }
    );

    onCleanup(() => {
      if (unsubscribe) unsubscribe();
    });
  });

  return renderCollected;
}
