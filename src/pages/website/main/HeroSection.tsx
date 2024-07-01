import { Icon } from "@iconify-icon/solid";
import { useNavigate } from "@solidjs/router";

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <section class="hero">
      <div class="heroInner container">
        <h1 class="m">
          Think, Drag & Drop <br/> Create forms in minutes
        </h1>
        <h4 class="mt-3 mb-5">Create your form — Smoother & faster!</h4>

        <div class="iconRow mt-2 mb-2">
          <IconCard
            altText="Contact Form Icon"
            icon={"fluent:form-48-regular"}
            subtext="Form"
            text="Contact"
          />
          <IconCard
            altText="Sign Up Form Icon"
            icon={"hugeicons:mail-open-01"}
            subtext="Form"
            text="Sign Up"
          />
          <IconCard
            altText="Templates Icon"
            icon={"iconoir:multiple-pages"}
            subtext="Templates"
            text="50+"
          />
          <IconCard
            altText="Input Style Icon"
            icon={"ant-design:edit-twotone"}
            subtext="Input Style"
            text="40+"
          />
        </div>
        <div class="heroCTA mt-5 align-item-center">
          <button
            aria-label="Get Easy Form Forge"
            class="btn-mid-icon-filled bg-pink cursor:pointer"
            onClick={() => navigate("/pricing")}
          >
            Get Easy Form Forge
          </button>
          <a aria-label="Explore Features" class="pb-05 btn-underline h3" href="#">
            Explore Features <i class="fa-solid fa-arrow-right"/>
          </a>
        </div>
      </div>
    </section>
  );
};


export const IconCard = (props: Readonly<{
  altText: string;
  icon: any;
  subtext: string;
  text: string;
}>) => {
  return (
    <div class="iconcard">
      <div
        class="iconBackground"
        style={{
          "align-items": "center",
          display: "flex",
          "justify-content": "center",
        }}
      >
        <Icon aria-label={props.altText} height={40} icon={props.icon} width={40} />
      </div>
      <p class="pt-2">
        {props.text} <br /> {props.subtext}
      </p>
    </div>
  );
};
