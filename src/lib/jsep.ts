import jsep from 'jsep';
//import { eval as eval1} from 'expression-eval';
import {graph, IdAttr, Vertex} from "./graph";
import {path} from "rambda";
import {calculateFilter, getTextValue} from "./Traverse";
import {findVertexIdsByLabel} from "./Vertex";
import {G} from "@mobily/ts-belt";
import {jsonata} from "./jsonata/jsonata";

/**
 * Evaluation code from JSEP project, under MIT License.
 * Copyright (c) 2013 Stephen Oney, http://jsep.from.so/
 */

// Default operator precedence from https://github.com/EricSmekens/jsep/blob/master/src/jsep.js#L55
const DEFAULT_PRECEDENCE = {
    '||': 1,
    '&&': 2,
    '|': 3,
    '^': 4,
    '&': 5,
    '==': 6,
    '!=': 6,
    '===': 6,
    '!==': 6,
    '<': 7,
    '>': 7,
    '<=': 7,
    '>=': 7,
    '<<': 8,
    '>>': 8,
    '>>>': 8,
    '+': 9,
    '-': 9,
    '*': 10,
    '/': 10,
    '%': 10
};

const binops = {
    '||': function (a, b) { return a || b; },
    '&&': function (a, b) { return a && b; },
    '|': function (a, b) { return a | b; },
    '^': function (a, b) { return a ^ b; },
    '&': function (a, b) { return a & b; },
    '==': function (a, b) { return a == b; }, // jshint ignore:line
    '!=': function (a, b) { return a != b; }, // jshint ignore:line
    '===': function (a, b) { return a === b; },
    '!==': function (a, b) { return a !== b; },
    '<': function (a, b) { return a < b; },
    '>': function (a, b) { return a > b; },
    '<=': function (a, b) { return a <= b; },
    '>=': function (a, b) { return a >= b; },
    '<<': function (a, b) { return a << b; },
    '>>': function (a, b) { return a >> b; },
    '>>>': function (a, b) { return a >>> b; },
    '+': function (a, b) { return a + b; },
    '-': function (a, b) { return a - b; },
    '*': function (a, b) { return a * b; },
    '/': function (a, b) { return a / b; },
    '%': function (a, b) { return a % b; }
} as {[key: string]: (v1: any, v2: any)=>any};

const unops = {
    '-': function (a) { return -a; },
    '+': function (a) { return +a; },
    '~': function (a) { return ~a; },
    '!': function (a) { return !a; },
} as {[key: string]: (v: any, context: any)=>any};

declare type operand = number | string;
declare type unaryCallback = (a: operand) => operand;
declare type binaryCallback = (a: operand, b: operand) => operand;

type AnyExpression = jsep.ArrayExpression
    | jsep.BinaryExpression
    | jsep.MemberExpression
    | jsep.CallExpression
    | jsep.ConditionalExpression
    | jsep.Identifier
    | jsep.Literal
    | jsep.LogicalExpression
    | jsep.ThisExpression
    | jsep.UnaryExpression;

function evaluateArray(list, context) {
    return list.map(function (v) { return evaluate(v, context); });
}

async function evaluateArrayAsync(list, context) {
    const res = await Promise.all(list.map((v) => evalAsync(v, context)));
    return res;
}

function evaluateMember(node: jsep.MemberExpression, context: object) {
    const object = evaluate(node.object, context);
    let key: string;
    if (node.computed) {
        key = evaluate(node.property, context);
    } else {
        key = (node.property as jsep.Identifier).name;
    }
    if (/^__proto__|prototype|constructor$/.test(key)) {
        throw Error(`Access to member "${key}" disallowed.`);
    }
    return [object, object[key]];
}

async function evaluateMemberAsync(node: jsep.MemberExpression, context: object) {
    const object = await evalAsync(node.object, context);
    let key: string;
    if (node.computed) {
        key = await evalAsync(node.property, context);
    } else {
        key = (node.property as jsep.Identifier).name;
    }
    if (/^__proto__|prototype|constructor$/.test(key)) {
        throw Error(`Access to member "${key}" disallowed.`);
    }
    return [object, object[key]];
}

export function evaluate(_node: jsep.Expression, context: object) {

    const node = _node as AnyExpression;

    switch (node.type) {

        case 'ArrayExpression':
            return evaluateArray(node.elements, context);

        case 'BinaryExpression':
            return binops[node.operator](evaluate(node.left, context), evaluate(node.right, context));

        case 'CallExpression':
            let caller, fn, assign;
            if (node.callee.type === 'MemberExpression') {
                assign = evaluateMember(node.callee as jsep.MemberExpression, context);
                caller = assign[0];
                fn = assign[1];
            } else {
                fn = evaluate(node.callee, context);
            }
            if (typeof fn !== 'function') { return undefined; }
            return fn.apply(caller, evaluateArray(node.arguments, context));

        case 'ConditionalExpression':
            return evaluate(node.test, context)
                ? evaluate(node.consequent, context)
                : evaluate(node.alternate, context);

        case 'Identifier':
            // return context[node.name];
            return node.name;

        case 'Literal':
            return node.value;

        case 'LogicalExpression':
            if (node.operator === '||') {
                return evaluate(node.left, context) || evaluate(node.right, context);
            } else if (node.operator === '&&') {
                return evaluate(node.left, context) && evaluate(node.right, context);
            }
            return binops[node.operator](evaluate(node.left, context), evaluate(node.right, context));

        case 'MemberExpression':
            return evaluateMember(node, context)[1];

        case 'ThisExpression':
            return context;

        case 'UnaryExpression':
            return unops[node.operator](evaluate(node.argument, context), context);

        default:
            return undefined;
    }

}

export async function evalAsync(_node: jsep.Expression, context: object) {

    const node = _node as AnyExpression;

    // Brackets used for some case blocks here, to avoid edge cases related to variable hoisting.
    // See: https://stackoverflow.com/questions/57759348/const-and-let-variable-shadowing-in-a-switch-statement
    switch (node.type) {

        case 'ArrayExpression':
            return await evaluateArrayAsync(node.elements, context);

        case 'BinaryExpression': {
            const [left, right] = await Promise.all([
                evalAsync(node.left, context),
                evalAsync(node.right, context)
            ]);
            return binops[node.operator](left, right);
        }

        case 'CallExpression': {
            let caller, fn, assign;
            if (node.callee.type === 'MemberExpression') {
                assign = await evaluateMemberAsync(node.callee as jsep.MemberExpression, context);
                caller = assign[0];
                fn = assign[1];
            } else {
                fn = await evalAsync(node.callee, context);
            }
            if (typeof fn !== 'function') {
                return undefined;
            }
            return await fn.apply(
                caller,
                await evaluateArrayAsync(node.arguments, context)
            );
        }

        case 'ConditionalExpression':
            return (await evalAsync(node.test, context))
                ? await evalAsync(node.consequent, context)
                : await evalAsync(node.alternate, context);

        case 'Identifier':
            return context[node.name];

        case 'Literal':
            return node.value;

        case 'LogicalExpression': {
            if (node.operator === '||') {
                return (
                    (await evalAsync(node.left, context)) ||
                    (await evalAsync(node.right, context))
                );
            } else if (node.operator === '&&') {
                return (
                    (await evalAsync(node.left, context)) &&
                    (await evalAsync(node.right, context))
                );
            }

            const [left, right] = await Promise.all([
                evalAsync(node.left, context),
                evalAsync(node.right, context)
            ]);

            return binops[node.operator](left, right);
        }

        case 'MemberExpression':
            return (await evaluateMemberAsync(node, context))[1];

        case 'ThisExpression':
            return context;

        case 'UnaryExpression':
            return unops[node.operator](await evalAsync(node.argument, context));

        default:
            return undefined;
    }
}

export function compile(expression: string | jsep.Expression): (context: object) => any {
    return evaluate.bind(null, jsep(expression));
}

export function compileAsync(expression: string | jsep.Expression): (context: object) => Promise<any> {
    return evalAsync.bind(null, jsep(expression));
}

// Added functions to inject Custom Unary Operators (and override existing ones)
export function addUnaryOp(operator: string, _function: unaryCallback): void {
    jsep.addUnaryOp(operator);
    unops[operator] = _function;
}

// Added functions to inject Custom Binary Operators (and override existing ones)
export function addBinaryOp(operator: string, precedence_or_fn: number | binaryCallback, _function: binaryCallback): void {
    if (_function) {
        jsep.addBinaryOp(operator, precedence_or_fn as number);
        binops[operator] = _function;
    } else {
        jsep.addBinaryOp(operator, DEFAULT_PRECEDENCE[operator] || 1);
        binops[operator] = precedence_or_fn;
    }
}

// https://github.com/EricSmekens/jsep/blob/29049a0704b4a4e5d52b479ed72615c04adf81ec/src/jsep.js#L934

jsep.addUnaryOp("->");
// Projection Operator
jsep.addBinaryOp("::", 11, false);
// Filter Operator
jsep.addBinaryOp(":-", 11, false);
jsep.addBinaryOp("->", 12, false);
jsep.addUnaryOp("<-");
jsep.addBinaryOp("<-", 12, false);
jsep.addBinaryOp("++", 13, true);
jsep.addUnaryOp("json:");
jsep.addUnaryOp("g:");
jsep.addUnaryOp("ids:");
// use like T:(A->B->C)
jsep.addUnaryOp("T:");
jsep.addUnaryOp("::");

binops ['->'] = (vertexes, edgeType) => {
    if(!vertexes) return;
    const stepVertexes = new Map<number, Vertex>();

    for (const currentVertex of vertexes) {
        const type = edgeType.replace("$0", currentVertex.L[0]);

        const edgeIds = currentVertex.OUT[type] || [];
        if (edgeIds.length == 0) {
            const strict = true;
            // we only return error if its in middle of path
            if (strict && path.length > 1) {
                return;
            } else {
                continue;
            }
        }

        for (const edgeId of edgeIds) {
            const edge = graph.edges[edgeId];
            if (edge) {
                const newVertex = graph.vertexes[edge.E];
                if (newVertex) {
                    stepVertexes.set(newVertex.id, newVertex);
                } else {
                    return;
                }
            } else {
                return;
            }
        }
    }
    return Array.from(stepVertexes.values());
}
binops ['<-'] = (vertexes, edgeType) => {
    if(!vertexes) return;
    const stepVertexes = new Map<number, Vertex>();

    for (const currentVertex of vertexes) {
        const [type, filter, isMultiple] = calculateFilter(edgeType.replace("$0", currentVertex.L[0]))

        const edgeIds = currentVertex.IN[type];
        if (!edgeIds) {
            continue;
        }

        for (const edgeId of edgeIds) {
            const edge = graph.edges[edgeId];
            if (edge) {
                const newVertex = graph.vertexes[edge.S];
                if (newVertex) {
                    stepVertexes.set(newVertex.id, newVertex);
                } else {
                    return;
                }
            } else {
                return;
            }
        }
    }
    return Array.from(stepVertexes.values());
}
binops ['++'] = (vertexes1, vertexes2) => {
    return [...(Array.isArray(vertexes1) ? vertexes1 : []), ...(Array.isArray(vertexes2) ? vertexes2 : [])];
}
// Filter Operator
binops [':-'] = (vertexes1, projection) => {
    if (!vertexes1) {
        return;
    }
    try {
        return jsonata(projection).evaluate(vertexes1);
    } catch (e) {
        return;
    }
}
function projectedValueBinOps (vertexes1: any, projection: string): any {
    if (projection.match(/\$([A-Za-z][\w+]?[:\w.]*)/g)) {
        return projection.replace(/\$([A-Za-z][\w+]?[:\w.]*)/g, function(match, p1, offset, string) {
            return projectedValueBinOps(vertexes1, p1);
        });
    }

    let vertex;
    if (Array.isArray(vertexes1)) {
        vertex = vertexes1[0] || {};
    } else if (G.isObject(vertexes1)) {
        vertex = vertexes1;
    } else {
        vertex = {};
    }
    return getTextValue(path(projection, vertex));
}
binops ['::'] = projectedValueBinOps
unops['->'] = (collection, context) => {
    if (/^\$[1-9]+[0-9]*$/.test(collection)) {
        const numericValue = parseInt(collection.slice(1));
        const vertex = context.vertexes[numericValue - 1];
        if (vertex) return [vertex];
        return [];
    }
    return binops ['->'](context.vertexes, collection);
}
unops['<-'] = (collection, context) => {
    if (/^\$[1-9]+[0-9]*$/.test(collection)) {
        const numericValue = parseInt(collection.slice(1));
        const vertex = context.vertexes[numericValue - 1];
        if (vertex) return [vertex];
        return [];
    }
    return binops ['<-'](context.vertexes, collection);
}
unops['json:'] = (string) => {
    try {
        return JSON.parse(string);
    } catch (e) {
        console.warn(e);
        return;
    }
}
//
// unops['id:'] = (id, context) => {
//
//     let idValue;
//     if (Array.isArray(id)) {
//         idValue = id[0] || {};
//     } else if (G.isObject(id)) {
//         idValue = id.id;
//     } else {
//         idValue = id;
//     }
//
//     return idValue;
// }

unops['g:'] = (edgeType) => {
    const [type, filter, isMultiple] = calculateFilter(edgeType)
    if (filter) {
        const vertexIds = findVertexIdsByLabel(type);
        const filteredVertexes = [];
        for (const vertexId of vertexIds) {
            if (graph.vertexes[vertexId].P[IdAttr] === filter) {
                filteredVertexes.push(graph.vertexes[vertexId]);
            }
        }
        return filteredVertexes;
    } else {
        return findVertexIdsByLabel(edgeType).map((id) => graph.vertexes[id]);
    }
}
unops['ids:'] = (edgeType: string | number | string[] | Vertex[]) => {
    if ( typeof edgeType === "number") {
        return graph.vertexes[edgeType]
    } else if (typeof edgeType === "string") {
        return edgeType.split(',').map(id => graph.vertexes[id]).filter(x => x);
    } else if (Array.isArray(edgeType)) {
        if (edgeType.length === 0) {
            return [];
        } else if (typeof edgeType[0] === "string" || typeof edgeType[0] === "number") {
            return edgeType.map(id => graph.vertexes[id]).filter(x => x);
        }
    }
}
unops['T:'] = (value: any) => {
    return getTextValue(value);
}
function projectedValueUnOps(projection: any, context: any) {
    if (projection.match(/\$([A-Za-z][\w+]?[:\w.]*)/g)) {
        return projection.replace(/\$([A-Za-z][\w+]?[:\w.]*)/g, function(match, p1, offset, string) {
            return projectedValueUnOps(p1, context);
        });
    }
    let vertex;
    if (Array.isArray(context.vertexes)) {
        vertex = context.vertexes[0] || {};
    } else if (G.isObject(context.vertexes)) {
        vertex = context.vertexes;
    } else {
        vertex = {};
    }
    return getTextValue(path(projection, vertex));
}
unops['::'] = projectedValueUnOps

// const parse_tree = jsep('(->$0Name->$0Comp<-CompChild->$0Prop)++(->$0Name->$0Comp->$0Prop)++(->$0Name->$0ValueProp)');

//console.log(parse_tree)
// const value = evaluate(parse_tree, {a: 2, b: 2, c: 5});
// console.log(value)