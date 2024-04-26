"use client";

import {useNavigate} from "@solidjs/router";

export default function Header() {
  const navigate = useNavigate();
  return (
    <section class="header container">

        <div class="logo">
          <a href="/">
            <img class="headerLogo" src="graphics/logo.png" alt="logo" />
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

            <div class="dropdown">
              <button class="dropbtn">Language</button>
              <a class="dropbtn bodycopytext-16" href="#">
                 <i class="fa-solid fa-chevron-down" />
              </a>
              <div class="dropdown-content">
                <a href="#">Spanish</a>
                <a href="#">Russian</a>
                <a href="#">Korean</a>
              </div>
            </div>
          </ul>
        </div>
        <button class="btn-small-icon-filled" onClick={()=>navigate("/auth/login")}>
          Get Started <i class="fa-solid fa-chevron-right"></i>
        </button>
      </section>
  );
}
