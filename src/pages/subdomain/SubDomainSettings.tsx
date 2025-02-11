import { AddSubDomainForm } from "./AddSubDomainForm";
import { SubDomainGrid } from "./SubDomainGrid";

export function SubDomainSettings() {
  return (
    <div>
      <div class="display:flex jc:space-between ai:center mb:4">
        <h2 class="m:0">SubDomain Management</h2>
        <AddSubDomainForm
          onSuccess={() => { }}
        />
      </div>
      <SubDomainGrid />
    </div>
  );
} 