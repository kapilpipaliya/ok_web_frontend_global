import { createMemo, type JSX, mergeProps, splitProps } from "solid-js";

import { composeStyles, getRandom } from "../tools";
import "./avatar.css";

export type AvatarProps = JSX.HTMLAttributes<HTMLDivElement> & {
  fallback?: JSX.Element;
  img?: string;
  name?: string;
  plus?: number;
};

const char =
  "[A-Za-z\xAA\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02B8\u02E0-\u02E4\u0370-\u0373\u0375-\u0377\u037A-\u037D\u037F\u0384\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03E1\u03F0-\u0484\u0487-\u052F\u1C80-\u1C88\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FC4\u1FC6-\u1FD3\u1FD6-\u1FDB\u1FDD-\u1FEF\u1FF2-\u1FF4\u1FF6-\u1FFE\u2071\u207F\u2090-\u209C\u2126\u212A\u212B\u2132\u214E\u2160-\u2188\u2C60-\u2C7F\u2DE0-\u2DFF\uA640-\uA69F\uA722-\uA787\uA78B-\uA7BF\uA7C2-\uA7C6\uA7F7-\uA7FF\uAB30-\uAB5A\uAB5C-\uAB67\uFB00-\uFB06\uFE2E\uFE2F\uFF21-\uFF3A\uFF41-\uFF5A]|\uD800[\uDD40-\uDD8E\uDDA0]|\uD834[\uDE00-\uDE45]";
const initialsRegexp = new RegExp(`^.*?(${char})(?:.*\\s+\\S*?(${char}))?.*$`);

export type AvatarBadgeProps = JSX.HTMLAttributes<HTMLSpanElement> & {
  background?: string;
  borderColor?: string;
};

export type AvatarGroupProps = JSX.HTMLAttributes<HTMLDivElement> & {
  "data-plus"?: string;
};

export function Avatar(props: Readonly<AvatarProps>) {
  const [local, divProps] = splitProps(props, [
    "classList",
    "children",
    "img",
    "name",
    "fallback",
  ]);
  const initials = createMemo(() =>
    local.name ? getInitials(local.name) : "",
  );

  if (local.img) {
    return (
      <div
        classList={mergeProps(local.classList ?? {}, { "sb-avatar": true })}
        data-random={getRandom()}
        role="figure"
        {...divProps}
      >
        <img alt={local.name} src={local.img} />
        <span aria-hidden="true">{initials()}</span>
        {local.children}
      </div>
    );
  }
  if (local.name) {
    return (
      <div
        aria-label={local.name}
        classList={mergeProps(local.classList ?? {}, { "sb-avatar": true })}
        data-random={getRandom()}
        role="img"
        {...divProps}
      >
        {initials()}
        {local.children}
      </div>
    );
  }
  return (
    <div
      aria-label="Unknown"
      classList={mergeProps(local.classList ?? {}, { "sb-avatar": true })}
      data-random={getRandom()}
      role="img"
      {...divProps}
    >
      {local.fallback ?? "?"}
      {local.children}
    </div>
  );
}

export function AvatarBadge(props: Readonly<AvatarBadgeProps>) {
  const [local, spanProps] = splitProps(props, [
    "classList",
    "borderColor",
    "background",
    "style",
  ]);
  const composedStyle = composeStyles(local.style ?? {}, {
    background: local.background,
    "border-color": local.borderColor,
  });

  return (
    <span
      classList={mergeProps(local.classList ?? {}, { "sb-badge": true })}
      {...spanProps}
      style={composedStyle}
    />
  );
}

export function AvatarGroup(props: Readonly<AvatarGroupProps>) {
  return (
    <div
      {...props}
      aria-haspopup={Array.isArray(props.children) && props.children.length > 3}
      classList={mergeProps(props.classList ?? {}, { "sb-avatar": true })}
      role="group"
    />
  );
}

export function getInitials(name: string) {
  return (
    name
      // remove superfluous spaces and stuff in brackets
      .replace(/^\s+|\(.*?\)|\{.*?\}|\[.*\]|<.*?>|\s+$/g, "")
      // find first char of the first name and the last name
      .replace(initialsRegexp, "$1$2")
      .toUpperCase()
  );
}
