import type { JSX } from "solid-js";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

export function CardDetailRow(props: { children: JSX.Element; label: string }) {
  return (
    <As as="div" css={css`
  display: flex;
  column-gap: 1rem;
  justify-content: space-between;
  padding-top: 0.75rem; padding-bottom: 0.75rem;
`}>
      <As as="dt" css={css`
  color: #3b82f6;
`}>{props.label}</As>
    <As as="dd" css={css`
  color: #3b82f6;
`}>{props.children}</As>
    </As>
  );
}

export function CardDetails(props: {
  amount: string;
  lastInvoiceDate: string;
  status: string;
}) {
  return (
    <CardDetailsContainer>
      <CardDetailRow label="Last invoice">
        <time datetime={props.lastInvoiceDate}>{props.lastInvoiceDate}</time>
      </CardDetailRow>
    </CardDetailsContainer>
  );
}

export function CardDetailsContainer(props: { children: JSX.Element }) {
  return (
    <As as="dl" css={css`
  font-size: 0.875rem;
  margin-top: -0.75rem; margin-bottom: -0.75rem;
  padding-left: 1.5rem; padding-right: 1.5rem;
  padding-top: 1rem; padding-bottom: 1rem;
`}>
      {props.children}
    </As>
  );
}

/*export function Status(props: { status: string }) {
  return <div
    class={`border-radius:0.375rem py:0.25rem px:0.5rem f:0.75rem lh:1rem font-weight:500 box-shadow:0|0|0|1px|rgba(0,0,0,0.5) ring-inset ${props.status === "Overdue"
      ? "color:rgb(185,28,28) bg:rgb(254,242,242);"
      : "color:rgb(4,120,87) bg:rgb(236,253,245);"} box-shadow:0|0|0|calc(1px + 10px)|${props.status === "Overdue" ? "rgba(220,38,38,0.1);" : "rgba(22,163,74,0.2);"}`}
  >
    {props.status}
  </div>;
}
*/
