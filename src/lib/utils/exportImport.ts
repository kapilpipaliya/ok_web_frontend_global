/**
 * Data Export/Import
 *
 * CSV and Excel export/import utilities with validation
 */

import type { z } from "zod";

/**
 * Export format
 */
export type ExportFormat = "csv" | "json" | "excel";

/**
 * Import options
 */
export interface ImportOptions {
  mapping?: Record<string, string>; // Column name mapping
  validate?: z.ZodSchema; // Validation schema
  skipHeader?: boolean;
  delimiter?: string; // CSV delimiter (default: ",")
  transform?: (row: any) => any; // Row transformation
}

/**
 * Export options
 */
export interface ExportOptions {
  fields?: string[]; // Fields to export
  headers?: Record<string, string>; // Custom headers
  delimiter?: string; // CSV delimiter (default: ",")
  includeHeaders?: boolean; // Include header row (default: true)
  transform?: (row: any) => any; // Row transformation
}

/**
 * Import result
 */
export interface ImportResult<T = any> {
  success: boolean;
  data: T[];
  errors: Array<{ row: number; error: string; data?: any }>;
  total: number;
  imported: number;
  failed: number;
}

/**
 * Convert to CSV
 */
export function toCSV(data: any[], options: ExportOptions = {}): string {
  if (data.length === 0) {
    return "";
  }

  const delimiter = options.delimiter || ",";
  const includeHeaders = options.includeHeaders !== false;
  const fields = options.fields || Object.keys(data[0]);
  const headers = options.headers || {};

  const lines: string[] = [];

  // Add header row
  if (includeHeaders) {
    const headerRow = fields
      .map((field) => {
        const header = headers[field] || field;
        return escapeCSV(header);
      })
      .join(delimiter);
    lines.push(headerRow);
  }

  // Add data rows
  for (let row of data) {
    // Transform if needed
    if (options.transform) {
      row = options.transform(row);
    }

    const values = fields.map((field) => {
      const value = row[field];
      return escapeCSV(value == null ? "" : String(value));
    });

    lines.push(values.join(delimiter));
  }

  return lines.join("\n");
}

/**
 * Escape CSV value
 */
function escapeCSV(value: string): string {
  // If value contains delimiter, quotes, or newlines, wrap in quotes
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Parse CSV
 */
export function parseCSV(
  csv: string,
  options: ImportOptions = {},
): ImportResult {
  const delimiter = options.delimiter || ",";
  const skipHeader = options.skipHeader;

  const lines = csv.split("\n").filter((line) => line.trim());
  const result: ImportResult = {
    success: true,
    data: [],
    errors: [],
    total: lines.length - (skipHeader ? 0 : 1),
    imported: 0,
    failed: 0,
  };

  if (lines.length === 0) {
    return result;
  }

  // Parse header
  const headers = parseCSVLine(lines[0], delimiter);
  const startIndex = skipHeader ? 0 : 1;

  // Parse data rows
  for (let i = startIndex; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter);

    try {
      // Create object from values
      const row: Record<string, any> = {};

      for (let j = 0; j < headers.length; j++) {
        const key = skipHeader ? `column${j}` : headers[j];
        const mappedKey = options.mapping?.[key] || key;
        row[mappedKey] = values[j] || "";
      }

      // Transform if needed
      let transformedRow = row;
      if (options.transform) {
        transformedRow = options.transform(row);
      }

      // Validate if schema provided
      if (options.validate) {
        const validated = options.validate.parse(transformedRow);
        result.data.push(validated);
      } else {
        result.data.push(transformedRow);
      }

      result.imported++;
    } catch (error) {
      result.errors.push({
        row: i + 1,
        error: error instanceof Error ? error.message : "Parse error",
        data: values,
      });
      result.failed++;
      result.success = false;
    }
  }

  return result;
}

/**
 * Parse single CSV line
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // End of value
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  // Add last value
  values.push(current);

  return values;
}

/**
 * Convert to JSON
 */
export function toJSON(data: any[], options: ExportOptions = {}): string {
  let exportData = data;

  // Apply field filtering
  if (options.fields) {
    exportData = data.map((row) => {
      const filtered: Record<string, any> = {};
      for (const field of options.fields!) {
        filtered[field] = row[field];
      }
      return filtered;
    });
  }

  // Apply transformation
  if (options.transform) {
    exportData = exportData.map(options.transform);
  }

  return JSON.stringify(exportData, null, 2);
}

/**
 * Parse JSON
 */
export function parseJSON<T = any>(
  json: string,
  options: ImportOptions = {},
): ImportResult<T> {
  const result: ImportResult<T> = {
    success: true,
    data: [],
    errors: [],
    total: 0,
    imported: 0,
    failed: 0,
  };

  try {
    const parsed = JSON.parse(json);
    const dataArray = Array.isArray(parsed) ? parsed : [parsed];
    result.total = dataArray.length;

    for (let i = 0; i < dataArray.length; i++) {
      try {
        let row = dataArray[i];

        // Apply mapping
        if (options.mapping) {
          const mapped: Record<string, any> = {};
          for (const [from, to] of Object.entries(options.mapping)) {
            mapped[to] = row[from];
          }
          row = mapped;
        }

        // Transform if needed
        if (options.transform) {
          row = options.transform(row);
        }

        // Validate if schema provided
        if (options.validate) {
          const validated = options.validate.parse(row);
          result.data.push(validated);
        } else {
          result.data.push(row);
        }

        result.imported++;
      } catch (error) {
        result.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : "Parse error",
          data: dataArray[i],
        });
        result.failed++;
        result.success = false;
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push({
      row: 0,
      error: error instanceof Error ? error.message : "JSON parse error",
    });
  }

  return result;
}

/**
 * Export data to specified format
 */
export function exportData(
  data: any[],
  format: ExportFormat,
  options: ExportOptions = {},
): string {
  switch (format) {
    case "csv":
      return toCSV(data, options);
    case "json":
      return toJSON(data, options);
    case "excel":
      // For Excel, we'll export as CSV (can be opened in Excel)
      // A full Excel implementation would require a library like xlsx
      return toCSV(data, options);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Import data from specified format
 */
export function importData<T = any>(
  content: string,
  format: ExportFormat,
  options: ImportOptions = {},
): ImportResult<T> {
  switch (format) {
    case "csv":
    case "excel":
      return parseCSV(content, options) as ImportResult<T>;
    case "json":
      return parseJSON<T>(content, options);
    default:
      throw new Error(`Unsupported import format: ${format}`);
  }
}

/**
 * Download helper (browser only)
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType = "text/plain",
): void {
  if (typeof window === "undefined") {
    throw new Error("downloadFile only works in browser");
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export/import helper factory
 */
export const dataExport = {
  /**
   * Export to CSV
   */
  toCSV,

  /**
   * Export to JSON
   */
  toJSON,

  /**
   * Export to format
   */
  export: exportData,

  /**
   * Download as file
   */
  download: (
    data: any[],
    filename: string,
    format: ExportFormat = "csv",
    options?: ExportOptions,
  ) => {
    const content = exportData(data, format, options);
    const mimeTypes = {
      csv: "text/csv",
      json: "application/json",
      excel: "application/vnd.ms-excel",
    };
    downloadFile(content, filename, mimeTypes[format]);
  },
};

export const dataImport = {
  /**
   * Parse CSV
   */
  fromCSV: parseCSV,

  /**
   * Parse JSON
   */
  fromJSON: parseJSON,

  /**
   * Import from format
   */
  import: importData,

  /**
   * Read from file (browser only)
   */
  fromFile: async (
    file: File,
    format: ExportFormat,
    options?: ImportOptions,
  ) => {
    const content = await file.text();
    return importData(content, format, options);
  },
};
