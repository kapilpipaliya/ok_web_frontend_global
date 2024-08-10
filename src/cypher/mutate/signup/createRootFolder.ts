import type { TransactionPromise } from "neo4j-driver-core";

export async function createRootFolder(tx: TransactionPromise): Promise<void> {
  const query = `
    CREATE (:Folder {name: 'root'})
  `;

  try {
    await tx.run(query);
  } catch (error) {
    console.error("Error creating root folder:", error);
    throw error;
  }
}
