import {SchemaRenderer} from "~/pages/SchemaRenderer";
import {accountDeletionForm} from "~/routes/internal/page/(email)/(templates)/(account)/accountDeletionSchema";

export default function AccountDeletion() {
  return <SchemaRenderer form={accountDeletionForm} />;
} 