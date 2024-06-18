import { createSignal } from "solid-js";

export function SubscribeSection() {
  return (
    <section class="subscribe d-flex" aria-labelledby="subscribe-heading">
      <div class="subscribeinner container">
        <h2 id="subscribe-heading" class="color-white">Let’s build forms together</h2>
        <p class="color-white text-center">
          Subscribe for the latest news and exclusive deals!
        </p>
        <SubscribeForm/>
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
    <form class="subs d-flex m-auto mt-3" onSubmit={handleSubmit} aria-label="Subscribe Form">
      <input
        class="p-0 m-0"
        type="email"
        placeholder="Enter your email..."
        value={email()}
        onInput={(e) => setEmail(e.target.value)}
        aria-label="Email Address"
      />
      <button
        class="btn-mid-icon-filled align-item-center bg-pink"
        type="submit"
        aria-label="Subscribe"
      >
        Subscribe
      </button>
    </form>
  );
};
