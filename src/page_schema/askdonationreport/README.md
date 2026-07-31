# Ask Donation Report

This website slice provides a **signed-in** page where users choose a **pdfme template JSON file** locally, maintain a tabular list of donation fields, optionally import CSV, and generate **one PDF per row** with [pdfme](https://pdfme.com), packaged into a downloadable ZIP. PDF generation and row normalization run in the **browser**; only **CSV parsing** uses a named server function in Neo4j.

## Files

| File | Purpose |
|------|---------|
| `pages/AskDonationReportPage.hjson` | Page schema: route `/ask-donation-report`, **template JSON file** picker (client-side), editable table (always visible), CSV upload, Add row / Remove, Download ZIP. Normalizes rows in-page with **`_.z`** (Zod: record → canonical fields, trim strings, max 2000 rows) after CSV import and before ZIP. Loads `@pdfme/generator@6.1.11`, `@pdfme/schemas@6.1.11`, and `jszip` from esm.sh (always latest pinned; ignores template `pdfmeVersion`). |
| `functions/askDonationReportParseAndNormalizeCsv.hjson` | Server function `askDonationReportParseAndNormalizeCsv`: accepts `contextData.csvText`, parses comma- or tab-delimited CSV with quoted fields, maps headers case-insensitively to template columns, returns `{ rows, rowCount, missingColumns }` (cap 2000 rows). |
| `askdonationreport_template.json` | Example/reference pdfme **Template** JSON in-repo (`schemas`, `basePdf`, `pdfmeVersion`). Users load this (or any compatible export) via **Choose template** on the page — not served automatically. Field names in the schema must match the CSV/editor columns below. |
| `src/routes/api/askdonationreport/template.ts` | *(Optional)* HTTP **GET** for `/api/askdonationreport/template`; reads `askdonationreport_template.json` from disk. The page **does not** call it; kept if you want to fetch the same file from another tool or for debugging. |

## Template / CSV columns

These keys are used end-to-end (pdfme schema `name`, table cells, CSV headers):

`Date`, `Name`, `Address`, `Amount`, `AmountInWords`, `Mode` (payment), `No`, `PAN`, `Phone`

## Application flow

1. **Load page** (`/ask-donation-report`, `signinRequired: true`): the UI shows an empty table with one blank row, toolbar, and status text.
2. **Template**: user picks a **pdfme template** `.json` file (e.g. `askdonationreport_template.json` from this folder). It is parsed in the browser; `schemas` and `basePdf` are required.
3. **Edit data**: users type in cells, **Add row** / **Remove** per row, or **choose a CSV file** to replace the table via `askDonationReportParseAndNormalizeCsv` (then the page normalizes rows in the browser).
4. **Download ZIP**:
   - Rows are normalized again in the browser (same rules as before download).
   - Dynamic `import()` of `@pdfme/generator@6.1.11` + `@pdfme/schemas@6.1.11` (deps pinned) and `jszip` from CDN. Template `pdfmeVersion` is ignored so old exports (e.g. v5) cannot break generation.
   - For each row: `inputs = [{ ...fields }]` (single-page template → one object per PDF), then add a PDF named like `ASK UMARALA DONATION RECEIPT - <No> <Name>.pdf` (filesystem-safe; duplicate names get `_<rowIndex>` before `.pdf`).
   - Browser triggers download of the ZIP file.

## Operational notes

- **Schema import**: Page and the **CSV parse** Function vertex must exist in Neo4j (load/import graph so `askDonationReportParseAndNormalizeCsv` is present). Remove `askDonationReportValidateRows` from the DB if it was imported earlier.
- **Template file**: Use the in-repo `askdonationreport_template.json` or any pdfme export; large files are read only in the user’s browser.
- **Limits**: CSV import and in-browser normalization each enforce a **2000** row cap; very large ZIPs may be slow in the browser.
