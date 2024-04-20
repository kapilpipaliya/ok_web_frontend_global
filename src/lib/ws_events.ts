import {batch, useContext} from 'solid-js';
import {getCookie, ServerEventsDispatcher, WsContext} from '~/utils/ws_events_dispatcher';

import {isAdmin} from '~/signals/common';
import {isObject} from "./Utils";
import {deleteEdge, updateEdgeId} from './Edge';
import {
    commitTransaction,
    EdgeMap,
    edgeOldIdToNewIdMap, GraphInterface,
    Id,
    isAllTxnProcessed,
    ProcessStatus,
    transactions,
    VertexMap,
    vertexOldIdToNewIdMap,
} from './graph';
import {deleteVertex, updateVertexId} from './Vertex';
import {reconcile, SetStoreFunction, Store} from "solid-js/store";

export const setGraphData = (graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, args: {
    timestamp: number;
    vertexes: VertexMap;
    vertexLabelIdMap: { [key: string]: Id[] };
    edges: EdgeMap;
    deleted_vertexes: string[];
    deleted_edges: string[];
}) => {
    batch(() => {

        if (args.timestamp) {
            setGraph('lastSyncedTime', args.timestamp);
        }
        // let start = Date.now();
        // for (const v of args.vertexes || []) {
        //  addNewVertexUnSafe(v);
        // }
        // faster:
        // calculating shapes takes two seconds, this should be done on server if possible.
        // const vertexes = {} as VertexMap;
        // const vertexLabelIdMap = {} as { [key: string]: Id[] };
        //  for (const v of args.vertexes || []) {
        //   vertexes[v.id] = v;
        //   for (const label of v.L) {
        //    if (!vertexLabelIdMap[label]) vertexLabelIdMap[label] = [v.id];
        //    else
        //     vertexLabelIdMap[label] = [...vertexLabelIdMap[label], v.id];
        //    }
        //  }
        // fastest:

        // let timeTaken = Date.now() - start;
        // console.log("Total time taken : " + timeTaken + " milliseconds");

        // for (const e of args.edges || []) {
        //  addNewEdgeUnSafe(e);
        // }

        // timeTaken = Date.now() - start;
        // console.log("Total time taken : " + timeTaken + " milliseconds");

        for (const vertexId in args.vertexes) {
            setGraph('vertexes', vertexId, args.vertexes[vertexId]);
        }

        for (const label in args.vertexLabelIdMap) {
            setGraph('vertexLabelIdMap', label, (vertexIds) => {
                return Array.isArray(vertexIds)
                    ? [
                        ...new Set([
                            ...vertexIds,
                            ...args.vertexLabelIdMap[label],
                        ]),
                    ]
                    : args.vertexLabelIdMap[label];
            });
        }

        for (const edgeId in args.edges) {
            setGraph('edges', edgeId, args.edges[edgeId]);
        }

        for (const edgeId in args.edges) {
            const edge = args.edges[edgeId];
            try {
                setGraph('vertexes', edge.S, 'OUT', edge.T, (out_edges) =>
                    Array.isArray(out_edges)
                        ? [...new Set([...out_edges, edge.id])]
                        : [edge.id]
                );
            } catch (e) {
                debugger;
            }

            try {
                setGraph('vertexes', edge.E, 'IN', edge.T, (in_edges) =>
                    Array.isArray(in_edges)
                        ? [...new Set([...in_edges, edge.id])]
                        : [edge.id]
                );
            } catch (e) {
                debugger;
            }
        }
        // timeTaken = Date.now() - start;
        // console.log("Total time taken : " + timeTaken + " milliseconds");

        for (const edgeId of args.deleted_edges || []) {
            deleteEdge(0, parseInt(edgeId), graph, setGraph);
        }
        for (const vertexId of args.deleted_vertexes || []) {
            deleteVertex(0, parseInt(vertexId), graph, setGraph);
        }
        setGraph('initialSynced', reconcile(true));
    });
};
export const onMutatDataGet = (Ws: ServerEventsDispatcher, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>, d: [
                                   number,
                                   {
                                       [key in | 'insert'
                                       | 'replace'
                                       | 'deleteVertex'
                                       | 'insertEdge'
                                       | 'replaceEdge'
                                       | 'replaceEdgeStart'
                                       | 'replaceEdgeEnd'
                                       | 'deleteEdge']?: any;
                                   }[]
                               ][]
) => {
    console.log('asd', d)
    if (isObject(d) && d.ack) {
        if (Array.isArray(d.txnIds)) {
            for (const txnId of d.txnIds as number[]) {
                // what if ack is not received?
                if (transactions.has(txnId))
                    transactions.get(txnId)!.status =
                        ProcessStatus.AckReceived;
            }
        }
    }
    batch(() => {
        if (Array.isArray(d)) {
            for (const [txnId, txnResult] of d) {
                if (transactions.has(txnId))
                    transactions.get(txnId)!.status =
                        ProcessStatus.Processed;
                for (const txnObject of txnResult) {
                    // Vertexes and edges are interlinked.
                    // It's complicated to insert replace without error.
                    // When saving Form with Select field, table is giving error.
                    if (txnObject.insert) {
                        vertexOldIdToNewIdMap.set(
                            txnObject.insert[0],
                            txnObject.insert[1]
                        );
                        updateVertexId(
                            txnObject.insert[0],
                            txnObject.insert[1], graph, setGraph
                        );
                    }
                    if (txnObject.insertEdge) {
                        edgeOldIdToNewIdMap.set(
                            txnObject.insertEdge[0],
                            txnObject.insertEdge[1]
                        );
                        updateEdgeId(
                            txnObject.insertEdge[0],
                            txnObject.insertEdge[1], graph, setGraph
                        );
                    }
                    if (txnObject.replace) {
                        // TODO: handle on backend
                        // replaceVertexProperties(0, txnObject.insert[0], txnObject.insert[1]);
                    }
                    if (txnObject.deleteVertex) {
                        if (txnObject.deleteVertex.error) {
                            alert(txnObject.deleteVertex.message);
                        }
                        // TODO: handle on backend
                        // deleteVertex(0, txnObject.insert[0]);
                    }
                    if (txnObject.replaceEdge) {
                        // TODO: handle on backend
                        // replaceEdgeProperties(0, txnObject.insert[0], txnObject.insert[1]);
                    }
                    // if(txnObject.replaceEdgeStart){
                    //  replaceEdgeStart(0, txnObject.insert[0], txnObject.insert[1]);
                    // }
                    // if(txnObject.replaceEdgeEnd){
                    //  replaceEdgeEnd(0, txnObject.insert[0], txnObject.insert[1]);
                    // }
                    if (txnObject.deleteEdge) {
                        // TODO: handle on backend
                        // deleteEdge(0, txnObject.insert[0]);
                    }
                }
            }
        }

        if (isAllTxnProcessed()) {
            vertexOldIdToNewIdMap.clear();
            edgeOldIdToNewIdMap.clear();
        } else commitTransaction(Ws);
    });
}
export const syncEvent = (graph: Store<GraphInterface>, setGraph: SetStoreFunction<GraphInterface>) => {
    const {Ws} = useContext(WsContext);
    Ws.bind(
        ['post', 'mutate', 0],
        onMutatDataGet);


    Ws.bind(['get', 'sync', 0], setGraphData);
    Ws.bind(['post', 'loginJwt', 0], (d) => {
        if (!d?.error) {
            setGraph('member', d);
        }
        Ws.trigger([
            [
                ['get', 'sync', 0],
                {
                    admin: isAdmin() ? true : undefined,
                    from: graph.lastSyncedTime && graph.lastSyncedTime - 4000, // TODO fix time
                    // subscriptions: this.subscriptions,
                    subscriptions: [],
                },
            ],
        ]);
    });

    Ws.bind(['get', 'member', 0], (d) => {
        setGraph('member', d);
        // we sync after member is received.
        // TODO: We dont need fresh sync but from last timestamp sync
        if (!d) {
            Ws.trigger([
                [
                    ['post', 'loginJwt', 0],
                    {
                        jwt: getCookie('jwt'),
                    },
                ],
            ]);
        } else {
            Ws.trigger([
                [
                    ['get', 'sync', 0],
                    {
                        admin: isAdmin() ? true : undefined,
                        from:
                            graph.lastSyncedTime && graph.lastSyncedTime - 4000, // TODO fix time
                        // subscriptions: this.subscriptions,
                        subscriptions: [],
                    },
                ],
            ]);
        }
    });
};
