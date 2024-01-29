import { tv, VariantProps } from "tailwind-variants";

export const inputAddonStyles = tv({
  slots: {
    root: "flex align-items:center  by:1px border-style:solid  border-line text-content-subtle bg-surface-neutral-subtle",
  },
  variants: {
    size: {
      sm: {
        root: "px:0.5rem f:0.875rem lh:1.25rem",
      },
      md: {
        root: "px:0.75rem f:1rem lh:1.5rem",
      },
      lg: {
        root: "px:0.875rem f:1.125rem lh:1.75rem",
      },
    },
    placement: {
      center: {},
      leading: {
        root: "border-s",
      },
      trailing: {
        root: "border-e",
      },
    },
  },
  compoundVariants: [
    // size + placement
    { size: "sm", placement: "leading", class: { root: "rounded-s" } },
    { size: "sm", placement: "trailing", class: { root: "rounded-e" } },

    { size: "md", placement: "leading", class: { root: "rounded-s-md" } },
    { size: "md", placement: "trailing", class: { root: "rounded-e-md" } },

    { size: "lg", placement: "leading", class: { root: "rounded-s-lg" } },
    { size: "lg", placement: "trailing", class: { root: "rounded-e-lg" } },
  ],
});

export type InputAddonVariants = VariantProps<typeof inputAddonStyles>;
