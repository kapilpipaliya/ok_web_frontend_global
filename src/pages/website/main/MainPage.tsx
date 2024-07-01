import { Icon } from "@iconify-icon/solid";

import { Footer } from "../Footer";
import { Header } from "../Header";
import {SiteTitle} from "../SiteTitle";
import {FAQSection} from "./FAQSection";
import {FeaturesSection} from "./FeaturesSection";
import {FormInActionSection} from "./FormInActionSection";
import {HeroSection} from "./HeroSection";
import {SubscribeSection} from "./SubscribeSection";
import {TestimonialSection} from "./TestimonialSection";

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
      <img alt="Video Home" src="graphics/videohome.png" title="Video Home" />

      <div class="userandreview mt-5 mb-5">
        <div class="activeusers">
          <Icon
            class="bg:aliceblue p:10 r:50% color:blueviolet"
            height={40}
            icon={"solar:users-group-rounded-line-duotone"}
            width={40}
          />
          <p>
            20000+ <br /> Active users
          </p>
        </div>

        <div class="reviews">
          <Icon
            class="bg:aliceblue p:10 r:50% color:blueviolet"
            height={45}
            icon={"material-symbols-light:bookmark-star-outline-rounded"}
            width={45}
          />
          <p>
            4.9/5 Stars <br /> 421 Reviews
          </p>
        </div>
      </div>
    </section>
  );
};
