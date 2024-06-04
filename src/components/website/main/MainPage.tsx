import { Icon } from "@iconify-icon/solid";
import { Footer } from "../Footer";
import { Header } from "../Header";
import SiteTitle from "../utils";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import FormInActionSection from "./FormInActionSection";
import SubscribeSection from "./SubscribeSection";
import FAQSection from "./FAQSection";

export const MainPage = () => {
    return (
        <div>
            <SiteTitle children={"Home"} />
            <Header />
            {/* <HeroSection />
            <VideoSection />
            <FeaturesSection />
            <FormInActionSection />
            <SubscribeSection /> */}

            <FAQSection />
            <section class="testimonial">
                <div class="testimonialinner container pt-100 pb-5">
                    <h2>
                        What people have said <br /> about the product
                    </h2>
                    <p class="text-center">
                        People fell in ❤️ with EasyFormForge, Here’s the proof!
                    </p>

                    <div class="row pt-5 d-flex justify-content-spacebetween">
                        <div class="personaltestimonial">
                            <p class="ratestar">
                                <i class="fa-solid fa-star" />
                                <i class="fa-solid fa-star" />
                                <i class="fa-solid fa-star" />
                                <i class="fa-solid fa-star" />
                            </p>
                            <h4>Great form builder</h4>
                            <p>
                                EasyFormForge works great. Designing a form is really easy, the
                                form works well, and the formatting of submission emails looks
                                great as well. Really great product.
                            </p>
                            <h5 class="clientname">Tom Wilson</h5>
                            <h6 class="profession">Primary Teacher</h6>
                        </div>
                        <div class="personaltestimonial">
                            <p class="ratestar">
                                <i class="fa-solid fa-star" />
                                <i class="fa-solid fa-star" />
                                <i class="fa-solid fa-star" />
                                <i class="fa-solid fa-star" />
                            </p>
                            <h4>Great form builder</h4>
                            <p>
                                EasyFormForge works great. Designing a form is really easy, the
                                form works well, and the formatting of submission emails looks
                                great as well. Really great product.
                            </p>
                            <h5 class="clientname">Tom Wilson</h5>
                            <h6 class="profession">Primary Teacher</h6>
                        </div>
                        <div class="personaltestimonial">
                            <p class="ratestar">
                                <i class="fa-solid fa-star" />
                                <i class="fa-solid fa-star" />
                                <i class="fa-solid fa-star" />
                                <i class="fa-solid fa-star" />
                            </p>
                            <h4>Great form builder</h4>
                            <p>
                                EasyFormForge works great. Designing a form is really easy, the
                                form works well, and the formatting of submission emails looks
                                great as well. Really great product.
                            </p>
                            <h5 class="clientname">Tom Wilson</h5>
                            <h6 class="profession">Primary Teacher</h6>
                        </div>
                    </div>
                    <div class="d-flex justify-content-center mt-5">
                        <a class="btn-underline" href="#">
                            See more reviews <i class="fa-solid fa-chevron-right" />
                        </a>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}

const VideoSection = () => {
    return (
        <section class="video container d-grid">
            <img src="graphics/videohome.png" alt="image" />

            <div class="userandreview mt-5 mb-5">
                <div class="activeusers">
                    <Icon class="bg:aliceblue p:10 r:50% color:blueviolet" height={40} width={40} icon={"solar:users-group-rounded-line-duotone"} />
                    <p>
                        20000+ <br /> Active users
                    </p>
                </div>

                <div class="reviews">
                    <Icon class="bg:aliceblue p:10 r:50% color:blueviolet" height={45} width={45} icon={"material-symbols-light:bookmark-star-outline-rounded"} />
                    <p>
                        4.9/5 Stars <br /> 421 Review
                    </p>
                </div>
            </div>
        </section>
    );
};

