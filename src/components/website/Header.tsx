"use client";

import { useNavigate } from "@solidjs/router";
import { Icon } from "@iconify-icon/solid";
import logos from "~/assets/graphics/logo.png";
import "~/css/style.css";
import "~/css/krd.css";
export default function Header() {
  const navigate = useNavigate();
  return (
    <section class="header container">
      <div class="logo">
        <a href="/">
          <img class="headerLogo" src={logos} alt="logo" />
        </a>
      </div>

      <div class="links">
        <ul>
          <li>
            <a class="bodycopytext-16" href="/">
              Home
            </a>
          </li>
          <li>
            <a class="bodycopytext-16" href="/account">
              Account
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

          {/*<div class="dropdown">*/}
          {/*  <button class="dropbtn">Language</button>*/}
          {/*  <a class="dropbtn bodycopytext-16" href="#" />*/}
          {/*  <div class="dropdown-content">*/}
          {/*    <a href="#">Spanish</a>*/}
          {/*    <a href="#">Russian</a>*/}
          {/*    <a href="#">Korean</a>*/}
          {/*  </div>*/}
          {/*</div>*/}
        </ul>
      </div>
      <div class="flex">
        <button
          class="btn-small-icon-filled flex ai:center"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/auth/login")}
        >
          Get Started{" "}
          <Icon
            icon={"fa-solid:chevron-right"}
            class="fa-solid fa-chevron-right ml:10"
          />
        </button>
      </div>
    </section>
  );
}
