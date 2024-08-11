import type { Transaction } from "neo4j-driver";

import { componentsMap } from "~/components/form/functions/getDynamicComponent";

export async function insertComponents(transaction: Transaction): Promise<void> {
    const query = `
    UNWIND $keys AS key
    MERGE (k:Key {name: key})
    RETURN k;
  `;
  
    try {
      await transaction.run(query, { keys: Object.keys(componentsMap) });
    } catch (error) {
      console.error('Error inserting data types:', error);
      throw error; // Re-throw the error to ensure the transaction is properly rolled back if needed
    }
  }
  
  