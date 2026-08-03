/**
 * Soft failures in a completed schema job returnvalue (Bull status stays success).
 * Used so the admin UI can show "Complete with error".
 */

export type SchemaJobResultIssueSummary = {
  message: string;
  details: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as Record<string, unknown>;
}

function failureMessageFromObject(
  obj: Record<string, unknown> | null,
): string | null {
  if (!obj) {
    return null;
  }
  if (typeof obj.message === "string" && obj.message.trim()) {
    return obj.message;
  }
  if (typeof obj.error === "string" && obj.error.trim()) {
    return obj.error;
  }
  return null;
}

function getParseIssueSummary(
  result: Record<string, unknown>,
): SchemaJobResultIssueSummary | null {
  const detailsObj = asRecord(result.details);
  if (!detailsObj) {
    return null;
  }
  const parseErrors = detailsObj.parseErrors;
  if (!Array.isArray(parseErrors) || parseErrors.length === 0) {
    return null;
  }
  const first = asRecord(parseErrors[0]);
  const firstPath =
    first?.websiteName && first?.schemaType && first?.fileName
      ? `${first.websiteName}/${first.schemaType}/${first.fileName}`
      : "unknown file";
  const firstMessage = first?.message ? `: ${first.message}` : "";
  return {
    message: `${parseErrors.length} schema file(s) failed to parse and were skipped`,
    details: `First parse error at ${firstPath}${firstMessage}`,
  };
}

function getMigrationIssueSummary(
  result: Record<string, unknown>,
): SchemaJobResultIssueSummary | null {
  const migration = asRecord(result.migration);
  if (!migration) {
    return null;
  }
  const data = asRecord(migration.data);
  const dataFailed = data?.success === false;
  if (migration.success !== false && !dataFailed) {
    return null;
  }
  const fn =
    typeof migration.functionName === "string" && migration.functionName
      ? ` (${migration.functionName})`
      : "";
  const details =
    failureMessageFromObject(migration) ||
    failureMessageFromObject(data) ||
    "Post-import migration reported failure";
  return {
    message: `Migration failed${fn}`,
    details,
  };
}

function getNestedDataIssueSummary(
  result: Record<string, unknown>,
): SchemaJobResultIssueSummary | null {
  // Migrate job shape: { success: true, data: { success: false, message } }
  if (result.success !== true) {
    return null;
  }
  const data = asRecord(result.data);
  if (!data || data.success !== false) {
    return null;
  }
  return {
    message: "Completed with error",
    details:
      failureMessageFromObject(data) ||
      "Operation reported failure in result data",
  };
}

export function getSchemaJobResultIssueSummary(
  result: unknown,
): SchemaJobResultIssueSummary | null {
  const record = asRecord(result);
  if (!record) {
    return null;
  }

  const migrationIssue = getMigrationIssueSummary(record);
  if (migrationIssue) {
    return migrationIssue;
  }

  const nestedDataIssue = getNestedDataIssueSummary(record);
  if (nestedDataIssue) {
    return nestedDataIssue;
  }

  if (record.success === false) {
    return {
      message:
        failureMessageFromObject(record) || "Operation completed with failure",
      details: null,
    };
  }

  return getParseIssueSummary(record);
}
