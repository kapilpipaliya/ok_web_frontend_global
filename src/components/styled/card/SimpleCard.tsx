import type { JSX } from "solid-js";

import { CardDetails } from "./CardDetails";
import { CardHeader } from "./CardHeader";
import { CardOptions } from "./CardOptions";

type SimpleCardProps = {
  amount: string;
  imgSrc: string;
  lastInvoiceDate: string;
  status: string;
  title: string;
};

export function CardContainer(props: { children: JSX.Element }) {
  return (
    <div class="border-color:gray-20 border-radius:0.75rem border-width:1px overflow:hidden">
      {props.children}
    </div>
  );
}

export function CardHeaderContainer(props: { children: JSX.Element }) {
  return (
    <div class="flex align-items:center bg:rgb(249,250,251) border-bottom-width:1px  border-color:rgb(17,24,39,0.05)  gap-x:1rem  p:1.5rem">
      {props.children}
    </div>
  );
}

export function SimpleCard(props: SimpleCardProps) {
  return (
    <CardContainer>
      <CardHeaderContainer>
        <CardHeader imgSrc={props.imgSrc} title={props.title} />
        <CardOptions
          options={[
            { action: () => {}, label: "View" },
            { action: () => {}, label: "Edit" },
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
