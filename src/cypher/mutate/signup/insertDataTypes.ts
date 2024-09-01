import type { Transaction } from "neo4j-driver";

/**
 * @deprecated This function is deprecated and should not be used.
 */
export async function insertDataTypes(transaction: Transaction): Promise<void> {
  const query = `
    UNWIND [
      'Null', 'String', 'Boolean', 'Integer', 'Float', 
      'List', 'Map', 'Duration', 'Date', 'LocalTime', 
      'LocalDateTime', '->', '=>', '<-', '<='] AS dataTypeName
    MERGE (dt:DataType {key: dataTypeName})
  `;

  try {
    await transaction.run(query);
  } catch (error) {
    console.error("Error inserting data types:", error);
    throw error; // Re-throw the error to ensure the transaction is properly rolled back if needed
  }
}
