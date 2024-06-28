import type { TransactionPromise } from "neo4j-driver-core";
import { getSessionForSubdomain } from "~/cypher/get/getSessionForSubdomain";

export async function retryTransaction(
  
  callback: (
    tx: TransactionPromise,) => Promise<any>,
  maxRetries: number
): Promise<any> {

  let attempt = 0;
  do {
    const session = await getSessionForSubdomain();
    const tx = session.beginTransaction();
    try {
      return await callback(tx);
    } catch (error: any) {
      console.log('Error message:', error.message);
      if (error.message.includes("Cannot resolve conflicting transactions. You can retry this transaction when the conflicting transaction is finished")) {
        attempt++;
        if (attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed. Retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 1 second before retrying
        } else {
          // console.error('Max retries reached. Could not handle mutation object.');
          return { error: 'Max retries reached. Could not handle mutation object.' };
        }
      } else {
        console.error('Failed to handle mutation object:', error);
        throw error;
      }
    } finally {
      await tx.rollback();
      await tx.close();
      await session.close();
    }
  } while (attempt < maxRetries);
}
