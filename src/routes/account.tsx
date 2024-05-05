import { Title } from "@solidjs/meta";
import Header from "~/components/website/Header";
import '../../css/style.css'
import '../../css/krd.css'
import SiteTitle from "~/components/website/utils";
import { For, Show, createSignal } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { iconMap } from "~/components/Utils";
export default function Account() {

  return (
    <main>
      {/* <Header /> */}
      <SiteTitle>Account</SiteTitle>
      
    </main>
  );
}
