import neo4j from 'neo4j-driver';

interface Json {
    [key: string]: any;
}

interface NodeValidationResult {
    error: string;
}

function jsonToMemGraphQueryObject(json: Json): string {
    let result = '{ '
    const keys = Object.keys(json)
    for (let i = 0; i < keys.length; i++) {
        result += `${keys[i]}: ${json[keys[i]]},`
    }
    if (keys.length > 0) {
        result = result.slice(0, -1);
    }

    result += ' }'
    return result;
}

const txnId = 0;
const vertexIdMap = 1;
const edgeIdMap = 2;
const transactions = 3;


function isProperNodeFormat(node: Json): NodeValidationResult | null {
    if (typeof node !== 'object' || node === null || Array.isArray(node)) {
        return { error: "Node must be an object" };
    }
    if (!('L' in node) || !Array.isArray(node.L) || node.L.length < 1) {
        return { error: "Node must contain L (labels) which must be an array with at least one item" };
    }
    if (node.L.some((label: any) => typeof label !== 'string')) {
        return { error: "Each label in node L must be a string" };
    }
    if (!('P' in node) || typeof node.P !== 'object' || Array.isArray(node.P)) {
        return { error: "Node must have P (properties) which must be an object" };
    }
    if (!('id' in node)) {
        return { error: "Node must have an 'id' key" };
    }
    return null;
}

interface Edge {
    T?: string;
    S?: number;
    E?: number;
    P?: Record<string, any>;
    id?: any;
}

function isProperEdgeFormat(edge: Edge): string {
    if (typeof edge !== 'object' || edge === null || Array.isArray(edge)) {
        return "edge must be an object";
    }
    if (edge.T === undefined || typeof edge.T !== 'string') {
        return "edge must contain T (type) and it must be a string.";
    }
    if (edge.S === undefined || typeof edge.S !== 'number') {
        return "edge must contain S (start) and it must be an integer.";
    }
    if (edge.E === undefined || typeof edge.E !== 'number') {
        return "edge must contain E (end) and it must be an integer.";
    }
    if (edge.P === undefined || typeof edge.P !== 'object' || Array.isArray(edge.P)) {
        return "edge must have P (properties) key and it must be an object";
    }
    if (edge.id === undefined) {
        return "edge must have id key";
    }
    return "";
}

interface WsEvent {
    // Define the structure of WsEvent based on your needs
}

interface WsArguments {
    // This should define the structure of the arguments that come into the function
}

function mutateArgsValidation(event: WsEvent, args: any[]): any {
    let responseResult = [];

    if (!Array.isArray(args)) {
        return addFailure(responseResult, event, "Invalid argument shape, the argument to sync(mutate) must be an array");
    }

    for (let txns of args) {
        if (!Array.isArray(txns)) {
            return addFailure(responseResult, event, "Invalid argument shape, the inner argument to sync(mutate) must be an array");
        }
        if (txns.length !== 4) {
            return addFailure(responseResult, event,
                "Invalid argument shape, the inner argument to sync(mutate) must be an array and it should contain 4 elements: first-txnId, second-vertexIdMap, third-EdgeIdMap, fourth-The transactions.");
        }
        if (!Array.isArray(txns[1]) || !Array.isArray(txns[2])) { // Assuming these indexes correspond to vertexIdMap and edgeIdMap
            return addFailure(responseResult, event,
                "Invalid argument shape, the inner argument to sync(mutate) must be an array and it should contain 4 elements. vertexIdMap and EdgeIdMap each item is [num, num] tuple");
        }
        for (let idmap of txns[1]) { // Assuming index 1 is vertexIdMap
            if (idmap.length !== 2 || typeof idmap[0] !== 'number' || typeof idmap[1] !== 'number') {
                return addFailure(responseResult, event, "Invalid argument shape, vertexIdMap and EdgeIdMap each item is [num, num] tuple");
            }
        }
        for (let idmap of txns[2]) { // Assuming index 2 is edgeIdMap
            if (idmap.length !== 2 || typeof idmap[0] !== 'number' || typeof idmap[1] !== 'number') {
                return addFailure(responseResult, event, "Invalid argument shape, vertexIdMap and EdgeIdMap each item is [num, num] tuple");
            }
        }
        for (let mutationObject of txns[3]) { // Assuming index 3 is the transactions array
            const mutationTypes = ["insert", "replace", "merge", "deleteVertex"];
            const edgeMutationTypes = ["insertEdge", "replaceEdge", "replaceEdgeStart", "replaceEdgeEnd", "deleteEdge"];

            for (let key of mutationTypes) {
                if (key in mutationObject && typeof mutationObject[key] !== 'object') {
                    return addFailure(responseResult, event, `${key} shape must be an object`);
                }
                if (key in mutationObject) {
                    let err = isProperNodeFormat(mutationObject[key]);
                    if (err) {
                        return addFailure(responseResult, event, `${key} ${err}`);
                    }
                }
            }
            for (let key of edgeMutationTypes) {
                if (key in mutationObject && typeof mutationObject[key] !== 'object') {
                    return addFailure(responseResult, event, `${key} shape must be an object`);
                }
                if (key in mutationObject) {
                    let err = isProperEdgeFormat(mutationObject[key]);
                    if (err) {
                        return addFailure(responseResult, event, `${key} ${err}`);
                    }
                }
            }
        }
    }

    return responseResult;
}

function addFailure(response: any, event: WsEvent, message: string): any {
    // Assuming you have a function to log or handle failures
    console.error(message);
    response.errors = response.errors || [];
    response.errors.push({ event, message });
    return response;
}


import { Session } from 'neo4j-driver';

interface WsEvent {
    // Define based on usage
}

interface WsArguments {
    // Define based on usage
}

function mutateData(
    event: WsEvent,
    args: any[],
    mgClient: Session,
    session: any
): Promise<any> {
    const clientToServerVertexIdMap = new Map<number, number>();
    const clientToServerEdgeIdMap = new Map<number, number>();
    const responseResult = [];

    const validationResult = mutateArgsValidation(event, args);
    if (Object.keys(validationResult).length > 0) {
        return Promise.resolve(validationResult);
    }

    const resultTxn = [];
    return mgClient.writeTransaction(async (transaction) => {
        for (const txns of args) {
            for (const [oldId, newId] of txns.vertexIdMap) {
                clientToServerVertexIdMap.set(oldId, newId);
            }
            for (const [oldId, newId] of txns.edgeIdMap) {
                clientToServerEdgeIdMap.set(oldId, newId);
            }

            const txnResult = [];
            for (const mutationObject of txns.transactions) {
                if (mutationObject.insert) {
                    const labels = mutationObject.insert.L.map(label => `:${label}`).join('');
                    const properties = jsonToMemGraphQueryObject(mutationObject.insert.P);
                    const query = `CREATE (n${labels} ${properties}) RETURN n`;

                    try {
                        const result = await transaction.run(query);
                        if (result.records.length > 0) {
                            const id = result.records[0].get('n').identity.toInt();
                            const oldId = mutationObject.insert.id;
                            clientToServerVertexIdMap.set(oldId, id);
                            txnResult.push({ insert: [oldId, id] });
                        }
                    } catch (error) {
                        console.error('Failed to execute insert query:', error);
                        throw new Error(`Can't insert due to an internal server error: ${error}`);
                    }
                }

                // Implementations for 'merge', 'deleteVertex', 'insertEdge', etc., would follow the same pattern

                // Example for 'merge' operation
                if (mutationObject.merge) {
                    const id = clientToServerVertexIdMap.get(mutationObject.merge.id) || mutationObject.merge.id;
                    const properties = jsonToMemGraphQueryObject(mutationObject.merge.P);
                    const query = `MATCH (n) WHERE ID(n) = ${id} SET n += ${properties} RETURN n`;

                    try {
                        const result = await transaction.run(query);
                        txnResult.push({ merge: { id, success: true } });
                    } catch (error) {
                        console.error('Failed to execute merge query:', error);
                        throw new Error(`Can't merge due to an internal server error: ${error}`);
                    }
                }

                // Example for 'deleteVertex' operation
                if (mutationObject.deleteVertex) {
                    const id = clientToServerVertexIdMap.get(mutationObject.deleteVertex.id) || mutationObject.deleteVertex.id;
                    const query = `MATCH (n) WHERE ID(n) = ${id} DELETE n`;

                    try {
                        await transaction.run(query);
                        txnResult.push({ deleteVertex: { id, success: true } });
                    } catch (error) {
                        console.error('Failed to execute delete vertex query:', error);
                        throw new Error(`Can't delete vertex due to an internal server error: ${error}`);
                    }
                }

                // Example for 'insertEdge' operation
                if (mutationObject.insertEdge) {
                    const startId = clientToServerVertexIdMap.get(mutationObject.insertEdge.S) || mutationObject.insertEdge.S;
                    const endId = clientToServerVertexIdMap.get(mutationObject.insertEdge.E) || mutationObject.insertEdge.E;
                    const properties = jsonToMemGraphQueryObject(mutationObject.insertEdge.P);
                    const type = mutationObject.insertEdge.T;
                    const query = `MATCH (a), (b) WHERE ID(a) = ${startId} AND ID(b) = ${endId} CREATE (a)-[r:${type} ${properties}]->(b) RETURN r`;

                    try {
                        const result = await transaction.run(query);
                        if (result.records.length > 0) {
                            const edgeId = result.records[0].get('r').identity.toInt();
                            clientToServerEdgeIdMap.set(mutationObject.insertEdge.id, edgeId);
                            txnResult.push({ insertEdge: { id: edgeId, success: true } });
                        }
                    } catch (error) {
                        console.error('Failed to execute insert edge query:', error);
                        throw new Error(`Can't insert edge due to an internal server error: ${error}`);
                    }
                }


            }
            resultTxn.push({ txnId: txns.txnId, results: txnResult });
        }
        return addEventAndJson(responseResult, event, resultTxn);
    }).catch((error) => {
        console.error('Transaction failed:', error);
        return addFailure(responseResult, event, `Transaction failed due to error: ${error.message}`);
    });
}


function addEventAndJson(response: any, event: WsEvent, result: any): any {
    // Modify the response object to include the event and result
    response.event = event;
    response.result = result;
    return response;
}
