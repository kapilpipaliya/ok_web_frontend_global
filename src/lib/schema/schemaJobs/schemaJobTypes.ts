export interface ExportJobPayload {
  filterOnly: boolean;
  includeComponentKeys: string[];
  includePageKeys: string[];
  includeFunctionKeys: string[];
}

export interface ImportJobPayload {
  filterOnly: boolean;
  includeComponentKeys: string[];
  includePageKeys: string[];
  includeFunctionKeys: string[];
  currentShop: string | null;
}

export interface MigrateJobPayload {
  dryRun: boolean;
  functionName: string | null;
}

/** Payload stored on BullMQ for schema export/import/sync/migrate workers. */
export type SchemaJobQueueData =
  | {
      operation: "export";
      databaseName: string;
      subDomain: string;
      userEmail: string;
      payload: ExportJobPayload;
    }
  | {
      operation: "import";
      databaseName: string;
      subDomain: string;
      userEmail: string;
      payload: ImportJobPayload;
    }
  | {
      operation: "sync";
      databaseName: string;
      subDomain: string;
      userEmail: string;
    }
  | {
      operation: "migrate";
      databaseName: string;
      subDomain: string;
      userEmail: string;
      payload: MigrateJobPayload;
    };
