import { createSignal } from "solid-js";

const SubscribeSection = () => {
  return (
    <section class="subscribe d-flex">
      <div class="subscribeinner container">
        <h2 class="color-white">Let’s build forms together</h2>
        <p class="color-white text-center">
          Subscribe for latest news and exclusive deals!
        </p>
        <SubscribeForm />
      </div>
    </section>
  );
};

export default SubscribeSection;
const SubscribeForm = () => {
  const [email, setEmail] = createSignal("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Handle subscription logic here
    console.log("Subscribed with email:", email());
  };

  return (
    <form class="subs d-flex m-auto mt-3" onSubmit={handleSubmit}>
      <input
        class="p-0 m-0"
        type="text"
        placeholder="Enter your email..."
        value={email()}
        onInput={(e) => setEmail(e.target.value)}
      />
      <button
        class="btn-mid-icon-filled align-item-center bg-pink"
        type="submit"
      >
        Subscribe
      </button>
    </form>
  );
};
