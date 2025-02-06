interface ActiveProps {
  "tc-active": Booleanish;
}

interface ARIACheckedProps {
  "aria-checked": "mixed" | boolean;
}

/**
 * ARIA states
 */

interface ARIADisabledProps {
  "aria-disabled"?: boolean;
  disabled?: boolean;
}

interface ARIAExpandedProps {
  "aria-expanded"?: boolean;
}

interface ARIAPressedProps {
  "aria-pressed": boolean;
}

interface ARIASelectedProps {
  "aria-selected": boolean;
}

type Booleanish = "" | undefined;

interface CheckedProps {
  "tc-checked": "mixed" | Booleanish;
}
interface DisabledProps {
  "tc-disabled"?: Booleanish;
}

interface ExpandedProps {
  "tc-expanded"?: Booleanish;
}

interface HasActiveProps {
  "tc-has-active": Booleanish;
}

interface HasQueryProps {
  "tc-has-query": Booleanish;
}

/**
 * Terracotta States Dont use these
 */

interface HasSelectedProps {
  "tc-has-selected": Booleanish;
}

interface MatchesProps {
  "tc-matches": Booleanish;
}

interface PressedProps {
  "tc-pressed": Booleanish;
}

interface SelectedProps {
  "tc-selected": Booleanish;
}

export function createActiveState(isActive: () => boolean): ActiveProps {
  return {
    get "tc-active"(): Booleanish {
      return toBooleanish(isActive());
    },
  };
}

export function createARIACheckedState(
  checked: () => boolean | undefined,
): ARIACheckedProps {
  return {
    get "aria-checked"(): "mixed" | boolean {
      return checked() ?? "mixed";
    },
  };
}

export function createARIADisabledState(
  disabled: () => boolean | undefined,
): ARIADisabledProps {
  return {
    get "aria-disabled"(): boolean | undefined {
      return disabled();
    },
    // get disabled(): boolean | undefined {
    //   return disabled();
    // },
  };
}

export function createARIAExpandedState(
  expanded: () => boolean | undefined,
): ARIAExpandedProps {
  return {
    get "aria-expanded"(): boolean | undefined {
      return expanded();
    },
  };
}

export function createARIAPressedState(
  pressed: () => boolean,
): ARIAPressedProps {
  return {
    get "aria-pressed"(): boolean {
      return pressed();
    },
  };
}

export function createARIASelectedState(
  selected: () => boolean,
): ARIASelectedProps {
  return {
    get "aria-selected"(): boolean {
      return selected();
    },
  };
}

export function createCheckedState(
  isChecked: () => boolean | undefined,
): CheckedProps {
  return {
    get "tc-checked"(): "mixed" | Booleanish {
      const result = isChecked();
      return result == null ? "mixed" : toBooleanish(result);
    },
  };
}

export function createDisabledState(
  disabled: () => boolean | undefined,
): DisabledProps {
  return {
    get "tc-disabled"(): Booleanish {
      return toBooleanish(disabled());
    },
  };
}

export function createExpandedState(
  expanded: () => boolean | undefined,
): ExpandedProps {
  return {
    get "tc-expanded"(): Booleanish {
      return toBooleanish(expanded());
    },
  };
}

export function createHasActiveState(hasActive: () => boolean): HasActiveProps {
  return {
    get "tc-has-active"(): Booleanish {
      return toBooleanish(hasActive());
    },
  };
}

export function createHasQueryState(hasQuery: () => boolean): HasQueryProps {
  return {
    get "tc-has-query"(): Booleanish {
      return toBooleanish(hasQuery());
    },
  };
}

export function createHasSelectedState(
  hasSelected: () => boolean,
): HasSelectedProps {
  return {
    get "tc-has-selected"(): Booleanish {
      return toBooleanish(hasSelected());
    },
  };
}

export function createMatchesState(matches: () => boolean): MatchesProps {
  return {
    get "tc-matches"(): Booleanish {
      return toBooleanish(matches());
    },
  };
}

export function createPressedState(pressed: () => boolean): PressedProps {
  return {
    get "tc-pressed"(): Booleanish {
      return toBooleanish(pressed());
    },
  };
}

export function createSelectedState(isSelected: () => boolean): SelectedProps {
  return {
    get "tc-selected"(): Booleanish {
      return toBooleanish(isSelected());
    },
  };
}

function toBooleanish(value?: boolean): Booleanish {
  return value ? "" : undefined;
}
