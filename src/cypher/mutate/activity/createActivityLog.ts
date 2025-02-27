import type { Session } from "neo4j-driver";

export async function createActivityLog(
  dbSession: Session,
  action: string,
  entityType: string,
  entityId: string,
  updatedByEmail: string,
  details?: string,
) {
  await dbSession.run(
    `CREATE (a:Activity {
      action: $action,
      entityType: $entityType,
      entityId: $entityId,
      updatedBy: $updatedByEmail,
      createdAt: datetime(),
      details: $details
    })`,
    {
      action,
      details: details ?? null,
      entityId,
      entityType,
      updatedByEmail,
    },
  );
}
