
// Need to fix Layout
export const isPageDesignerPath = (path: string) => {
  const lowerPath = path.toLowerCase();
  const pageDesignerPath = [
    "/admin/page/",
    "/admin/form/",
    "/admin/template/",
    "/admin/thankyou/",
  ];

  return pageDesignerPath.some((Path) => lowerPath.includes(Path));
};
