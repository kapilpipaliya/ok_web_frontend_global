import { useNavigate } from "@solidjs/router";
import { Icon } from "@iconify-icon/solid";
import logos from "~/assets/graphics/logo.png";
import "~/pages/website/style.css";
import "~/pages/website/krd.css";

export function Header() {
  const navigate = useNavigate();
  return (
    <header class="header flex jc:space-around ai:center flex-direction:row">
      <div class="logo">
        <a href="/public" aria-label="EasyFormForge Home">
          <img class="headerLogo" src={logos} alt="EasyFormForge Logo" />
        </a>
      </div>

      <nav class="links" aria-label="Main Navigation">
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
          class="btn-small-icon-filled flex ai:center"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/auth/login")}
          aria-label="Get Started"
        >
          Get Started{" "}
          <Icon
            icon={"fa-solid:chevron-right"}
            class="fa-solid fa-chevron-right ml:10"
          />
        </button>
      </div>
    </header>
  );
}
