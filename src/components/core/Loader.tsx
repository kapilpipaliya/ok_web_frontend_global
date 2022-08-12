import { createSignal, onCleanup } from "solid-js";

export const Loader = () => {
  const [count, setCount] = createSignal(0),
    interval = setInterval(() => setCount((c) => c + 1), 1000);
  onCleanup(() => clearInterval(interval));

  return <div>Loading... {count()}</div>;
};
