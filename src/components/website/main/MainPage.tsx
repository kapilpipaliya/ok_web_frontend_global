import { Icon } from "@iconify-icon/solid";
import { Footer } from "../Footer";
import { Header } from "../Header";
import SiteTitle from "../utils";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import FormInActionSection from "./FormInActionSection";
import SubscribeSection from "./SubscribeSection";
import FAQSection from "./FAQSection";
import TestimonialSection from "./TestimonialSection";

export const MainPage = () => {
  return (
    <div>
      <SiteTitle children={"Home"} />
      <Header />
      <HeroSection />
      <VideoSection />
      <FeaturesSection />
      <FormInActionSection />
      <SubscribeSection />
      <FAQSection />
      <TestimonialSection />
      <Footer />
    </div>
  );
};

const VideoSection = () => {
  return (
    <section class="video container d-grid">
      <img src="graphics/videohome.png" alt="image" />

      <div class="userandreview mt-5 mb-5">
        <div class="activeusers">
          <Icon
            class="bg:aliceblue p:10 r:50% color:blueviolet"
            height={40}
            width={40}
            icon={"solar:users-group-rounded-line-duotone"}
          />
          <p>
            20000+ <br /> Active users
          </p>
        </div>

        <div class="reviews">
          <Icon
            class="bg:aliceblue p:10 r:50% color:blueviolet"
            height={45}
            width={45}
            icon={"material-symbols-light:bookmark-star-outline-rounded"}
          />
          <p>
            4.9/5 Stars <br /> 421 Review
          </p>
        </div>
      </div>
    </section>
  );
};
