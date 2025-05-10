import type { JSX } from "solid-js";
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

export function CardDetailRow(props: { children: JSX.Element; label: string }) {
  return (
    <As
      as="div"
      css={(args: FunctionArgumentType) => css`
  display: flex;
  column-gap: 1rem;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${args.theme.var.color.primary_15};
  
  &:last-child {
    border-bottom: none;
  }
`}
    >
      <As
        as="dt"
        css={(args: FunctionArgumentType) => css`
  color: ${args.theme.var.color.base_55};
  font-weight: 500;
`}
      >
        {props.label}
      </As>
      <As
        as="dd"
        css={(args: FunctionArgumentType) => css`
  color: ${args.theme.var.color.base_85};
  font-weight: 600;
`}
      >
        {props.children}
      </As>
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
      <CardDetailRow label="Amount">
        <span>{props.amount}</span>
      </CardDetailRow>
      <CardDetailRow label="Status">
        <Status status={props.status} />
      </CardDetailRow>
      <CardDetailRow label="Last invoice">
        <time datetime={props.lastInvoiceDate}>{props.lastInvoiceDate}</time>
      </CardDetailRow>
    </CardDetailsContainer>
  );
}

export function CardDetailsContainer(props: { children: JSX.Element }) {
  return (
    <As
      as="dl"
      css={(args: FunctionArgumentType) => css`
  font-size: 0.875rem;
  padding: 1.25rem 1.5rem;
  background-color: ${args.theme.var.color.base_2};
  border-top: 1px solid ${args.theme.var.color.primary_20};
`}
    >
      {props.children}
    </As>
  );
}

export function Status(props: { status: string }) {
  return (
    <As
      as="span"
      css={(args: FunctionArgumentType) => css`
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
  display: inline-block;
  ${
    props.status === "Overdue"
      ? `
      color: ${args.theme.var.color.error};
      background-color: ${args.theme.var.color.error_15};
    `
      : props.status === "Paid"
        ? `
      color: ${args.theme.var.color.success};
      background-color: ${args.theme.var.color.success_15};
    `
        : `
      color: ${args.theme.var.color.warning};
      background-color: ${args.theme.var.color.warning_15};
    `
  }
`}
    >
      {props.status}
    </As>
  );
}
