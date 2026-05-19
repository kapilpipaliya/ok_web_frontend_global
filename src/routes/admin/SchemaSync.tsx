import SchemaJobRunner from "~/pages/admin/schema/SchemaJobRunner";

export default function AdminSchemaSync() {
  return (
    <SchemaJobRunner title="Sync schema to all Shopify shop databases" apiPath="/api/schema/sync" />
  );
}
