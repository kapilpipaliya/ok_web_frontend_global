import { createSignal } from "solid-js";
import { Footer } from "../Footer";
import { Header } from "../Header";
import SiteTitle from "../utils";
import { Icon } from "@iconify-icon/solid";

function PricingContent() {
  const plans = [
    {
      title: "Silver",
      price: 0,
      features: [
        "5 forms form limit",
        "100 Monthly Subscription",
        "1 User Per Team",
        "100 MB Available Space",
        "1000 Monthly Views",
        "500 Total Submission Storage",
        "10 Fields Per Form",
        "10 Monthly payment submission",
        "10 Monthly signed document",
      ],
      recommended: false,
    },
    {
      title: "Gold",
      price: 10,
      features: [
        "25 forms form limit",
        "1000 Monthly Subscription",
        "1 User Per Team",
        "1 GB Available Space",
        "10000 Monthly Views",
        "1000 Total Submission Storage",
        "30 Fields Per Form",
        "49 Monthly payment submission",
        "90 Monthly signed document",
      ],
      recommended: true,
    },
    {
      title: "Platinum",
      price: 20,
      features: [
        "100 forms form limit",
        "5000 Monthly Subscription",
        "10 User Per Team",
        "10 GB Available Space",
        "9999 Monthly Views",
        "9999 Total Submission Storage",
        "50 Fields Per Form",
        "99 Monthly payment submission",
        "1000 Monthly signed document",
      ],
      recommended: false,
    },
    {
      title: "Enterprise",
      price: "Offer *",
      features: [
        "Unlimited forms",
        "Special pricing for all features",
        "Extra API supports",
        "Priority support",
      ],
      recommended: false,
    },
  ];

  return (
    <section class="pricingContent mb-5 pt-100">
      <div class="container d-grid justify-content-center justify-item-center">
        <h2>
          We believe that everyone should have <br />
          access to valuable assets to improve <br />
          their important work
        </h2>
        <div class="tick mt-5">
          {["30 Days trial", "Cancel anytime", "24/7 Customer Support"].map(
            (text) => (
              <p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.5em"
                  height="1.5em"
                  viewBox="0 0 15 15"
                >
                  <path
                    fill="#0a9353"
                    fill-rule="evenodd"
                    d="M7.252.066a.5.5 0 0 1 .496 0l7 4A.5.5 0 0 1 15 4.5v.72a10.15 10.15 0 0 1-7.363 9.76a.5.5 0 0 1-.274 0A10.152 10.152 0 0 1 0 5.22V4.5a.5.5 0 0 1 .252-.434zm-.18 10.645l4.318-5.399l-.78-.624l-3.682 4.601L4.32 7.116l-.64.768z"
                    clip-rule="evenodd"
                  />
                </svg>
                {text}
              </p>
            ),
          )}
        </div>

        <div class="billing mt-5">
          <a class="monthbill" href="#">
            Month Billing
          </a>
          <a class="annualbill" href="#">
            Annual Billing
          </a>
        </div>

        <h5 class="color-info mt-2">Save upto 20%</h5>

        <div
          class={`mt-5 grid grid-template-columns:repeat(1,auto)@xs grid-template-columns:repeat(2,auto)@md grid-template-columns:repeat(4,auto)@lg gap:20px`}
        >
          {plans.map((plan) => (
            <PricingPlan
              title={plan.title}
              price={plan.price}
              features={plan.features}
              recommended={plan.recommended}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
function PricingPlan(props: {
  title: string;
  price: string | number;
  features: string[];
  recommended: boolean;
}) {
  return (
    <div
      class={`plan text-align-last:left ${props.recommended ? "recommended" : ""}  `}
      style={{ display: "block" }}
    >
      <h4 style={{ float: "left" }}>{props.title}</h4>
      <div class="planprice flex text-align:left f:14 pt:10">
        <h4 class="mr-2 f:35px">${props.price}</h4>
        <p class=" line-height:1">
          per month <br /> incl. tax
        </p>
      </div>
      <button class="btn-mid-icon-filled">Buy Now</button>
      <hr />
      <PricingFeatures title="FEATURES" features={props.features} />
    </div>
  );
}
function PricingFeatures(props: { title: string; features: string[] }) {
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
            <p style={{ "text-align": "-webkit-left" }}>{feature}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
export function PricingSection() {
  return (
    <div>
      <SiteTitle>Pricing</SiteTitle>
      <Header />
      <PricingContent />
      <Footer />
    </div>
  );
}
