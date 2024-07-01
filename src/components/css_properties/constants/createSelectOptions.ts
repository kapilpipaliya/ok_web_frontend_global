export const createSelectOptions = (
  name: string,
  label: string,
  options: any[],
  isLabelOnTop = false
) => ({
  component: "select",
  isLabelOnTop,
  label,
  name,
  options,
});
