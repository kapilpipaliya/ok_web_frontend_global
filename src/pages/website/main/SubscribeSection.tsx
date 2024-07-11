import { createSignal } from "solid-js";

export function SubscribeSection() {
  return (
    <section aria-labelledby="subscribe-heading" class="subscribe d-flex">
      <div class="subscribeinner container">
        <h2 class="color-white" id="subscribe-heading">
          Let’s build forms together
        </h2>
        <p class="color-white text-center">
          Subscribe for the latest news and exclusive deals!
        </p>
        <SubscribeForm />
      </div>
    </section>
  );
}

const SubscribeForm = () => {
  const [email, setEmail] = createSignal("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log("Subscribed with email:", email());
  };

  return (
    <form
      aria-label="Subscribe Form"
      class="subs d-flex m-auto mt-3"
      onSubmit={handleSubmit}
    >
      <input
        aria-label="Email Address"
        class="p-0 m-0"
        onInput={(e) => setEmail(e.target.value)}
        placeholder="Enter your email..."
        type="email"
        value={email()}
      />
      <button
        aria-label="Subscribe"
        class="btn-mid-icon-filled align-item-center bg-pink"
        type="submit"
      >
        Subscribe
      </button>
    </form>
  );
};
