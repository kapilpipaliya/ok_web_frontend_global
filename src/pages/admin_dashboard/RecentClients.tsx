import { SimpleCard } from './SimpleCard';

export function AdminDashBoard() {
  return (
    <div class="max-width:80rem mx:auto px:1rem px:1.5rem@sm px:2rem@lg">
      <div class="max-width:42rem max-width:none@lg mx:auto mx:0@lg">
        <div class="flex align-items:center justify-content:space-between">
          <h2 class="lh:1.5rem color:gray-90 f:1rem font-weight:600 leading:1.75rem">Recent Users</h2>
          <a class="lh:1.25rem color:indigo-60 color:indigo-50:hover f:0.875rem font-weight:600 leading:1.5rem" href="#">View all<span class="sr-only">, clients</span></a>
        </div>
        <ul class="display:grid gap-x:1.5rem gap-x:2rem@xl gap-y:2rem grid-cols:1 grid-cols:3@lg mt:1.5rem" role="list">
          <SimpleCard
            amount="$2,000.00"
            imgSrc="https://tailwindui.com/img/logos/48x48/tuple.svg"
            lastInvoiceDate="December 13, 2022"
            status="Overdue"
            title="Tuple" />
          <SimpleCard
            amount="$14,000.00"
            imgSrc="https://tailwindui.com/img/logos/48x48/savvycal.svg"
            lastInvoiceDate="January 22, 2023"
            status="Paid"
            title="SavvyCal" />
          <SimpleCard
            amount="$7,600.00"
            imgSrc="https://tailwindui.com/img/logos/48x48/reform.svg"
            lastInvoiceDate="January 23, 2023"
            status="Paid"
            title="Reform" />
        </ul>
      </div>
    </div>
  );
}
