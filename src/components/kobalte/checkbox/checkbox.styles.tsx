import { tv, VariantProps } from "tailwind-variants";

export const checkboxStyles = tv({
  slots: {
    root: "group display:inline-flex  flex-direction:column  align-items:flex-start ",
    input: "peer",
    control: [
      "display:inline-flex  justify-content:center  align-items:center  flex-grow:0  shrink:0  border-width:1px  border-style:solid  ~property:color,bg,border-color,text-decoration-color,fill,stroke ~easing:cubic-bezier(0.4,0,0.2,1) ~duration:150ms",
      "ui-not-disabled:text-content-on-primary",
      "bg-surface ui-not-invalid:border-line",
      "ui-not-disabled:group-hover/action:bg-surface-neutral-subtle",
      "ui-disabled:border-line-disabled ui-disabled:text-content-disabled ui-disabled:opacity-50 ui-disabled:pointer-events-none",
      "peer-focus-visible:outline peer-focus-visible:outline-ring peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",

      // checked
      "ui-not-disabled:ui-checked:bg-surface-primary ui-not-disabled:group-hover/action:ui-checked:bg-surface-primary-hover ui-not-disabled:group-active/action:ui-checked:bg-surface-primary-active",
      "ui-not-disabled:ui-checked:border-surface-primary ui-not-disabled:group-hover/action:ui-checked:border-surface-primary-hover ui-not-disabled:group-active/action:ui-checked:border-surface-primary-active",
      "ui-disabled:ui-checked:bg-surface-disabled",
      // indeterminate
      "ui-not-disabled:ui-indeterminate:bg-surface-primary ui-not-disabled:group-hover/action:ui-indeterminate:bg-surface-primary-hover ui-not-disabled:group-active/action:ui-indeterminate:bg-surface-primary-active",
      "ui-not-disabled:ui-indeterminate:border-surface-primary ui-not-disabled:group-hover/action:ui-indeterminate:border-surface-primary-hover ui-not-disabled:group-active/action:ui-indeterminate:border-surface-primary-active",
      "ui-disabled:ui-indeterminate:bg-surface-disabled",

      // invalid
      "ui-not-disabled:ui-invalid:text-content-on-danger",
      "ui-not-disabled:ui-invalid:border-surface-danger",
      // invalid checked
      "ui-not-disabled:ui-invalid:ui-checked:bg-surface-danger ui-not-disabled:ui-invalid:group-hover/action:ui-checked:bg-surface-danger-hover ui-not-disabled:ui-invalid:group-active/action:ui-checked:bg-surface-danger-active",
      "ui-not-disabled:ui-invalid:ui-checked:border-surface-danger ui-not-disabled:ui-invalid:group-hover/action:ui-checked:border-surface-danger-hover ui-not-disabled:ui-invalid:group-active/action:ui-checked:border-surface-danger-active",
      // invalid indeterminate
      "ui-not-disabled:ui-invalid:ui-indeterminate:bg-surface-danger ui-not-disabled:ui-invalid:group-hover/action:ui-indeterminate:bg-surface-danger-hover ui-not-disabled:ui-invalid:group-active/action:ui-indeterminate:bg-surface-danger-active",
      "ui-not-disabled:ui-invalid:ui-indeterminate:border-surface-danger ui-not-disabled:ui-invalid:group-hover/action:ui-indeterminate:border-surface-danger-hover ui-not-disabled:ui-invalid:group-active/action:ui-indeterminate:border-surface-danger-active",
    ],
    icon: "display:inline-flex  justify-content:center  align-items:center ",
    actionWrapper: "flex align-items:center  group/action",
    label: [
      "text-content",
      "ui-disabled:text-content-disabled ui-disabled:opacity-50 ui-disabled:pointer-events-none",
    ],
    supportTextWrapper: "flex flex-direction:column  align-items:flex-start  flex-grow:1  shrink:1 ",
    supportText:
      "ui-disabled:text-content-disabled ui-disabled:opacity-50 ui-disabled:pointer-events-none",
    errorIcon: [
      "flex align-items:center  text-icon-danger",
      "ui-disabled:text-icon-disabled ui-disabled:opacity-50",
    ],
  },
  variants: {
    size: {
      md: {
        root: "gap-y:0.125rem",
        control: "h:1rem w:1rem f:1rem lh:1.5rem border-radius:0.25rem ",
        label: "ps-2 f:0.875rem lh:1.25rem",
        supportTextWrapper: "ps-6 gap-y:0.125rem",
        supportText: "f:0.875rem lh:1.25rem",
        errorIcon: "f:1.25rem lh:1.75rem",
      },
      lg: {
        root: "gap-y:0.25rem",
        control: "h:1.25rem w:1.25rem f:1.25rem lh:1.75rem border-radius:0.25rem ",
        label: "ps-3 f:1rem lh:1.5rem",
        supportTextWrapper: "ps-8 gap-y:0.25rem",
        supportText: "f:1rem lh:1.5rem",
        errorIcon: "f:1.5rem lh:2rem",
      },
    },
  },
});

export type CheckboxVariants = VariantProps<typeof checkboxStyles>;
