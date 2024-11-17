import type { Session, Transaction } from "neo4j-driver";

import { componentsMap } from "~/components/form/functions/getDynamicComponent";

import { getComponentTree } from "../sync/component_tree/convertToJson";
import { insertComponentTree } from "../sync/component_tree/insertComonentTree";

export async function insertComponents(superTx: Session | Transaction) {
  const response = await insertComponentTree(superTx, getComponentTree());
  if (!response.success) {
    return response;
  }

  /* Now we not need this:
  const componentTree = {
    children: Object.keys(componentsMap).map((key) => ({
      children: [],
      Component: key,
    })),
    Component: "Root",
  };
  const response2 = await insertComponentTree(superTx, [componentTree]);
  if (!response2.success) {
    return response2;
  }
  */

  return { success: true };
}
