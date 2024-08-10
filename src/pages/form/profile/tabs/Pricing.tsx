import { Icon } from "@iconify-icon/solid";
import { createSignal, For, type JSX } from "solid-js";
import { createStore } from "solid-js/store";

// Type Definitions
interface Plan {
  currency: string;
  name: string;
  price: number;
  type: string;
}

// Icons Mapping
const icons: Record<string, string> = {
  "Advanced Pro": "streamline:money-graph-arrow-increase-ascend-growth-up-arrow-stats-graph-right-grow",
  Basic: "quill:stack-alt",
  Premium: "ant-design:fire-outlined",
  Pro: "mage:electricity",
};

// PricingPlans Component
export const PricingPlans = (props: Readonly<{ plans: () => Plan[] }>): JSX.Element => {
  const [selectedPlan, setSelectedPlan] = createSignal<string>("");

  const isSelected = (planName: string): boolean => selectedPlan() === planName;

  return (
    <>
      <div class="m:10|20">
        <div class="font-weight:700">Account Plans</div>
        <span class="color:grey f:14 font-weight:500">
          Pick an account plan that fits your workflow.
        </span>
      </div>

      <div class="grid gap:10 grid-rows:2 grid-template-columns:(2fr|50%) m:0|20 w:80%@>md">
        <For each={props.plans()}>
          {(plan) => (
            <div
              class={`${
                isSelected(plan.name)
                  ? "b:2px|solid|rgb(56,114,250) color:black"
                  : "b:1.5px|solid|rgb(227,227,227) color:black"
              } cursor:pointer p:0|5 r:10`}
              onClick={() => setSelectedPlan(plan.name)}
            >
              <div class="flex ai:center font-weight:medium jc:space-between p:10|20">
                <div class="flex ai:center">
                  <div class="grid bg:rgb(227,227,227) h:35 place-items:center r:50% w:35">
                    <Icon class="color:black" height={22} icon={icons[plan.name]} width={22} />
                  </div>
                  <div class="p:5|10">
                    <div>{plan.name}</div>
                    <span class="color:grey f:14">{plan.currency}</span>
                  </div>
                </div>
                <div>
                  <span>
                    ${plan.price} / {plan.type}
                  </span>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
    </>
  );
};

// CurrentPlan Component
export const CurrentPlan = (): JSX.Element => {
  const [plan, _setPlan] = createStore<Plan>({
    currency: "INR",
    name: "Premium",
    price: 1000,
    type: "Monthly",
  });

  return (
    <div class="m:10|20">
      <div class="font-weight:700">Current Plan</div>
      <span class="color:grey f:14 font-weight:500">
        We’ll credit your account if you need to downgrade during the billing cycle.
      </span>
      <div class="m:10|0 mb:20 w:50%@>md w:39%@lg">
        <div class="b:2px|solid|rgb(33,146,15) color:black cursor:pointer p:0|5 r:10">
          <div class="flex ai:center font-weight:medium jc:space-between p:10|20">
            <div class="flex ai:center">
              <div class="grid bg:rgb(227,227,227) h:35 place-items:center r:50% w:35">
                <Icon class="color:black" height={22} icon={icons[plan.name]} width={22} />
              </div>
              <div class="p:5|10">
                <div>{plan.name}</div>
                <span class="color:grey f:14">{plan.currency}</span>
              </div>
            </div>
            <div>
              <span>
                ${plan.price} / {plan.type}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
