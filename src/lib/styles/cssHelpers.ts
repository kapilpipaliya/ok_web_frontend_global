import type { Breakpoint } from "~/lib/styles/types/types";

// Default breakpoints for responsive design
export const DEFAULT_BREAKPOINTS: Record<Breakpoint, string> = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

export type CssTemplateTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => string;

function compileTemplate(
  strings: TemplateStringsArray,
  values: unknown[],
): string {
  return strings.reduce(
    (acc, str, i) => acc + str + (values[i] ?? ""),
    "",
  );
}

function wrap(rule: string): CssTemplateTag {
  return (strings, ...values) => {
    const body = compileTemplate(strings, values).trim();
    return body ? `${rule} {\n${body}\n}` : `${rule} {}`;
  };
}

function resolveBreakpoint(breakpoint: string): string {
  return DEFAULT_BREAKPOINTS[breakpoint as Breakpoint] ?? breakpoint;
}

function maxWidthBelow(breakpoint: string): string {
  const resolved = resolveBreakpoint(breakpoint);
  const match = resolved.match(/^([\d.]+)(px|rem|em)$/);
  if (!match) {
    return `calc(${resolved} - 0.02px)`;
  }
  const num = Number.parseFloat(match[1]);
  const unit = match[2];
  if (unit === "px") {
    return `${num - 0.02}px`;
  }
  return `calc(${resolved} - 0.02px)`;
}

// Breakpoint media queries

export function up(breakpoint: string): CssTemplateTag {
  return wrap(`@media (min-width: ${resolveBreakpoint(breakpoint)})`);
}

export function down(breakpoint: string): CssTemplateTag {
  return wrap(`@media (max-width: ${maxWidthBelow(breakpoint)})`);
}

export function between(min: string, max: string): CssTemplateTag {
  return wrap(
    `@media (min-width: ${resolveBreakpoint(min)}) and (max-width: ${maxWidthBelow(max)})`,
  );
}

export function only(breakpoint: string): CssTemplateTag {
  const keys = Object.keys(DEFAULT_BREAKPOINTS) as Breakpoint[];
  const index = keys.indexOf(breakpoint as Breakpoint);
  const min = resolveBreakpoint(breakpoint);

  if (index === -1 || index === keys.length - 1) {
    return wrap(`@media (min-width: ${min})`);
  }

  const next = DEFAULT_BREAKPOINTS[keys[index + 1]!];
  return wrap(
    `@media (min-width: ${min}) and (max-width: ${maxWidthBelow(next)})`,
  );
}

// Container queries

export interface ContainerQueryOptions {
  name?: string;
  minWidth?: string;
  condition?: string;
}

export function container(breakpoint: string): CssTemplateTag;
export function container(name: string, minWidth: string): CssTemplateTag;
export function container(options: ContainerQueryOptions): CssTemplateTag;
export function container(
  breakpointOrNameOrOptions: string | ContainerQueryOptions,
  minWidth?: string,
): CssTemplateTag {
  if (typeof breakpointOrNameOrOptions === "object") {
    const { name, minWidth: min, condition } = breakpointOrNameOrOptions;

    if (condition) {
      const prefix = name ? `@container ${name}` : "@container";
      return wrap(`${prefix} (${condition})`);
    }

    const resolved = resolveBreakpoint(min ?? "md");
    if (name) {
      return wrap(`@container ${name} (min-width: ${resolved})`);
    }

    return wrap(`@container (min-width: ${resolved})`);
  }

  if (minWidth !== undefined) {
    const resolved = resolveBreakpoint(minWidth);
    return wrap(
      `@container ${breakpointOrNameOrOptions} (min-width: ${resolved})`,
    );
  }

  return wrap(
    `@container (min-width: ${resolveBreakpoint(breakpointOrNameOrOptions)})`,
  );
}

// At-rules

export interface AnimationOptions {
  duration?: string;
  easing?: string;
  delay?: string;
  iterationCount?: string | number;
  direction?: string;
  fillMode?: string;
  playState?: string;
  timeline?: string;
  rangeStart?: string;
  rangeEnd?: string;
}

export function animation(
  nameOrValue: string,
  options?: AnimationOptions,
): string {
  if (options === undefined) {
    if (nameOrValue.includes(" ")) {
      return `animation: ${nameOrValue};`;
    }
    options = {};
  }

  const {
    duration = "300ms",
    easing = "ease",
    delay = "0ms",
    iterationCount = "1",
    direction = "normal",
    fillMode = "none",
    playState,
    timeline,
    rangeStart,
    rangeEnd,
  } = options;

  const shorthand = [
    nameOrValue,
    duration,
    easing,
    delay,
    iterationCount,
    direction,
    fillMode,
    playState,
  ]
    .filter(Boolean)
    .join(" ");

  const declarations = [`animation: ${shorthand};`];

  if (timeline) {
    declarations.push(`animation-timeline: ${timeline};`);
  }

  if (rangeStart || rangeEnd) {
    declarations.push(
      `animation-range: ${[rangeStart, rangeEnd].filter(Boolean).join(" ")};`,
    );
  }

  return declarations.join("\n");
}

export interface PropertyOptions {
  syntax: string;
  inherits: boolean;
  initialValue: string;
}

function quoteCssString(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed;
  }
  return `"${trimmed}"`;
}

export function property(name: string, options: PropertyOptions): string {
  return `@property ${name} {
  syntax: ${quoteCssString(options.syntax)};
  inherits: ${options.inherits};
  initial-value: ${options.initialValue};
}`;
}

export const cssHelpers = {
  up,
  down,
  between,
  only,
  container,
  animation,
  property,
} as const;
