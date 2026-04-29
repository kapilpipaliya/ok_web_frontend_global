# Ask Donation Report

This website slice provides a **signed-in** page where users maintain a tabular list of donation fields, optionally import CSV, and generate **one PDF per row** with [pdfme](https://pdfme.com), packaged into a downloadable ZIP. PDF generation runs in the browser via CDN; CSV parsing and row validation run as **named server functions** in Neo4j.

## Files

| File | Purpose |
|------|---------|
| `pages/AskDonationReportPage.hjson` | Page schema: route `/ask-donation-report`, editable table (always visible), CSV upload, Add row / Remove, Validate, Download ZIP. Loads `@pdfme/generator` and `jszip` from esm.sh, fetches the JSON template from the API, loops `generate({ template, inputs })` per row. |
| `functions/askDonationReportParseAndNormalizeCsv.hjson` | Server function `askDonationReportParseAndNormalizeCsv`: accepts `contextData.csvText`, parses comma- or tab-delimited CSV with quoted fields, maps headers case-insensitively to template columns, returns `{ rows, rowCount, missingColumns }` (cap 2000 rows). |
| `functions/askDonationReportValidateRows.hjson` | Server function `askDonationReportValidateRows`: accepts `contextData.rows`, normalizes each row to the eight string fields via Zod, returns `{ rows, rowCount }` (cap 2000 rows). |
| `askdonationreport_template.json` | pdfme **Template** JSON (`schemas`, `basePdf`, `pdfmeVersion`). Field names in the schema must match the CSV/editor columns below. Large `basePdf` is stored as base64 in this file. |
| `src/routes/api/askdonationreport/template.ts` | HTTP **GET** handler for `/api/askdonationreport/template`. Reads `askdonationreport_template.json` from disk and returns it as JSON. Requires an authenticated session (`401` if not signed in). Used by the page so the browser does not embed the huge template. |

## Template / CSV columns

These keys are used end-to-end (pdfme schema `name`, table cells, CSV headers):

`Date`, `Name`, `Address`, `Amount`, `AmountInWords`, `No`, `PAN`, `Phone`

## Application flow

1. **Load page** (`/ask-donation-report`, `signinRequired: true`): the UI shows an empty table with one blank row, toolbar, and status text.
2. **Edit data**: users type in cells, **Add row** / **Remove** per row, or **choose a CSV file** to replace the table via `askDonationReportParseAndNormalizeCsv`.
3. **Validate (optional)**: **Validate on server** sends the current `rows` to `askDonationReportValidateRows` and replaces local state with the normalized result.
4. **Download ZIP**:
   - `fetch("/api/askdonationreport/template")` (cookies/session) loads the template JSON.
   - Dynamic `import()` of `@pdfme/generator` (v aligned with `pdfmeVersion` in the template) and `jszip` from CDN.
   - For each row: `inputs = [{ ...fields }]` (single-page template → one object per PDF), then add `donation-<sanitized No or index>.pdf` to the ZIP.
   - Browser triggers download of the ZIP file.

## Operational notes

- **Schema import**: Page and Function vertices must exist in Neo4j (same process as other `page_schema` websites: load/import graph so `Function` keys match the names above).
- **API URL**: The page calls `/api/askdonationreport/template`; keep that route and the template file path in sync with `template.ts`.
- **Limits**: Server functions enforce a **2000** row cap; very large ZIPs may be slow in the browser.
