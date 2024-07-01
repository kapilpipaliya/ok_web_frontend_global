export const createButtonGroupOptions = (
  name: string,
  label: string,
  iconOptions: any[],
  isLabelOnTop = true
) => ({
  component: "buttonGroups",
  isLabelOnTop,
  label,
  name,
  options: iconOptions.map(({ key, tooltip, value }) => ({
    icon: true,
    key,
    tooltip,
    value,
  })),
});
