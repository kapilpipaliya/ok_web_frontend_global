import { Icon } from "@iconify-icon/solid";
import { For } from "solid-js";

export function FeaturesSection() {
  const featureData = [
    {
      icon: "ri:spam-line",
      title: "Spam Protection",
      subtitle1: "Google reCAPTCHA",
      subtitle2: "Spam Protection",
      description:
        "This will prevent spam entries and ensures acquiring real data from users",
    },
    {
      icon: "iconamoon:move-light",
      title: "Builder",
      subtitle1: "Drag & Drop",
      subtitle2: "Builder",
      description:
        "Fully functional drag & drop form builder. And so many widgets in addition",
    },
    {
      icon: "ic:baseline-payment",
      title: "Payment Methods",
      subtitle1: "Wide Range of Payment",
      subtitle2: "Methods",
      description:
        "Supports popular payment gateway integration like Paypal, Stripe, Gpay and more!",
    },
    {
      icon: "material-symbols:mark-email-read-outline",
      title: "Confirmation Email",
      subtitle1: "Confirmation Email to",
      subtitle2: "Form Users",
      description:
        "Set email notifications to users as a confirmation once form submission is successful",
    },
    {
      icon: "gridicons:code",
      title: "Shortcode",
      subtitle1: "Shortcode Support for",
      subtitle2: "Customization",
      description: "Add short codes to show custom fields in the forms",
    },
    {
      icon: "tabler:cards",
      title: "Visual Styler",
      subtitle1: "Choose form look from",
      subtitle2: "hundreds of ready made style",
      description:
        "Getting your forms to look amazing in your desired color is no longer difficult.",
    },
  ];

  return (
    <section class="features container pb-5 pt-5">
      <div class="featureHeadingsec d-flex">
        <h2 class="text-left">
          Experience a whole new & <br/> quicker way of making forms!
        </h2>
        <button class="btn-small-icon-filled bg-black">
          View All Features <i class="fa-solid fa-chevron-right"/>
        </button>
      </div>
      <p class="font-600 mt-3">
        Easy Form Forge serves everyone’s needs by out of the box like
      </p>

      <div class="row mt-5 grid grid-cols:3@>lg grid-cols:2@md grid-cols:1@<sm gap:10px">
        <For each={featureData}>
          {(feature) => (
            <FeatureBox
              icon={feature.icon}
              title={feature.title}
              subtitle1={feature.subtitle1}
              subtitle2={feature.subtitle2}
              description={feature.description}
            />
          )}
        </For>
      </div>
    </section>
  );
};

const FeatureBox = (props: {
  icon: string;
  title: string;
  subtitle1: string;
  subtitle2: string;
  description: string;
}) => {
  return (
    <div class="featurebox d-flex p-relative">
      <div class="iconbg" />
      <div class="iconsvg d-flex justify-content-center align-item-center">
        <Icon icon={props.icon} height={50} width={50} />
      </div>
      <h6>{props.title}</h6>
      <h4 class="text-left">
        {props.subtitle1} <br /> {props.subtitle2}
      </h4>
      <p>{props.description}</p>
    </div>
  );
};
