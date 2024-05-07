"use client";
import "~/css/style.css";
import "~/css/krd.css";
export default function Footer() {
  return (
    <section class="footer">
      <div class="row container d-flex pb-3">
        <div class="info d-grid align-content-spacebetween">
          <div>
            <a href="">
              <img class="headerLogo" src="graphics/logo.png" alt="logo" />
            </a>
            <p>Design and publish forms faster, smoother</p>
          </div>

          <a class="pb-1 btn-underline" href="#">
            Get Easy Form Forge <i class="fa-solid fa-arrow-right"></i>
          </a>
          <div class="footericon">
            <a href="#">
              <i class="fa-brands fa-square-facebook"></i>
            </a>
            <a href="#">
              <i class="fa-brands fa-square-x-twitter"></i>
            </a>
            <a href="#">
              <i class="fa-brands fa-linkedin"></i>
            </a>
            <a href="#">
              <i class="fa-brands fa-youtube"></i>
            </a>
          </div>
        </div>
        <div class="company">
          <h5>Company</h5>
          <ul>
            <li>
              <a href="#">About Us</a>
            </li>
            <li>
              <a href="#">Testimonials</a>
            </li>
            <li>
              <a href="#">My Account</a>
            </li>
            <li>
              <a href="#">Blogs</a>
            </li>
          </ul>
        </div>
        <div class="company">
          <h5>Links</h5>
          <ul>
            <li>
              <a href="#">Site maps</a>
            </li>
            <li>
              <a href="#">Blogs</a>
            </li>
            <li>
              <a href="#">Documentation</a>
            </li>
            <li>
              <a href="#">Return</a>
            </li>
          </ul>
        </div>

        <div class="company">
          <h5>Privacy</h5>
          <ul>
            <li>
              <a href="#">About Us</a>
            </li>
            <li>
              <a href="#">Testimonials</a>
            </li>
            <li>
              <a href="#">My Account</a>
            </li>
            <li>
              <a href="#">Blogs</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="copyrightandsocial container d-flex pt-2 justify-content-center">
        <div>
          <h6>
            © 2024 <b>EasyFromForge </b> All rights reserved
          </h6>
        </div>
        <div>
          <i class="fa-brands fa-square-facebook"></i>
          <i class="fa-brands fa-square-x-twitter"></i>
          <i class="fa-brands fa-linkedin"></i>
          <i class="fa-brands fa-youtube"></i>
        </div>
      </div>
    </section>
  );
}
