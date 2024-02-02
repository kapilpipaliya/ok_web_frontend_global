import {
	ERROR_USE_EDITOR_OUTSIDE_OF_EDITOR_CONTEXT,
	EventHandlerConnectors,
	QueryCallbacksFor,
	useCollector,
	useCollectorReturnType,
	wrapConnectorHooks,
} from '@craftjs/utils/src';
import {
	JSXElement,
	createEffect,
	createMemo,
	onCleanup,
	useContext,
} from 'solid-js';

import invariant from 'tiny-invariant';

import { EditorContext } from './EditorContext';
import { QueryMethods } from './query';
import { EditorStore } from './store';

import { CoreEventHandlers } from '../events/CoreEventHandlers';
import { useEventHandler } from '../events/EventContext';
import { EditorState } from '../interfaces';

export type EditorCollector<C> = (
	state: EditorState,
	query: QueryCallbacksFor<typeof QueryMethods>
) => C;

export type useInternalEditorReturnType<C = null> = useCollectorReturnType<
	EditorStore,
	C
> & {
	inContext: boolean;
	store: EditorStore;
	connectors: EventHandlerConnectors<CoreEventHandlers, JSXElement>;
};

export function useInternalEditor<C>(
	collector?: EditorCollector<C>
): useInternalEditorReturnType<C> {
	const handler = useEventHandler();
	const store = useContext(EditorContext);
	invariant(store, ERROR_USE_EDITOR_OUTSIDE_OF_EDITOR_CONTEXT);

	const collected = useCollector(store, collector);

	const connectorsUsage = createMemo(
		() => handler && handler.createConnectorsUsage()
	);

	createEffect(() => {
		connectorsUsage()?.register();

		onCleanup(() => {
			connectorsUsage()?.cleanup();
		});
	});

	const connectors = createMemo(
		() =>
			connectorsUsage() &&
			wrapConnectorHooks(connectorsUsage().connectors)
	);

	return {
		collected,
		connectors: connectors(),
		inContext: !!store,
		store,
	};
}
