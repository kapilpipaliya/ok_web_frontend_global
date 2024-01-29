import { tv, VariantProps } from "tailwind-variants";

import { inputFocusStyles } from "../utils/styles";

const baseInputStyles = [
  "appearance:none  position:relative ",
  "margin:0  width:100% ",
  "border-width:1px  border-style:solid  ui-not-invalid:border-line",
  "text-content bg-surface",
  "ui-not-disabled:placeholder:text-content-subtlest",
  "ui-not-disabled:ui-invalid:border-line-danger",
  "ui-disabled:text-content-disabled ui-disabled:bg-surface-disabled ui-disabled:border-line-disabled ui-disabled:opacity-50 ui-disabled:pointer-events-none ui-disabled:placeholder:text-content-disabled",
  inputFocusStyles,
];

const baseIconStyles = [
  "position:absolute  top:0px bottom:0px flex align-items:center  pointer-events:none ",
  "ui-disabled:text-icon-disabled ui-disabled:opacity-50",
];

export const textFieldStyles = tv({
  slots: {
    root: "group flex flex-direction:column  align-items:flex-start ",
    input: [...baseInputStyles],
    textArea: [...baseInputStyles, "height:100%  resize:both "],
    leadingIcon: [...baseIconStyles, "start-0 text-icon-subtler"],
    trailingIcon: [...baseIconStyles, "end-0 text-icon-subtler"],
    leadingSection: "position:absolute  top:0px bottom:0px start-0",
    trailingSection: "position:absolute  top:0px bottom:0px end-0",
    label: [
      "text-content font-weight:500 ",
      "ui-disabled:text-content-disabled ui-disabled:opacity-50 ui-disabled:pointer-events-none",
    ],
    supportText:
      "ui-disabled:text-content-disabled ui-disabled:opacity-50 ui-disabled:pointer-events-none",
    errorIcon: [
      "flex align-items:center  text-icon-danger",
      "ui-disabled:text-icon-disabled ui-disabled:opacity-50",
    ],
  },
  variants: {
    size: {
      sm: {
        input: "py:5px f:0.875rem lh:1.25rem",
        textArea: "py:5px px:0.5rem f:0.875rem lh:1.25rem border-radius:0.25rem ",
        leadingIcon: "ps-2 f:1rem lh:1.5rem",
        trailingIcon: "pe-2 f:1rem lh:1.5rem",
        label: "f:0.75rem lh:1rem",
        supportText: "f:0.75rem lh:1rem",
        errorIcon: "f:1rem lh:1.5rem",
      },
      md: {
        input: "py:7px f:1rem lh:1.5rem",
        textArea: "py:7px px:0.75rem f:1rem lh:1.5rem border-radius:0.375rem ",
        leadingIcon: "ps-3 f:1.25rem lh:1.75rem",
        trailingIcon: "pe-3 f:1.25rem lh:1.75rem",
        label: "f:0.875rem lh:1.25rem",
        supportText: "f:0.875rem lh:1.25rem",
        errorIcon: "f:1.25rem lh:1.75rem",
      },
      lg: {
        input: "py:9px f:1.125rem lh:1.75rem",
        textArea: "py:9px px:0.875rem f:1.125rem lh:1.75rem border-radius:0.5rem ",
        leadingIcon: "ps-3.5 f:1.5rem lh:2rem",
        trailingIcon: "pe-3.5 f:1.5rem lh:2rem",
        label: "f:1rem lh:1.5rem",
        supportText: "f:1rem lh:1.5rem",
        errorIcon: "f:1.5rem lh:2rem",
      },
    },
    hasLeadingIcon: {
      true: {},
      false: {},
    },
    hasTrailingIcon: {
      true: {},
      false: {},
    },
    hasLeadingAddon: {
      true: {
        input: "z:1:focus-visible",
      },
      false: {},
    },
    hasTrailingAddon: {
      true: {
        input: "z:1:focus-visible",
      },
      false: {},
    },
  },
  compoundVariants: [
    // size + no icons
    {
      size: "sm",
      hasLeadingIcon: false,
      class: { input: "ps:calc(var(--pg-text-field-leading-section-width)+8px)" },
    },
    {
      size: "sm",
      hasTrailingIcon: false,
      class: { input: "pe:calc(var(--pg-text-field-trailing-section-width)+8px)" },
    },
    {
      size: "md",
      hasLeadingIcon: false,
      class: { input: "ps:calc(var(--pg-text-field-leading-section-width)+12px)" },
    },
    {
      size: "md",
      hasTrailingIcon: false,
      class: { input: "pe:calc(var(--pg-text-field-trailing-section-width)+12px)" },
    },
    {
      size: "lg",
      hasLeadingIcon: false,
      class: { input: "ps:calc(var(--pg-text-field-leading-section-width)+14px)" },
    },
    {
      size: "lg",
      hasTrailingIcon: false,
      class: { input: "pe:calc(var(--pg-text-field-trailing-section-width)+14px)" },
    },

    // size + icons
    {
      size: "sm",
      hasLeadingIcon: true,
      class: { input: "ps:calc(var(--pg-text-field-leading-section-width)+28px)" },
    },
    {
      size: "sm",
      hasTrailingIcon: true,
      class: { input: "pe:calc(var(--pg-text-field-trailing-section-width)+28px)" },
    },
    {
      size: "md",
      hasLeadingIcon: true,
      class: { input: "ps:calc(var(--pg-text-field-leading-section-width)+40px)" },
    },
    {
      size: "md",
      hasTrailingIcon: true,
      class: { input: "pe:calc(var(--pg-text-field-trailing-section-width)+40px)" },
    },
    {
      size: "lg",
      hasLeadingIcon: true,
      class: { input: "ps:calc(var(--pg-text-field-leading-section-width)+48px)" },
    },
    {
      size: "lg",
      hasTrailingIcon: true,
      class: { input: "pe:calc(var(--pg-text-field-trailing-section-width)+48px)" },
    },

    // size + no addons
    { size: "sm", hasLeadingAddon: false, class: { input: "rounded-s" } },
    { size: "sm", hasTrailingAddon: false, class: { input: "rounded-e" } },
    { size: "md", hasLeadingAddon: false, class: { input: "rounded-s-md" } },
    { size: "md", hasTrailingAddon: false, class: { input: "rounded-e-md" } },
    { size: "lg", hasLeadingAddon: false, class: { input: "rounded-s-lg" } },
    { size: "lg", hasTrailingAddon: false, class: { input: "rounded-e-lg" } },
  ],
});

export type TextFieldVariants = VariantProps<typeof textFieldStyles>;
