import type { TransactionPromise } from "neo4j-driver-core";

export async function createRootFolder(tx: TransactionPromise): Promise<void> {
  const query = `
    MERGE (:Folder {name: 'root'})
    MERGE (:Comp {name: 'root'})
  `;

  try {
    await tx.run(query);
  } catch (error) {
    console.error("Error creating root folder or root comp:", error);
    throw error;
  }
}
