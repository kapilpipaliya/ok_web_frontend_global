export function ClientCardDetails(props: { lastInvoiceDate: string; amount: string; status: string; }) {
  return (
    <dl class="my:-0.75rem bt:0>*+* bb:1px>*+* bl:1|solid|gray-10>*+* bl:1|solid|gray-10>*+* px:1.5rem py:1rem f:0.875rem lh:1.25rem leading:1.5rem">
      <div class="flex justify-content:space-between gap-x:1rem py:0.75rem">
        <dt class="color:rgb(107,114,128)">Last invoice</dt>
        <dd class="color:rgb(55,65,81)"><time datetime={props.lastInvoiceDate}>{props.lastInvoiceDate}</time></dd>
      </div>
      <div class="flex justify-content:space-between gap-x:1rem py:0.75rem">
        <dt class="color:rgb(107,114,128)">Amount</dt>
        <dd class="flex align-items:flex-start gap-x:0.5rem">
          <div class="font-weight:500 color:rgb(17,24,39)">{props.amount}</div>
          <div
            class={`border-radius:0.375rem py:0.25rem px:0.5rem f:0.75rem lh:1rem font-weight:500 box-shadow:0|0|0|1px|rgba(0,0,0,0.5) ring-inset ${props.status === "Overdue"
              ? "color:rgb(185,28,28) bg:rgb(254,242,242)"
              : "color:rgb(4,120,87) bg:rgb(236,253,245)"} box-shadow:0|0|0|calc(1px+10px)|${props.status === "Overdue" ? "rgba(220,38,38,0.1)" : "rgba(22,163,74,0.2)"}`}
          >
            {props.status}
          </div>
        </dd>
      </div>
    </dl>
  );
}
