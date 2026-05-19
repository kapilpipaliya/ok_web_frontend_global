import SchemaJobRunner from "~/pages/admin/schema/SchemaJobRunner";

export default function AdminSchemaImport() {
  return (
    <SchemaJobRunner title="Import schema from files" apiPath="/api/schema/import" />
  );
}
