import { Icon } from "@iconify-icon/solid";
import { For, createSignal } from "solid-js";

function TestimonialSection() {
    const testimonials = [
        {
            rating: 5,
            title: "Great form builder",
            feedback: "EasyFormForge works great. Designing a form is really easy, the form works well, and the formatting of submission emails looks great as well. Really great product.",
            name: "Tom Wilson",
            profession: "Primary Teacher",
        },
        {
            rating: 5,
            title: "Great form builder",
            feedback: "EasyFormForge works great. Designing a form is really easy, the form works well, and the formatting of submission emails looks great as well. Really great product.",
            name: "Tom Wilson",
            profession: "Primary Teacher",
        },
        {
            rating: 5,
            title: "Great form builder",
            feedback: "EasyFormForge works great. Designing a form is really easy, the form works well, and the formatting of submission emails looks great as well. Really great product.",
            name: "Tom Wilson",
            profession: "Primary Teacher",
        },
    ];

    return (
        <section class="testimonial">
            <div class="testimonialinner container pt-100 pb-5">
                <h2>
                    What people have said <br /> about the product
                </h2>
                <p class="text-center">
                    People fell in ❤️ with EasyFormForge, Here’s the proof!
                </p>

                <div class="row pt-5 d-flex justify-content-spacebetween flex:col@<md gap:10px">
                    <For each={testimonials}>
                        {(test) => <Testimonial {...test} />}
                    </For>
                </div>
            </div>
        </section>
    );
}

export default TestimonialSection;
function Testimonial(props: { rating: number; title: string; feedback: string; name: string; profession: string }) {
    return (
        <div class="personaltestimonial">
            <p class="ratestar">
                {Array.from({ length: props.rating }).map(() => (
                    <Icon icon="heroicons:star-solid" style={{ color: "gold" }} />
                ))}
            </p>
            <h4>{props.title}</h4>
            <p>{props.feedback}</p>
            <h5 class="clientname">{props.name}</h5>
            <h6 class="profession">{props.profession}</h6>
        </div>
    );
}
