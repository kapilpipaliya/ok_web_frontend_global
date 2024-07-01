export const createGridOptions = (name: string, label: string, children: any) => ({
  children,
  component: "grid",
  gap: "5px 10px",
  "grid-template-columns": "repeat(2, auto)",
  name,
  padding: "5px",
});
