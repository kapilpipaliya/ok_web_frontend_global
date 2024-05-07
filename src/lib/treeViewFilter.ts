import { navbarDataI } from "../components/layout/Sidebar";

function treeViewFilter(
  nodes: navbarDataI[],
  cb: (node: navbarDataI) => boolean,
): any {
  return nodes
    .map((node) => {
      if (cb(node)) return node;
      const children = treeViewFilter(node.children || [], cb);
      return children.length && { ...node, children };
    })
    .filter(Boolean);
}
export default treeViewFilter;
