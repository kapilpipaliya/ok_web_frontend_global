import { tv, VariantProps } from "tailwind-variants";

import { focusStyles } from "../utils/styles";

export const buttonStyles = tv({
  slots: {
    root: [
      "group",
      "appearance:none ",
      "position:relative ",
      "align-items:center  justify-content:center ",
      "font-weight:500 ",
      "border-width:1px  border-style:solid ",
      "cursor:pointer  text-decoration:none ",
      "~property:color,bg,border-color,text-decoration-color,fill,stroke ~easing:cubic-bezier(0.4,0,0.2,1) ~duration:150ms",
      "ui-disabled:text-content-disabled ui-disabled:opacity-50 ui-disabled:pointer-events-none ui-disabled:shadow-none",
      focusStyles,
    ],
    icon: "display-inherit",
    loadingContent: "display:inline-flex  align-items:center  justify-content:center  opacity:0 ",
  },
  variants: {
    variant: {
      solid: {},
      soft: {},
      inverted: {},
      default: {
        root: [
          "text-content bg-surface border-line",
          "ui-not-disabled:hover:bg-surface-neutral-subtle",
          "ui-not-disabled:active:bg-surface-neutral-subtle-hover",
          "box-shadow:0|1px|2px|0|rgba(0,0,0,0.05)  ui-not-disabled:active:shadow-none",
          // dark
          "dark:ui-not-disabled:bg-white/5",
          "dark:ui-not-disabled:hover:bg-white/10",
          "dark:ui-not-disabled:active:bg-white/[0.15]",
          "box-shadow:none@dark",
        ],
      },
      dashed: {
        root: [
          "text-content bg:transparent  border-style:dashed  border-line",
          "ui-not-disabled:hover:bg-surface-neutral-subtle",
          "ui-not-disabled:active:bg-surface-neutral-subtle-hover",
          // dark
          "dark:ui-not-disabled:hover:bg-white/10",
          "dark:ui-not-disabled:active:bg-white/[0.15]",
        ],
      },
      text: {
        root: [
          "text-content bg:transparent  border-color:transparent ",
          "ui-not-disabled:hover:bg-surface-neutral-subtle",
          "ui-not-disabled:active:bg-surface-neutral-subtle-hover",
          // dark
          "dark:ui-not-disabled:hover:bg-white/10",
          "dark:ui-not-disabled:active:bg-white/[0.15]",
        ],
      },
      link: {
        root: [
          "text-content-link border-color:transparent  !h-auto !p-0 text-underline-offset:2px ",
          "ui-not-disabled:hover:text-content-link-hover",
          "ui-not-disabled:active:text-content-link-active",
          "ui-not-disabled:hover:underline ui-not-disabled:focus-visible:underline",
        ],
      },
    },
    color: {
      primary: {},
      success: {},
      info: {},
      warning: {},
      danger: {},
      discovery: {},
    },
    size: {
      xs: {
        root: "h:1.5rem gap:0.25rem border-radius:0.25rem ",
        loadingContent: "gap:0.25rem",
      },
      sm: {
        root: "h:2rem gap:0.375rem border-radius:0.25rem ",
        loadingContent: "gap:0.375rem",
      },
      md: {
        root: "h:2.5rem gap:0.5rem border-radius:0.375rem ",
        loadingContent: "gap:0.5rem",
      },
      lg: {
        root: "h:3rem gap:0.625rem border-radius:0.5rem ",
        loadingContent: "gap:0.625rem",
      },
      xl: {
        root: "h:3.5rem gap:0.75rem rounded:10px",
        loadingContent: "gap:0.75rem",
      },
    },
    iconOnly: {
      true: {
        root: "padding:0  line-height:1 ",
      },
    },
    fullWidth: {
      true: {
        root: "flex width:100% ",
      },
      false: {
        root: "display:inline-flex ",
      },
    },
    loading: {
      true: {
        root: "opacity:0.8  user-select:none  pointer-events:none ",
      },
    },
  },
  compoundVariants: [
    // variant solid + color
    {
      variant: "solid",
      color: "primary",
      class: {
        root: [
          "text-content-on-primary bg-surface-primary border-surface-primary",
          "ui-not-disabled:hover:bg-surface-primary-hover ui-not-disabled:hover:border-surface-primary-hover",
          "ui-not-disabled:active:bg-surface-primary-active ui-not-disabled:active:border-surface-primary-active",
        ],
      },
    },
    {
      variant: "solid",
      color: "success",
      class: {
        root: [
          "text-content-on-success bg-surface-success border-surface-success",
          "ui-not-disabled:hover:bg-surface-success-hover ui-not-disabled:hover:border-surface-success-hover",
          "ui-not-disabled:active:bg-surface-success-active ui-not-disabled:active:border-surface-success-active",
        ],
      },
    },
    {
      variant: "solid",
      color: "info",
      class: {
        root: [
          "text-content-on-info bg-surface-info border-surface-info",
          "ui-not-disabled:hover:bg-surface-info-hover ui-not-disabled:hover:border-surface-info-hover",
          "ui-not-disabled:active:bg-surface-info-active ui-not-disabled:active:border-surface-info-active",
        ],
      },
    },
    {
      variant: "solid",
      color: "warning",
      class: {
        root: [
          "text-content-on-warning bg-surface-warning border-surface-warning",
          "ui-not-disabled:hover:bg-surface-warning-hover ui-not-disabled:hover:border-surface-warning-hover",
          "ui-not-disabled:active:bg-surface-warning-active ui-not-disabled:active:border-surface-warning-active",
        ],
      },
    },
    {
      variant: "solid",
      color: "danger",
      class: {
        root: [
          "text-content-on-danger bg-surface-danger border-surface-danger",
          "ui-not-disabled:hover:bg-surface-danger-hover ui-not-disabled:hover:border-surface-danger-hover",
          "ui-not-disabled:active:bg-surface-danger-active ui-not-disabled:active:border-surface-danger-active",
        ],
      },
    },
    {
      variant: "solid",
      color: "discovery",
      class: {
        root: [
          "text-content-on-discovery bg-surface-discovery border-surface-discovery",
          "ui-not-disabled:hover:bg-surface-discovery-hover ui-not-disabled:hover:border-surface-discovery-hover",
          "ui-not-disabled:active:bg-surface-discovery-active ui-not-disabled:active:border-surface-discovery-active",
        ],
      },
    },

    // variant soft + color
    {
      variant: "soft",
      color: "primary",
      class: {
        root: [
          "text-content-on-primary-subtle bg-surface-primary-subtle border-surface-primary-subtle",
          "ui-not-disabled:hover:bg-surface-primary-subtle-hover ui-not-disabled:hover:border-surface-primary-subtle-hover",
          "ui-not-disabled:active:bg-surface-primary-subtle-active ui-not-disabled:active:border-surface-primary-subtle-active",
        ],
      },
    },
    {
      variant: "soft",
      color: "success",
      class: {
        root: [
          "text-content-on-success-subtle bg-surface-success-subtle border-surface-success-subtle",
          "ui-not-disabled:hover:bg-surface-success-subtle-hover ui-not-disabled:hover:border-surface-success-subtle-hover",
          "ui-not-disabled:active:bg-surface-success-subtle-active ui-not-disabled:active:border-surface-success-subtle-active",
        ],
      },
    },
    {
      variant: "soft",
      color: "info",
      class: {
        root: [
          "text-content-on-info-subtle bg-surface-info-subtle border-surface-info-subtle",
          "ui-not-disabled:hover:bg-surface-info-subtle-hover ui-not-disabled:hover:border-surface-info-subtle-hover",
          "ui-not-disabled:active:bg-surface-info-subtle-active ui-not-disabled:active:border-surface-info-subtle-active",
        ],
      },
    },
    {
      variant: "soft",
      color: "warning",
      class: {
        root: [
          "text-content-on-warning-subtle bg-surface-warning-subtle border-surface-warning-subtle",
          "ui-not-disabled:hover:bg-surface-warning-subtle-hover ui-not-disabled:hover:border-surface-warning-subtle-hover",
          "ui-not-disabled:active:bg-surface-warning-subtle-active ui-not-disabled:active:border-surface-warning-subtle-active",
        ],
      },
    },
    {
      variant: "soft",
      color: "danger",
      class: {
        root: [
          "text-content-on-danger-subtle bg-surface-danger-subtle border-surface-danger-subtle",
          "ui-not-disabled:hover:bg-surface-danger-subtle-hover ui-not-disabled:hover:border-surface-danger-subtle-hover",
          "ui-not-disabled:active:bg-surface-danger-subtle-active ui-not-disabled:active:border-surface-danger-subtle-active",
        ],
      },
    },
    {
      variant: "soft",
      color: "discovery",
      class: {
        root: [
          "text-content-on-discovery-subtle bg-surface-discovery-subtle border-surface-discovery-subtle",
          "ui-not-disabled:hover:bg-surface-discovery-subtle-hover ui-not-disabled:hover:border-surface-discovery-subtle-hover",
          "ui-not-disabled:active:bg-surface-discovery-subtle-active ui-not-disabled:active:border-surface-discovery-subtle-active",
        ],
      },
    },

    // variant inverted + color
    {
      variant: "inverted",
      color: "primary",
      class: {
        root: [
          "text-surface-primary bg-content-on-primary border-color:transparent ",
          "ui-not-disabled:hover:bg-content-on-primary/90",
          "ui-not-disabled:active:bg-content-on-primary/80",
        ],
      },
    },
    {
      variant: "inverted",
      color: "success",
      class: {
        root: [
          "text-surface-success bg-content-on-success border-color:transparent ",
          "ui-not-disabled:hover:bg-content-on-success/90",
          "ui-not-disabled:active:bg-content-on-success/80",
        ],
      },
    },
    {
      variant: "inverted",
      color: "info",
      class: {
        root: [
          "text-surface-info bg-content-on-info border-color:transparent ",
          "ui-not-disabled:hover:bg-content-on-info/90",
          "ui-not-disabled:active:bg-content-on-info/80",
        ],
      },
    },
    {
      variant: "inverted",
      color: "warning",
      class: {
        root: [
          "text-surface-warning bg-content-on-warning border-color:transparent ",
          "ui-not-disabled:hover:bg-content-on-warning/90",
          "ui-not-disabled:active:bg-content-on-warning/80",
        ],
      },
    },
    {
      variant: "inverted",
      color: "danger",
      class: {
        root: [
          "text-surface-danger bg-content-on-danger border-color:transparent ",
          "ui-not-disabled:hover:bg-content-on-danger/90",
          "ui-not-disabled:active:bg-content-on-danger/80",
        ],
      },
    },
    {
      variant: "inverted",
      color: "discovery",
      class: {
        root: [
          "text-surface-discovery bg-content-on-discovery border-color:transparent ",
          "ui-not-disabled:hover:bg-content-on-discovery/90",
          "ui-not-disabled:active:bg-content-on-discovery/80",
        ],
      },
    },

    // variant + disabled
    {
      variant: ["solid", "soft", "inverted"],
      class: {
        root: "ui-disabled:bg-surface-disabled ui-disabled:border-surface-disabled",
      },
    },
    {
      variant: ["default", "dashed"],
      class: {
        root: "ui-disabled:bg-transparent ui-disabled:border-line-disabled",
      },
    },
    {
      variant: ["text", "link"],
      class: {
        root: "ui-disabled:bg-transparent ui-disabled:border-transparent",
      },
    },

    // button
    { iconOnly: false, fullWidth: false, class: { root: "width:auto " } },
    { size: "xs", iconOnly: false, class: { root: "px:0.5rem f:0.75rem lh:1rem", icon: "f:1rem lh:1.5rem" } },
    { size: "sm", iconOnly: false, class: { root: "px:0.625rem f:0.875rem lh:1.25rem", icon: "f:1.25rem lh:1.75rem" } },
    { size: "md", iconOnly: false, class: { root: "px:0.75rem f:1rem lh:1.5rem", icon: "f:1.5rem lh:2rem" } },
    { size: "lg", iconOnly: false, class: { root: "px:1rem f:1.25rem lh:1.75rem", icon: "text:28px" } },
    { size: "xl", iconOnly: false, class: { root: "px:1.25rem f:1.5rem lh:2rem", icon: "text:32px" } },

    // icon only button
    { size: "xs", iconOnly: true, class: { root: "f:1rem lh:1.5rem" } },
    { size: "sm", iconOnly: true, class: { root: "f:1.25rem lh:1.75rem" } },
    { size: "md", iconOnly: true, class: { root: "f:1.5rem lh:2rem" } },
    { size: "lg", iconOnly: true, class: { root: "text:28px" } },
    { size: "xl", iconOnly: true, class: { root: "text:32px" } },

    // squared icon only button
    { size: "xs", iconOnly: true, fullWidth: false, class: { root: "w:1.5rem" } },
    { size: "sm", iconOnly: true, fullWidth: false, class: { root: "w:2rem" } },
    { size: "md", iconOnly: true, fullWidth: false, class: { root: "w:2.5rem" } },
    { size: "lg", iconOnly: true, fullWidth: false, class: { root: "w:3rem" } },
    { size: "xl", iconOnly: true, fullWidth: false, class: { root: "w:3.5rem" } },
  ],
});

export type ButtonVariants = VariantProps<typeof buttonStyles>;
