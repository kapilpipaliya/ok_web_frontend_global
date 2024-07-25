import { ClientCard } from './ClientCard';

export function AdminDashBoard() {
  return (
    <div class="mx:auto max-width:80rem px:1rem px:1.5rem@sm px:2rem@lg">
      <div class="mx:auto max-width:42rem mx:0@lg max-width:none@lg">
        <div class="flex align-items:center justify-content:space-between">
          <h2 class="f:1rem lh:1.5rem font-weight:600 leading:1.75rem color:gray-90">Recent clients</h2>
          <a href="#" class="f:0.875rem lh:1.25rem font-weight:600 leading:1.5rem color:indigo-60 color:indigo-50:hover">View all<span class="sr-only">, clients</span></a>
        </div>
        <ul role="list" class="mt:1.5rem display:grid grid-cols:1 gap-x:1.5rem gap-y:2rem grid-cols:3@lg gap-x:2rem@xl">
          <ClientCard
            imgSrc="https://tailwindui.com/img/logos/48x48/tuple.svg"
            clientName="Tuple"
            lastInvoiceDate="December 13, 2022"
            amount="$2,000.00"
            status="Overdue" />
          <ClientCard
            imgSrc="https://tailwindui.com/img/logos/48x48/savvycal.svg"
            clientName="SavvyCal"
            lastInvoiceDate="January 22, 2023"
            amount="$14,000.00"
            status="Paid" />
          <ClientCard
            imgSrc="https://tailwindui.com/img/logos/48x48/reform.svg"
            clientName="Reform"
            lastInvoiceDate="January 23, 2023"
            amount="$7,600.00"
            status="Paid" />
        </ul>
      </div>
    </div>
  );
}
