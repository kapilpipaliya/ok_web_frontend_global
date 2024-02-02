import {
	Delete,
	PatchListenerAction,
	QueryCallbacksFor,
} from '@craftjs/utils/src';

import { Placement } from './events';
import { Node, NodeEventTypes, NodeId, Nodes } from './nodes';

import { Component, JSXElement } from 'solid-js';
import { QueryMethods } from '../editor/query';
import { ActionMethodsWithConfig, EditorStore } from '../editor/store';
import { useInternalEditorReturnType } from '../editor/useInternalEditor';
import { CoreEventHandlers } from '../events';

export type Options = {
	onRender: Component<{ render: JSXElement }>;
	onBeforeMoveEnd: (
		targetNode: Node,
		newParentNode: Node,
		existingParentNode: Node
	) => void;
	onNodesChange: (query: QueryCallbacksFor<typeof QueryMethods>) => void;
	resolver: Resolver;
	enabled: boolean;
	indicator: Partial<{
		success: string;
		error: string;
		transition: string;
		thickness: number;
	}>;
	handlers: (store: EditorStore) => CoreEventHandlers;
	normalizeNodes: (
		state: EditorState,
		previousState: EditorState,
		actionPerformed: Delete<
			PatchListenerAction<typeof ActionMethodsWithConfig>,
			'patches'
		>,
		query: QueryCallbacksFor<typeof QueryMethods>
	) => void;
};

export type Resolver = Record<string, string>;

export interface Indicator {
	placement: Placement;
	error: string | null;
}

export type EditorEvents = Record<NodeEventTypes, Set<NodeId>>;

export type EditorState = {
	nodes: Nodes;
	events: EditorEvents;
	options: Options;
	indicator: Indicator;
};

export type ConnectedEditor<S = null> = useInternalEditorReturnType<S>;
