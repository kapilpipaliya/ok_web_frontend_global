import { Component } from "solid-js";

import { ClientCardDetails } from "./ClientCardDetails";
import { ClientCardHeader } from "./ClientCardHeader";
import { ClientCardOptions } from "./ClientCardOptions";

type ClientCardProps = {
  amount: string;
  clientName: string;
  imgSrc: string;
  lastInvoiceDate: string;
  status: string;
};

export function ClientCard(props: ClientCardProps) {
  return (
    <li class="border-color:gray-20 border-radius:0.75rem border-width:1px overflow:hidden">
      <div class="flex align-items:center gap-x:1rem border-bottom-width:1px  border-color:rgb(17,24,39,0.05)  bg:rgb(249,250,251)  p:1.5rem">
        <ClientCardHeader clientName={props.clientName} imgSrc={props.imgSrc} />
        <ClientCardOptions clientName={props.clientName} />
      </div>
      <ClientCardDetails
        amount={props.amount}
        lastInvoiceDate={props.lastInvoiceDate}
        status={props.status} />
    </li>
  );
}

