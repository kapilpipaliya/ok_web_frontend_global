import { Icon } from "@iconify-icon/solid";
import { For, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
const icons: any = {
  "Advanced Pro":
    "streamline:money-graph-arrow-increase-ascend-growth-up-arrow-stats-graph-right-grow",
  Basic: "quill:stack-alt",
  Premium: "ant-design:fire-outlined",
  Pro: "mage:electricity",
};
export const PricingPlans = (props: Readonly<{ plans: any }>) => {
  const [selectedPlan, setSelectedPlan] = createSignal("");
  const isSelected = (planName: string) => selectedPlan() === planName;
  return (
    <>
      <div class={"m:10|20"}>
        <div class={"font-weight:700"}>Account Plans</div>
        <span class={"font-weight:500 color:grey f:14"}>
          Pick an account plan that fits your workflow.
        </span>
      </div>

      <div
        class={
          "grid grid-template-columns:(2fr|50%) m:0|20 gap:10 grid-rows:2 w:80%@>md"
        }
      >
        <For each={props.plans()}>
          {(plan: any) => (
            <div
              class={`${
                isSelected(plan.name)
                  ? "b:2px|solid|rgb(56,114,250) color:black"
                  : "b:1.5px|solid|rgb(227,227,227) color:black"
              } r:10 p:0|5 cursor:pointer`}
              onClick={() => setSelectedPlan(plan.name)}
            >
              <div
                class={
                  "flex jc:space-between ai:center font-weight:medium p:10|20"
                }
              >
                <div class={"flex ai:center"}>
                  <div
                    class={
                      "h:35 w:35 bg:rgb(227,227,227) r:50% grid place-items:center"
                    }
                  >
                    <Icon
                      class={"color:black"}
                      height={22}
                      icon={icons[plan.name]}
                      width={22}
                    />
                  </div>
                  <div class={"p:5|10"}>
                    <div>{plan.name}</div>
                    <span class={"color:grey f:14"}>{plan.currency}</span>
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
export const CurrentPlan = () => {
  const [plan, setPlan] = createStore<any>({
    currency: "INR",
    name: "Premium",
    price: 1000,
    type: "Monthly",
  });

  return (
    <div class={"m:10|20"}>
      <div class={"font-weight:700"}>Current Plan</div>
      <span class={"font-weight:500 color:grey f:14"}>
        We’ll credit your account if you need to downgrade during the billing
        cycle.
      </span>
      <div class={"w:50%@>md w:39%@lg m:10|0 mb:20"}>
        <div
          class={
            "b:2px|solid|rgb(33,146,15) color:black r:10 p:0|5 cursor:pointer"
          }
        >
          <div
            class={"flex jc:space-between ai:center font-weight:medium p:10|20"}
          >
            <div class={"flex ai:center"}>
              <div
                class={
                  "h:35 w:35 bg:rgb(227,227,227) r:50% grid place-items:center"
                }
              >
                <Icon
                  class={"color:black"}
                  height={22}
                  icon={icons[plan.name]}
                  width={22}
                />
              </div>
              <div class={"p:5|10"}>
                <div>{plan.name}</div>
                <span class={"color:grey f:14"}>{plan.currency}</span>
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
