import * as Acorn from "acorn";
import AcornJSX from "acorn-jsx";
import {
  canHaveChildren,
  canHaveWhitespace,
  containerTags,
} from "~/lib/jsx_parser/source/constants/specialTags";
import { randomHash } from "~/lib/jsx_parser/source/helpers/hash";
import { parseStyle } from "~/lib/jsx_parser/source/helpers/parseStyle";
import { resolvePath } from "~/lib/jsx_parser/source/helpers/resolvePath";
import type { JSX } from "solid-js";
import type { GraphInterface, Vertex } from "~/lib/graph/graph";
import type { SetStoreFunction, Store } from "solid-js/store";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import attributeNames from "~/lib/jsx_parser/source/constants/attributeNames";
import {componentDrag} from "~/lib/drag-drop/componentDrag";
import {setPropertyValueGlobal} from "~/lib/drag-drop/setPropertyValueGlobal";

type ParsedJSX = JSX.Element | boolean | string;
type ParsedTree = ParsedJSX | ParsedJSX[] | null;
export type TProps = {
  allowUnknownElements?: boolean;
  autoCloseVoidElements?: boolean;
  bindings?: { [key: string]: unknown };
  blacklistedAttrs?: Array<string | RegExp>;
  blacklistedTags?: string[];
  className?: string;
  components?: Record<string, ComponentType | ExoticComponent>;
  componentsOnly?: boolean;
  disableFragments?: boolean;
  disableKeyGeneration?: boolean;
  jsx?: string;
  onError?: (error: Error) => void;
  showWarnings?: boolean;
  renderError?: (props: { error: string }) => JSX.Element | null;
  renderInWrapper?: boolean;
  renderUnrecognized?: (tagName: string) => JSX.Element | null;
};
type Scope = Record<string, any>;

/* eslint-disable consistent-return */
export default class JsxParser {
  static displayName = "JsxParser";
  static defaultProps: TProps = {
    allowUnknownElements: true,
    autoCloseVoidElements: false,
    bindings: {},
    blacklistedAttrs: [/^on.+/i],
    blacklistedTags: ["script"],
    className: "",
    components: {},
    componentsOnly: false,
    disableFragments: false,
    disableKeyGeneration: false,
    jsx: "",
    onError: () => {},
    showWarnings: false,
    renderError: undefined,
    renderInWrapper: true,
    renderUnrecognized: () => null,
  };
  private ParsedChildren: ParsedTree = null;

  constructor(props) {
    const newProps = Object.assign({}, JsxParser.defaultProps, props);
    this.props = {};
    for (const property in newProps) {
      this.props[property] = newProps[property];
    }
  }

  render = (
    graph: Store<GraphInterface>,
    setGraph: SetStoreFunction<GraphInterface>,
  ): JSX.Element => {
    const jsx = (this.props.jsx || "").trim().replace(/<!DOCTYPE([^>]*)>/g, "");
    this.ParsedChildren = this.#parseJSX(graph, setGraph, jsx, {
      parent: this.props.parent,
    });
    const className = [
      ...new Set(["jsx-parser", ...String(this.props.className).split(" ")]),
    ]
      .filter(Boolean)
      .join(" ");

    return this.ParsedChildren;
  };

  #parseJSX = (
    graph: Store<GraphInterface>,
    setGraph: SetStoreFunction<GraphInterface>,
    jsx: string,
    scope: {},
  ): JSX.Element | JSX.Element[] | null => {
    const parser = Acorn.Parser.extend(
      AcornJSX({
        autoCloseVoidElements: this.props.autoCloseVoidElements,
      }),
    );
    const wrappedJsx = `<root>${jsx}</root>`;
    let parsed: AcornJSX.Expression[] = [];
    try {
      // @ts-ignore - AcornJsx doesn't have typescript typings
      parsed = parser.parse(wrappedJsx, { ecmaVersion: "latest" });
      // @ts-ignore - AcornJsx doesn't have typescript typings
      parsed = parsed.body[0].expression.children || [];
    } catch (error) {
      if (this.props.showWarnings) console.warn(error); // eslint-disable-line no-console
      if (this.props.onError) this.props.onError(error);
      if (this.props.renderError) {
        return this.props.renderError({ error: String(error) });
      }
      return null;
    }

    return parsed
      .map((p) => this.#parseExpression(graph, setGraph, p, scope))
      .filter(Boolean);
  };

  #parseExpression = (
    graph: Store<GraphInterface>,
    setGraph: SetStoreFunction<GraphInterface>,
    expression: AcornJSX.Expression,
    scope?: Scope,
  ): any => {
    switch (expression.type) {
      case "JSXAttribute":
        if (expression.value === null) return true;
        return this.#parseExpression(graph, setGraph, expression.value, scope);
      case "JSXElement":
      case "JSXFragment":
        return this.#parseElement(graph, setGraph, expression, scope);
      case "JSXExpressionContainer":
        return this.#parseExpression(
          graph,
          setGraph,
          expression.expression,
          scope,
        );
      case "JSXText": {
        const key = this.props.disableKeyGeneration ? undefined : randomHash();
        return expression.value;
      }
      // return this.props.disableFragments
      // 	? expression.value
      // 	: <Fragment key={key}>{expression.value}</Fragment>
      case "ArrayExpression":
        return expression.elements.map((ele) =>
          this.#parseExpression(graph, setGraph, ele, scope),
        ) as ParsedTree;
      case "BinaryExpression":
        /* eslint-disable eqeqeq,max-len */
        switch (expression.operator) {
          case "-":
            return (
              this.#parseExpression(graph, setGraph, expression.left) -
              this.#parseExpression(graph, setGraph, expression.right)
            );
          case "!=":
            return (
              this.#parseExpression(graph, setGraph, expression.left) !=
              this.#parseExpression(graph, setGraph, expression.right)
            );
          case "!==":
            return (
              this.#parseExpression(graph, setGraph, expression.left) !==
              this.#parseExpression(graph, setGraph, expression.right)
            );
          case "*":
            return (
              this.#parseExpression(graph, setGraph, expression.left) *
              this.#parseExpression(graph, setGraph, expression.right)
            );
          case "**":
            return (
              this.#parseExpression(graph, setGraph, expression.left) **
              this.#parseExpression(graph, setGraph, expression.right)
            );
          case "/":
            return (
              this.#parseExpression(graph, setGraph, expression.left) /
              this.#parseExpression(graph, setGraph, expression.right)
            );
          case "%":
            return (
              this.#parseExpression(graph, setGraph, expression.left) %
              this.#parseExpression(graph, setGraph, expression.right)
            );
          case "+":
            return (
              this.#parseExpression(graph, setGraph, expression.left) +
              this.#parseExpression(graph, setGraph, expression.right)
            );
          case "<":
            return (
              this.#parseExpression(graph, setGraph, expression.left) <
              this.#parseExpression(graph, setGraph, expression.right)
            );
          case "<=":
            return (
              this.#parseExpression(graph, setGraph, expression.left) <=
              this.#parseExpression(graph, setGraph, expression.right)
            );
          case "==":
            return (
              this.#parseExpression(graph, setGraph, expression.left) ==
              this.#parseExpression(graph, setGraph, expression.right)
            );
          case "===":
            return (
              this.#parseExpression(graph, setGraph, expression.left) ===
              this.#parseExpression(graph, setGraph, expression.right)
            );
          case ">":
            return (
              this.#parseExpression(graph, setGraph, expression.left) >
              this.#parseExpression(graph, setGraph, expression.right)
            );
          case ">=":
            return (
              this.#parseExpression(graph, setGraph, expression.left) >=
              this.#parseExpression(graph, setGraph, expression.right)
            );
          /* eslint-enable eqeqeq,max-len */
        }
        return undefined;
      case "CallExpression": {
        const parsedCallee = this.#parseExpression(
          graph,
          setGraph,
          expression.callee,
        );
        if (parsedCallee === undefined) {
          this.props.onError?.(
            new Error(
              `The expression '${expression.callee}' could not be resolved, resulting in an undefined return value.`,
            ),
          );
          return undefined;
        }
        return parsedCallee(
          ...expression.arguments.map((arg) =>
            this.#parseExpression(graph, setGraph, arg, expression.callee),
          ),
        );
      }
      case "ConditionalExpression":
        return this.#parseExpression(graph, setGraph, expression.test)
          ? this.#parseExpression(graph, setGraph, expression.consequent)
          : this.#parseExpression(graph, setGraph, expression.alternate);
      case "ExpressionStatement":
        return this.#parseExpression(graph, setGraph, expression.expression);
      case "Identifier":
        if (scope && expression.name in scope) {
          return scope[expression.name];
        }
        return this.props.bindings?.[expression.name];

      case "Literal":
        return expression.value;
      case "LogicalExpression": {
        const left = this.#parseExpression(graph, setGraph, expression.left);
        if (expression.operator === "||" && left) return left;
        if (
          (expression.operator === "&&" && left) ||
          (expression.operator === "||" && !left)
        ) {
          return this.#parseExpression(graph, setGraph, expression.right);
        }
        return false;
      }
      case "MemberExpression":
        return this.#parseMemberExpression(graph, setGraph, expression, scope);
      case "ObjectExpression": {
        const object: Record<string, any> = {};
        expression.properties.forEach((prop) => {
          object[prop.key.name! || prop.key.value!] = this.#parseExpression(
            graph,
            setGraph,
            prop.value,
          );
        });
        return object;
      }
      case "TemplateElement":
        return expression.value.cooked;
      case "TemplateLiteral":
        return [...expression.expressions, ...expression.quasis]
          .sort((a, b) => {
            if (a.start < b.start) return -1;
            return 1;
          })
          .map((item) => this.#parseExpression(graph, setGraph, item))
          .join("");
      case "UnaryExpression":
        switch (expression.operator) {
          case "+":
            return expression.argument.value;
          case "-":
            return -expression.argument.value;
          case "!":
            return !expression.argument.value;
        }
        return undefined;
      case "ArrowFunctionExpression":
        if (expression.async || expression.generator) {
          this.props.onError?.(
            new Error("Async and generator arrow functions are not supported."),
          );
        }
        return (...args: any[]): any => {
          const functionScope: Record<string, any> = {};
          expression.params.forEach((param, idx) => {
            functionScope[param.name] = args[idx];
          });
          return this.#parseExpression(
            graph,
            setGraph,
            expression.body,
            functionScope,
          );
        };
    }
  };

  #parseMemberExpression = (
    graph: Store<GraphInterface>,
    setGraph: SetStoreFunction<GraphInterface>,
    expression: AcornJSX.MemberExpression,
    scope?: Scope,
  ): any => {
    // eslint-disable-next-line prefer-destructuring
    let { object } = expression;
    const path = [
      expression.property?.name ?? JSON.parse(expression.property?.raw ?? '""'),
    ];

    if (expression.object.type !== "Literal") {
      while (object && ["MemberExpression", "Literal"].includes(object?.type)) {
        const { property } = object as AcornJSX.MemberExpression;
        if ((object as AcornJSX.MemberExpression).computed) {
          path.unshift(
            this.#parseExpression(graph, setGraph, property!, scope),
          );
        } else {
          path.unshift(property?.name ?? JSON.parse(property?.raw ?? '""'));
        }

        object = (object as AcornJSX.MemberExpression).object;
      }
    }

    const target = this.#parseExpression(graph, setGraph, object, scope);
    try {
      let parent = target;
      const member = path.reduce((value, next) => {
        parent = value;
        return value[next];
      }, target);
      if (typeof member === "function") return member.bind(parent);

      return member;
    } catch {
      const name = (object as AcornJSX.MemberExpression)?.name || "unknown";
      this.props.onError?.(
        new Error(`Unable to parse ${name}["${path.join('"]["')}"]}`),
      );
    }
  };

  #parseName = (
    element: AcornJSX.JSXIdentifier | AcornJSX.JSXMemberExpression,
  ): string => {
    if (element.type === "JSXIdentifier") {
      return element.name;
    }
    return `${this.#parseName(element.object)}.${this.#parseName(
      element.property,
    )}`;
  };

  #parseElement = (
    graph: Store<GraphInterface>,
    setGraph: SetStoreFunction<GraphInterface>,
    element: AcornJSX.JSXElement | AcornJSX.JSXFragment,
    scope?: Scope,
  ): JSX.Element | JSX.Element[] | null => {
    const { allowUnknownElements, components, componentsOnly, onError } =
      this.props;
    const { children: childNodes = [] } = element;
    const openingTag =
      element.type === "JSXElement"
        ? element.openingElement
        : element.openingFragment;
    const { attributes = [] } = openingTag;
    const name =
      element.type === "JSXElement" ? this.#parseName(openingTag.name) : "";

    const blacklistedAttrs = (this.props.blacklistedAttrs || []).map((attr) =>
      attr instanceof RegExp ? attr : new RegExp(attr, "i"),
    );
    const blacklistedTags = (this.props.blacklistedTags || [])
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    if (/^(html|head|body)$/i.test(name)) {
      return childNodes.map((c) =>
        this.#parseElement(graph, setGraph, c, scope),
      ) as JSX.Element[];
    }
    const tagName = name.trim().toLowerCase();
    if (blacklistedTags.indexOf(tagName) !== -1) {
      onError?.(
        new Error(
          `The tag <${name}> is blacklisted, and will not be rendered.`,
        ),
      );
      return null;
    }

    if (name !== "" && !resolvePath(components, name)) {
      if (componentsOnly) {
        onError?.(
          new Error(
            `The component <${name}> is unrecognized, and will not be rendered.`,
          ),
        );
        return this.props.renderUnrecognized?.(name);
      }

      if (
        !allowUnknownElements &&
        document.createElement(name) instanceof HTMLUnknownElement
      ) {
        onError?.(
          new Error(
            `The tag <${name}> is unrecognized in this browser, and will not be rendered.`,
          ),
        );
        return this.props.renderUnrecognized?.(name);
      }
    }

    let children;
    const component =
      element.type === "JSXElement" ? resolvePath(components, name) : undefined;

    const comp = component || name;

    if (!scope?.parent) {
      alert("parent scope is not defined.");
      return;
    }
    let componentVertex: Vertex;
    let isText = false;

    // if comp is undefined it means a fragment and handle it properly by rendering a div
    if (containerTags.includes(comp) || !comp) {
      componentVertex = findVertexByLabelAndUniqueId(
        graph,
        "Comp",
        "name",
        "Box",
      )!;
      if (comp !== "div") {
        isText = true;
      }
    } else if (comp === "img") {
      componentVertex = findVertexByLabelAndUniqueId(
        graph,
        "Comp",
        "name",
        "Image",
      )!;
    } else if (comp === "a") {
      componentVertex = findVertexByLabelAndUniqueId(
        graph,
        "Comp",
        "name",
        "A",
      )!;
    } else if (comp === "Repeater") {
      componentVertex = findVertexByLabelAndUniqueId(
        graph,
        "Comp",
        "name",
        "Repeater",
      )!;
    } else if (comp === "svg") {
      componentVertex = findVertexByLabelAndUniqueId(
        graph,
        "Comp",
        "name",
        "Icon",
      )!;
    } else {
      isText = true;
      componentVertex = findVertexByLabelAndUniqueId(
        graph,
        "Comp",
        "name",
        "Text",
      )!;
    }
    const rowId = componentDrag(
      this.props.txnId,
      componentVertex!,
      scope.parent,
      graph,
      setGraph,
      1000,
    );
    if (rowId === -1) return;
    const parentVertex = graph.vertexes[rowId];
    if (isText) {
      setPropertyValueGlobal(
        graph,
        setGraph,
        this.props.txnId,
        { P: { name: "as" } } as any,
        graph.vertexes[rowId],
        componentVertex,
        comp,
      );
    }

    // sort to parent's children
    // sortChildren(childrenItems, pageConfig[0].record.txnId);

    const props: { [key: string]: any } = {
      key: this.props.disableKeyGeneration ? undefined : randomHash(),
    };
    attributes.forEach(
      // eslint-disable-next-line max-len
      (
        expr:
          | AcornJSX.JSXAttribute
          | AcornJSX.JSXAttributeExpression
          | AcornJSX.JSXSpreadAttribute,
      ) => {
        if (expr.type === "JSXAttribute") {
          const rawName = expr.name.name;
          const attributeName = attributeNames[rawName] || rawName;
          // if the value is null, this is an implicitly "true" prop, such as readOnly
          let value = this.#parseExpression(graph, setGraph, expr, {
            ...scope,
            parent: parentVertex,
          });
          if (attributeName === "href" || attributeName === "src") {
            value = `'${value}'`;
          }

          const matches = blacklistedAttrs.filter((re) =>
            re.test(attributeName),
          );
          if (matches.length === 0) {
            props[attributeName] = value;
          }
        } else if (
          (expr.type === "JSXSpreadAttribute" &&
            expr.argument.type === "Identifier") ||
          expr.argument?.type === "MemberExpression"
        ) {
          const value = this.#parseExpression(graph, setGraph, expr.argument!, {
            ...scope,
            parent: parentVertex,
          });
          if (typeof value === "object") {
            Object.keys(value).forEach((rawName) => {
              const attributeName: string = ATTRIBUTES[rawName] || rawName;
              const matches = blacklistedAttrs.filter((re) =>
                re.test(attributeName),
              );
              if (matches.length === 0) {
                props[attributeName] = value[rawName];
              }
            });
          }
        }
      },
    );

    if (typeof props.style === "string") {
      props.style = parseStyle(props.style);
    }

    // ui-kit keys
    const uiKitProps = {} as { [key: string]: any };
    const nonUiKitProps = {} as { [key: string]: any };
    for (const key in props) {
      if (key.startsWith("uk-")) {
        uiKitProps[key] = props[key];
      } else {
        nonUiKitProps[key] = props[key];
      }
    }
    if (Object.keys(uiKitProps).length) {
      setPropertyValueGlobal(
        graph,
        setGraph,
        this.props.txnId,
        { P: { name: "attr" } } as any,
        graph.vertexes[rowId],
        componentVertex,
        JSON.stringify(uiKitProps),
      );
    }

    for (const key in nonUiKitProps) {
      if (key === "key") {
        continue;
      }
      setPropertyValueGlobal(
        graph,
        setGraph,
        this.props.txnId,
        {
          P: { name: key === "className" || key === "class" ? "class" : key },
        } as any,
        graph.vertexes[rowId],
        componentVertex,
        nonUiKitProps[key],
      );
    }

    if (comp === "svg") {
      setPropertyValueGlobal(
        graph,
        setGraph,
        this.props.txnId,
        { P: { name: "icon" } } as any,
        graph.vertexes[rowId],
        componentVertex,
        `'${"mdi:hamburger-menu".replaceAll("'", "\\'")}'`,
      );
      return;
    }

    // handle children last
    if (component || canHaveChildren(name)) {
      children = childNodes.map((node) => {
        const value = this.#parseExpression(graph, setGraph, node, {
          ...scope,
          parent: parentVertex,
        });
        if (typeof value === "string" && childNodes.length > 1) {
          // Remove empty nodes from import code
          if (value.trim() === "") return;
          const componentVertex = findVertexByLabelAndUniqueId(
            graph,
            "Comp",
            "name",
            "Text",
          )!;
          const rowId = componentDrag(
            this.props.txnId,
            componentVertex!,
            parentVertex,
            graph,
            setGraph,
            1000,
          );
          if (rowId === -1) return;
          setPropertyValueGlobal(
            graph,
            setGraph,
            this.props.txnId,
            { P: { name: "text" } } as any,
            graph.vertexes[rowId],
            componentVertex,
            `'${value.replaceAll("'", "\\'")}'`,
          );
        }
        return value;
      });
      // Don't process if children length > 1
      if (childNodes.length > 1) return;
      if (!component && !canHaveWhitespace(name)) {
        children = children.filter(
          (child) => typeof child !== "string" || !/^\s*$/.test(child),
        );
      }

      if (children.length === 0) {
        children = undefined;
      } else if (children.length === 1) {
        [children] = children;
      } else if (children.length > 1 && !this.props.disableKeyGeneration) {
        // Add `key` to any child that is a react element (by checking if it has `.type`) if one
        // does not already exist.N
        children = children.map((child, key) =>
          child?.type && !child?.key
            ? { ...child, key: child.key || key }
            : child,
        );
      }
    }

    const lowerName = name.toLowerCase();
    if (lowerName === "option") {
      children = children.props.children;
    }

    // return React.createElement(component || lowerName, props, children)
    // return console.log(component || lowerName, props, children)

    if (typeof children === "string") {
      if (children) {
        setPropertyValueGlobal(
          graph,
          setGraph,
          this.props.txnId,
          { P: { name: "text" } } as any,
          graph.vertexes[rowId],
          componentVertex,
          `'${children.replaceAll("'", "\\'")}'`,
        );
      }
    } else {
      console.log("not handled", children);
    }
  };
}
/* eslint-enable consistent-return */
