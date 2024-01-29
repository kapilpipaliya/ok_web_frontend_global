import { tv, VariantProps } from "tailwind-variants";

export const surfaceStyles = tv({
  slots: {
    root: "border-style:solid ",
  },
  variants: {
    variant: {
      default: {
        root: "text-content-on-surface bg-surface",
      },
      raised: {
        root: "text-content-on-surface bg-surface-raised box-shadow:0|1px|3px|0|rgba(0,0,0,0.1),0|1px|2px|0|rgba(0,0,0,0.06)  box-shadow:none@dark",
      },
      subtle: {
        root: "text-content-on-surface bg-surface-sunken",
      },
      sunken: {
        root: "text-content-on-surface bg-surface-sunken box-shadow:inset|0|2px|4px|0|rgba(0,0,0,0.06) ",
      },
    },
    border: {
      none: {
        root: "border-width:0 ",
      },
      start: {
        root: "border-s border-line-subtle",
      },
      end: {
        root: "border-e border-line-subtle",
      },
      top: {
        root: "border-top-width:1px  border-line-subtle",
      },
      bottom: {
        root: "border-bottom-width:1px  border-line-subtle",
      },
      x: {
        root: "bx:1px border-line-subtle",
      },
      y: {
        root: "by:1px border-line-subtle",
      },
      all: {
        root: "border-width:1px  border-line-subtle",
      },
    },
  },
});

export type SurfaceVariants = VariantProps<typeof surfaceStyles>;
