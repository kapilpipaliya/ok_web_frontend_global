import { Icon } from "@iconify-icon/solid";
import { For } from "solid-js";

export function FeaturesSection() {
  const featureData = [
    {
      description:
        "This will prevent spam entries and ensures acquiring real data from users",
      icon: "ri:spam-line",
      subtitle1: "Google reCAPTCHA",
      subtitle2: "Spam Protection",
      title: "Spam Protection",
    },
    {
      description:
        "Fully functional drag & drop form builder. And so many widgets in addition",
      icon: "iconamoon:move-light",
      subtitle1: "Drag & Drop",
      subtitle2: "Builder",
      title: "Builder",
    },
    {
      description:
        "Supports popular payment gateway integration like Paypal, Stripe, Gpay and more!",
      icon: "ic:baseline-payment",
      subtitle1: "Wide Range of Payment",
      subtitle2: "Methods",
      title: "Payment Methods",
    },
    {
      description:
        "Set email notifications to users as a confirmation once form submission is successful",
      icon: "material-symbols:mark-email-read-outline",
      subtitle1: "Confirmation Email to",
      subtitle2: "Form Users",
      title: "Confirmation Email",
    },
    {
      description: "Add short codes to show custom fields in the forms",
      icon: "gridicons:code",
      subtitle1: "Shortcode Support for",
      subtitle2: "Customization",
      title: "Shortcode",
    },
    {
      description:
        "Getting your forms to look amazing in your desired color is no longer difficult.",
      icon: "tabler:cards",
      subtitle1: "Choose form look from",
      subtitle2: "hundreds of ready made style",
      title: "Visual Styler",
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

      <div class="row mt-5 grid gap:10px grid-cols:1@<sm grid-cols:2@md grid-cols:3@>lg">
        <For each={featureData}>
          {(feature) => (
            <FeatureBox
              description={feature.description}
              icon={feature.icon}
              subtitle1={feature.subtitle1}
              subtitle2={feature.subtitle2}
              title={feature.title}
            />
          )}
        </For>
      </div>
    </section>
  );
};

const FeatureBox = (props: Readonly<{
  description: string;
  icon: string;
  subtitle1: string;
  subtitle2: string;
  title: string;
}>) => {
  return (
    <div class="featurebox d-flex p-relative">
      <div class="iconbg" />
      <div class="iconsvg d-flex justify-content-center align-item-center">
        <Icon height={50} icon={props.icon} width={50} />
      </div>
      <h3>{props.title}</h3>
      <h4 class="text-left">
        {props.subtitle1} <br /> {props.subtitle2}
      </h4>
      <p>{props.description}</p>
    </div>
  );
};
