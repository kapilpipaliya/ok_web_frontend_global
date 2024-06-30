import { Icon } from "@iconify-icon/solid";
import { For } from "solid-js";

export function TestimonialSection() {
  const testimonials = [
    {
      rating: 5,
      title: "Great form builder",
      feedback:
        "EasyFormForge works great. Designing a form is really easy, the form works well, and the formatting of submission emails looks great as well. Really great product.",
      name: "Tom Wilson",
      profession: "Primary Teacher",
    },
    {
      rating: 5,
      title: "User-friendly and efficient",
      feedback:
        "The drag-and-drop feature is very intuitive. I was able to create a form in minutes without any coding knowledge. Highly recommend EasyFormForge!",
      name: "Sarah Johnson",
      profession: "Web Developer",
    },
    {
      rating: 5,
      title: "Excellent customer support",
      feedback:
        "The customer support team is very responsive and helpful. They resolved my issue within a few hours. Great service!",
      name: "Emily Davis",
      profession: "Freelancer",
    },
  ];

  return (
    <section class="testimonial" aria-labelledby="testimonial-heading">
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
  rating: number;
  title: string;
  feedback: string;
  name: string;
  profession: string;
}>) {
  return (
    <div class="personaltestimonial" aria-label={`Testimonial from ${props.name}, ${props.profession}`}>
      <p class="ratestar" aria-label={`Rating: ${props.rating} stars`}>
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
