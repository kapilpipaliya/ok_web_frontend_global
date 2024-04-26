import { Title } from "@solidjs/meta";
import Header from "~/components/website/Header";
import '../../css/style.css'
import '../../css/krd.css'
import SiteTitle from "~/components/website/utils";
export default function Account() {
  return (
    <main>
      <Header />
        <SiteTitle>Account</SiteTitle>
        <h3>Account</h3>
    </main>
  );
}
