import SchemaJobRunner from "~/pages/admin/schema/SchemaJobRunner";

export default function AdminSchemaMigrate() {
  return (
    <SchemaJobRunner
      title="Run database migration"
      apiPath="/api/schema/migrate"
    />
  );
}
