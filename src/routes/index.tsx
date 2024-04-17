import { Title } from "@solidjs/meta";
import Counter from "~/components/Counter";

export default function Home() {
  return (
    <main>
      <Title>Home | EasyFromForge</Title>
      <h1>Hello world!</h1>
      <Counter />
    </main>
  );
}
