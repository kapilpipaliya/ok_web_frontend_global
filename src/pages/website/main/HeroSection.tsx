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
            icon={"fluent:form-48-regular"}
            text="Contact"
            subtext="Form"
          />
          <IconCard
            icon={"hugeicons:mail-open-01"}
            text="Sign Up"
            subtext="Form"
          />
          <IconCard
            icon={"iconoir:multiple-pages"}
            text="50+"
            subtext="Templates"
          />
          <IconCard
            icon={"ant-design:edit-twotone"}
            text="40+"
            subtext="Input Style"
          />
        </div>
        <div class="heroCTA mt-5 align-item-center">
          <button
            onClick={() => navigate("/pricing")}
            class="btn-mid-icon-filled bg-pink cursor:pointer"
          >
            Get Easy Form Forge
          </button>
          <a class="pb-05 btn-underline h3" href="#">
            Explore Features <i class="fa-solid fa-arrow-right"/>
          </a>
        </div>
      </div>
    </section>
  );
};


export const IconCard = (props: {
  icon: any;
  text: string;
  subtext: string;
}) => {
  return (
    <div class="iconcard">
      <div
        class="iconBackground"
        style={{
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
        }}
      >
        <Icon icon={props.icon} height={40} width={40} />
      </div>
      <p class="pt-2">
        {props.text} <br /> {props.subtext}
      </p>
    </div>
  );
};
