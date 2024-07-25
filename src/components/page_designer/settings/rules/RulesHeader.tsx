import { HeaderWithDescription } from "~/components/HeaderWithDescription";

import { AddNewRuleButton } from "./AddNewRuleButton";
import { DisplayAllRules } from "./DisplayAllRules";


export function RulesHeader() {
  return (
    <>
      <HeaderWithDescription description="All the rules that are used in the form." title="" />


      <div class="flex ai:center jc:space-between mt:10">
        <AddNewRuleButton />
        <DisplayAllRules />
      </div>
    </>
  );
}
