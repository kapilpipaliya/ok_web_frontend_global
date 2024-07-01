import { Icon } from "@iconify-icon/solid";
import { For, createSignal } from "solid-js";

import { Footer } from "./Footer";
import { Header } from "./Header";
import { SiteTitle } from "./SiteTitle";

function PricingContent() {
  const [isMonthlyBilling, setIsMonthlyBilling] = createSignal(true);

  const plans = [
    {
      features: [
        "5 forms form limit",
        "100 Monthly Subscriptions",
        "1 User Per Team",
        "100 MB Available Space",
        "1000 Monthly Views",
        "500 Total Submission Storage",
        "10 Fields Per Form",
        "10 Monthly payment submissions",
        "10 Monthly signed documents",
      ],
      price: 0,
      recommended: false,
      title: "Silver Plan",
    },
    {
      features: [
        "25 forms form limit",
        "1000 Monthly Subscriptions",
        "1 User Per Team",
        "1 GB Available Space",
        "10000 Monthly Views",
        "1000 Total Submission Storage",
        "30 Fields Per Form",
        "49 Monthly payment submissions",
        "90 Monthly signed documents",
      ],
      price: 10,
      recommended: true,
      title: "Gold Plan",
    },
    {
      features: [
        "100 forms form limit",
        "5000 Monthly Subscriptions",
        "10 Users Per Team",
        "10 GB Available Space",
        "9999 Monthly Views",
        "9999 Total Submission Storage",
        "50 Fields Per Form",
        "99 Monthly payment submissions",
        "1000 Monthly signed documents",
      ],
      price: 20,
      recommended: false,
      title: "Platinum Plan",
    },
    {
      features: [
        "Unlimited forms",
        "Special pricing for all features",
        "Extra API support",
        "Priority support",
      ],
      price: "Contact Us for Pricing",
      recommended: false,
      title: "Enterprise Plan",
    },
  ];

  const toggleBilling = () => {
    setIsMonthlyBilling(!isMonthlyBilling());
  };

  return (
    <section aria-labelledby="pricing-heading" class="pricing-content mb-5 pt-100">
      <div class="container d-grid justify-content-center justify-item-center">
        <h2 id="pricing-heading">
          Affordable Pricing Plans for Everyone
        </h2>
        <p>
          We believe that everyone should have access to valuable assets to improve their important work.
        </p>
        <div class="tick mt-5">
          {["30 Days trial", "Cancel anytime", "24/7 Customer Support"].map(
            (text) => (
              <p>
                <svg
                  height="1.5em"
                  viewBox="0 0 15 15"
                  width="1.5em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clip-rule="evenodd"
                    d="M7.252.066a.5.5 0 0 1 .496 0l7 4A.5.5 0 0 1 15 4.5v.72a10.15 10.15 0 0 1-7.363 9.76a.5.5 0 0 1-.274 0A10.152 10.152 0 0 1 0 5.22V4.5a.5.5 0 0 1 .252-.434zm-.18 10.645l4.318-5.399l-.78-.624l-3.682 4.601L4.32 7.116l-.64.768z"
                    fill="#0a9353"
                    fill-rule="evenodd"
                  />
                </svg>
                {text}
              </p>
            ),
          )}
        </div>

        <div class="billing mt-5">
          <a class={isMonthlyBilling() ? "monthbill active" : "monthbill"} onClick={toggleBilling}>
            Monthly Billing
          </a>
          <a class={!isMonthlyBilling() ? "annualbill active" : "annualbill"} onClick={toggleBilling}>
            Annual Billing
          </a>
        </div>

        <h5 class="color-info mt-2">Save up to 20%</h5>

        <div
          class={"mt-5 grid gap:20px grid-template-columns:repeat(1,auto)@xs grid-template-columns:repeat(2,auto)@md grid-template-columns:repeat(4,auto)@lg"}
        >
          <For each={plans}>
            {(plan) => (
              <PricingPlan
                features={plan.features}
                price={plan.price}
                recommended={plan.recommended}
                title={plan.title}
              />
            )}
          </For>
        </div>
      </div>
    </section>
  );
}

function PricingPlan(props: Readonly<{
  features: string[];
  price: number | string;
  recommended: boolean;
  title: string;
}>) {
  return (
    <div
      aria-labelledby={`${props.title.toLowerCase().replace(" ", "-")}-heading`}
      class={`plan text-align-last:left ${props.recommended ? "recommended" : ""}`}
      style={{ display: "block" }}
    >
      <h4 id={`${props.title.toLowerCase().replace(" ", "-")}-heading`} style={{ float: "left" }}>{props.title}</h4>
      <div class="plan-price flex f:14 pt:10 text-align:left">
        <h4 class="mr-2 f:35px">${props.price}</h4>
        <p class="line-height:1">
          per month <br /> incl. tax
        </p>
      </div>
      <button class="btn-mid-icon-filled">Buy Now</button>
      <hr />
      <PricingFeatures features={props.features} title="FEATURES" />
    </div>
  );
}

function PricingFeatures(props: Readonly<{ features: string[]; title: string }>) {
  const [isOpen, setIsOpen] = createSignal(true);
  return (
    <div class="plan" style={{ display: "block" }}>
      <h4 onClick={() => setIsOpen(!isOpen())} style={{ cursor: "pointer" }}>
        {props.title}
      </h4>
      <ul style={{ display: isOpen() ? "block" : "none" }}>
        {props.features.map((feature) => (
          <li class="gap:7px">
            <Icon icon="mdi:check" />
            <p style={{ "text-align": "left" }}>{feature}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PricingSection() {
  return (
    <div>
      <SiteTitle>Pricing - Affordable Plans for Everyone</SiteTitle>
      <Header />
      <PricingContent />
      <Footer />
    </div>
  );
}
