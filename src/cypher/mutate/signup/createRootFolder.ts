import type { Session, Transaction } from "neo4j-driver";

export async function createRootFolder(
  tx: Session | Transaction,
): Promise<void> {
  const query = `
    MERGE (:Folder {key: 'Root'})
    MERGE (:Comp {key: 'Root'})
    MERGE (:Comp {key: 'ArkUI'})
  `;

  try {
    await tx.run(query);
  } catch (error) {
    console.error("Error creating root folder or root comp:", error);
    throw error;
  }
}
