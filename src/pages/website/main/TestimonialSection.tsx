import { Icon } from "@iconify-icon/solid";
import { For } from "solid-js";

export function TestimonialSection() {
  const testimonials = [
    {
      feedback:
        "EasyFormForge works great. Designing a form is really easy, the form works well, and the formatting of submission emails looks great as well. Really great product.",
      name: "Tom Wilson",
      profession: "Primary Teacher",
      rating: 5,
      title: "Great form builder",
    },
    {
      feedback:
        "The drag-and-drop feature is very intuitive. I was able to create a form in minutes without any coding knowledge. Highly recommend EasyFormForge!",
      name: "Sarah Johnson",
      profession: "Web Developer",
      rating: 5,
      title: "User-friendly and efficient",
    },
    {
      feedback:
        "The customer support team is very responsive and helpful. They resolved my issue within a few hours. Great service!",
      name: "Emily Davis",
      profession: "Freelancer",
      rating: 5,
      title: "Excellent customer support",
    },
  ];

  return (
    <section aria-labelledby="testimonial-heading" class="testimonial">
      <div class="testimonialinner container pt-100 pb-5">
        <h2 id="testimonial-heading">
          What people have said <br /> about the product
        </h2>
        <p class="text-center">
          People fell in ❤️ with EasyFormForge, Here’s the proof!
        </p>

        <div class="row pt-5 d-flex justify-content-spacebetween flex:col@<md gap:10px">
          <For each={testimonials}>{(test) => <Testimonial {...test} />}</For>
        </div>
      </div>
    </section>
  );
}

function Testimonial(props: Readonly<{
  feedback: string;
  name: string;
  profession: string;
  rating: number;
  title: string;
}>) {
  return (
    <div aria-label={`Testimonial from ${props.name}, ${props.profession}`} class="personaltestimonial">
      <p aria-label={`Rating: ${props.rating} stars`} class="ratestar">
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
