import SchemaJobRunner from "~/pages/admin/schema/SchemaJobRunner";

export default function AdminSchemaExport() {
  return (
    <SchemaJobRunner title="Export schema to files" apiPath="/api/schema/export" />
  );
}
