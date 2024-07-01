import { Icon } from "@iconify-icon/solid";
import { useNavigate } from "@solidjs/router";

import logos from "~/assets/graphics/logo.png";
import "~/pages/website/krd.css";
import "~/pages/website/style.css";

export function Header() {
  const navigate = useNavigate();
  return (
    <header class="header flex jc:space-around ai:center flex-direction:row">
      <div class="logo">
        <a aria-label="EasyFormForge Home" href="/public">
          <img alt="EasyFormForge Logo" class="headerLogo" src={logos} />
        </a>
      </div>

      <nav aria-label="Main Navigation" class="links">
        <ul>
          <li>
            <a class="bodycopytext-16" href="/public">
              Home
            </a>
          </li>
          <li>
            <a class="bodycopytext-16" href="/contact">
              Contact Us
            </a>
          </li>
          <li>
            <a class="bodycopytext-16" href="/pricing">
              Pricing
            </a>
          </li>
        </ul>
      </nav>
      <div class="flex">
        <button
          aria-label="Get Started"
          class="btn-small-icon-filled flex ai:center"
          onClick={() => navigate("/auth/login")}
          style={{ cursor: "pointer" }}
        >
          Get Started{" "}
          <Icon
            class="fa-solid fa-chevron-right ml:10"
            icon={"fa-solid:chevron-right"}
          />
        </button>
      </div>
    </header>
  );
}
