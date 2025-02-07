import assert from "./assert";
import {
  focusFirst,
  focusLast,
  focusMatch,
  focusNext,
  focusNode,
  focusPrev,
} from "./focus-navigation";
import { DATA_SET_NAMESPACE, DISABLED_NODE } from "./namespace";

const OWNER = `${DATA_SET_NAMESPACE}-owner` as const;

export interface FocusNavigatorOptions {
  base: string;
  virtual: boolean;
}

type OwnerAttribute = {
  [key in typeof OWNER]: string;
};

export default class FocusNavigator {
  private current: HTMLElement | undefined;

  private internalRef?: HTMLElement;

  private options: FocusNavigatorOptions;

  private ownerID: string;

  constructor(ownerID: string, options: Partial<FocusNavigatorOptions> = {}) {
    this.ownerID = ownerID;
    this.options = {
      base: options.base ?? "",
      virtual: options.virtual ?? false,
    };
  }

  clearRef(): void {
    this.internalRef = undefined;
  }

  getId(): string {
    return this.ownerID;
  }

  setChecked(node: HTMLElement): void {
    this.current = focusNode(node, this.options.virtual);
  }

  setCurrent(node: HTMLElement): void {
    this.current = node;
  }

  setFirstChecked(condition = ""): void {
    if (this.internalRef instanceof HTMLElement) {
      const current = focusFirst(
        this.query(this.internalRef, condition),
        this.options.virtual,
      );
      if (current) {
        this.current = current;
      }
    }
  }

  setFirstMatch(character: string): void {
    if (this.internalRef instanceof HTMLElement) {
      const current = focusMatch(
        this.query(this.internalRef),
        character,
        this.options.virtual,
      );
      if (current) {
        this.current = current;
      }
    }
  }

  setLastChecked(condition = ""): void {
    if (this.internalRef instanceof HTMLElement) {
      const current = focusLast(
        this.query(this.internalRef, condition),
        this.options.virtual,
      );
      if (current) {
        this.current = current;
      }
    }
  }

  setNextChecked(loop: boolean): void {
    if (this.internalRef instanceof HTMLElement) {
      assert(this.current, new Error("missing current ref"));
      const current = focusNext(
        this.query(this.internalRef),
        this.current,
        loop,
        this.options.virtual,
      );
      if (current) {
        this.current = current;
      }
    }
  }

  setPrevChecked(loop: boolean): void {
    if (this.internalRef instanceof HTMLElement) {
      assert(this.current, new Error("missing current ref"));
      const current = focusPrev(
        this.query(this.internalRef),
        this.current,
        loop,
        this.options.virtual,
      );
      if (current) {
        this.current = current;
      }
    }
  }

  setRef(ref: HTMLElement): void {
    this.internalRef = ref;
  }

  private query(ref: HTMLElement, condition = ""): NodeListOf<HTMLElement> {
    return queryNodes(ref, this.ownerID, `${this.options.base}${condition}`);
  }
}

export function createOwnerAttribute(ownerID: string): OwnerAttribute {
  return {
    [OWNER]: ownerID,
  };
}

function queryNodes<T extends Element>(
  el: T,
  ownerID: string,
  condition = "",
): NodeListOf<HTMLElement> {
  // We only query nodes that are:
  // - owned by the root component via ownerID
  // - node isn't disabled
  // - extra condition
  const query = `[${OWNER}="${ownerID}"]:not(${DISABLED_NODE})${condition}`;
  const nodes = el.querySelectorAll<HTMLElement>(query);
  return nodes;
}
