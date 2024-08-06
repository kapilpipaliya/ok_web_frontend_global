import type { JSX } from 'solid-js';

import { createComponent, createUniqueId, mergeProps } from 'solid-js';
import { omitProps } from 'solid-use/props';

import type {
  DynamicProps,
  HeadlessPropsWithRef,
  ValidConstructor,
} from '../../utils/dynamic-prop';

import createDynamic from '../../utils/create-dynamic';
import { createForwardRef } from '../../utils/dynamic-prop';
import { focusNext, focusPrev } from '../../utils/focus-navigation';
import getFocusableElements from '../../utils/focus-query';
import { FeedContext } from './FeedContext';
import { FEED_TAG } from './tags';

export interface FeedBaseProps {
  busy?: boolean;
  size: number;
}

export type FeedProps<T extends ValidConstructor = 'div'> =
  HeadlessPropsWithRef<T, FeedBaseProps>;

export function Feed<T extends ValidConstructor = 'div'>(
  props: FeedProps<T>,
): JSX.Element {
  const ownerID = createUniqueId();
  const labelID = createUniqueId();
  const contentID = createUniqueId();

  const [ref, setRef] = createForwardRef(props);

  return createComponent(FeedContext.Provider, {
    get children() {
      return createDynamic(
        () => props.as || ('div' as T),
        mergeProps(omitProps(props, ['as', 'busy', 'size']), FEED_TAG, {
          id: ownerID,
          ref: setRef,
        }) as DynamicProps<T>,
      );
    },
    value: {
      get busy() {
        return !!props.busy;
      },
      contentID,
      focusNext() {
        const current = ref();
        if (current instanceof HTMLElement) {
          focusNext(
            getFocusableElements(document.documentElement),
            current,
            false,
            false,
          );
        }
      },
      focusPrev() {
        const current = ref();
        if (current instanceof HTMLElement) {
          focusPrev(
            getFocusableElements(document.documentElement),
            current,
            false,
            false,
          );
        }
      },
      labelID,
      ownerID,
      get size() {
        return props.size;
      },
    },
  });
}
