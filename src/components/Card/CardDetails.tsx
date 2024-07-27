import type { JSX } from "solid-js";

export function CardDetails(props: { amount: string; lastInvoiceDate: string; status: string; }) {
  return (
    <CardDetailsContainer>
      <CardDetailRow label="Last invoice">
        <time datetime={props.lastInvoiceDate}>{props.lastInvoiceDate}</time>
      </CardDetailRow>
    </CardDetailsContainer>
  );
}

export function CardDetailsContainer(props: { children: JSX.Element; }) {
  return (
    <dl class="lh:1.25rem bt:1|solid|gray-10>*+* f:0.875rem leading:1.5rem my:-0.75rem px:1.5rem py:1rem">
      {props.children}
    </dl>
  );
}

export function CardDetailRow(props: { children: JSX.Element; label: string; }) {
  return (
    <div class="flex gap-x:1rem justify-content:space-between py:0.75rem">
      <dt class="color:gray-50">{props.label}</dt>
      <dd class="color:gray-50">{props.children}</dd>
    </div>
  );
}

/*export function Status(props: { status: string }) {
  return <div
    class={`border-radius:0.375rem py:0.25rem px:0.5rem f:0.75rem lh:1rem font-weight:500 box-shadow:0|0|0|1px|rgba(0,0,0,0.5) ring-inset ${props.status === "Overdue"
      ? "color:rgb(185,28,28) bg:rgb(254,242,242)"
      : "color:rgb(4,120,87) bg:rgb(236,253,245)"} box-shadow:0|0|0|calc(1px+10px)|${props.status === "Overdue" ? "rgba(220,38,38,0.1)" : "rgba(22,163,74,0.2)"}`}
  >
    {props.status}
  </div>;
}
*/