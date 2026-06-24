/**
 * Write-side orchestration contracts — mutations drive signature invalidation.
 */

export const MUTATION_EVENT_TYPES = [
  "ENTITY_CREATED",
  "ENTITY_UPDATED",
  "ENTITY_DELETED",
  "RELATION_CREATED",
  "RELATION_REMOVED",
] as const;

export type MutationEventType = (typeof MUTATION_EVENT_TYPES)[number];

export type MutationEvent = {
  version?: number;
  type: MutationEventType;
  entityType?: string;
  entityId?: string;
  querySignatures?: string[];
  logicalKeys?: string[];
  payload?: Record<string, unknown>;
};

/** Map entity labels to logical query keys used in widget configs. */
export function resolveMutationInvalidationTargets(event: MutationEvent): {
  querySignatures: string[];
  logicalKeys: string[];
} {
  const querySignatures = [...(event.querySignatures || [])];
  const logicalKeys = [...(event.logicalKeys || [])];

  if (event.entityType) {
    logicalKeys.push(`entity:${event.entityType}`);
  }

  return {
    querySignatures: [...new Set(querySignatures)],
    logicalKeys: [...new Set(logicalKeys)],
  };
}

export function normalizeMutationEvent(
  raw: MutationEvent | null | undefined,
): MutationEvent | null {
  if (!raw?.type) return null;
  const type = String(raw.type).toUpperCase() as MutationEventType;
  if (!MUTATION_EVENT_TYPES.includes(type)) return null;
  return {
    version: Number(raw.version ?? 1),
    type,
    entityType: raw.entityType,
    entityId: raw.entityId,
    querySignatures: raw.querySignatures,
    logicalKeys: raw.logicalKeys,
    payload: raw.payload,
  };
}
