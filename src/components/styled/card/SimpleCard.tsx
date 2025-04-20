import type { JSX } from "solid-js";

import { CardDetails } from "./CardDetails";
import { CardHeader } from "./CardHeader";
import { CardOptions } from "./CardOptions";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

type SimpleCardProps = {
  amount: string;
  imgSrc: string;
  lastInvoiceDate: string;
  status: string;
  title: string;
};

export function CardContainer(props: { children: JSX.Element }) {
  return (
    <As as="div" css={css`
  border-color: gray-20;
  border-radius: 0.75rem;
  border-width: 1px;
  overflow: hidden;
`}>
      {props.children}
    </As>
  );
}

export function CardHeaderContainer(props: { children: JSX.Element }) {
  return (
    <As as="div" css={css`
  display: flex;
  align-items: center;
  background-color: rgb(249,250,251);
  border-bottom-width: 1px;
  border-color: rgb(17,24,39,0.05);
  column-gap: 1rem;
  padding: 1.5rem;
`}>
      {props.children}
    </As>
  );
}

export function SimpleCard(props: SimpleCardProps) {
  return (
    <CardContainer>
      <CardHeaderContainer>
        <CardHeader imgSrc={props.imgSrc} title={props.title} />
        <CardOptions
          options={[
            {
              action: () => {},
              label: "View",
            },
            {
              action: () => {},
              label: "Edit",
            },
          ]}
          title={props.title}
        />
      </CardHeaderContainer>
      <CardDetails
        amount={props.amount}
        lastInvoiceDate={props.lastInvoiceDate}
        status={props.status}
      />
    </CardContainer>
  );
}
