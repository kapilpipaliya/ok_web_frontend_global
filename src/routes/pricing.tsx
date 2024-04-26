import { Title } from "@solidjs/meta";
import Footer from "~/components/website/Footer";
import Header from "~/components/website/Header";
import '../../css/style.css'
import '../../css/krd.css'
import SiteTitle from "~/components/website/utils";
export default function Pricing() {
  return (
    <>
      <SiteTitle>Pricing</SiteTitle>

      <Header />
      <section class="pricingContent mb-5 pt-100">
        <div class="container d-grid justify-content-center justify-item-center">
          <h1>
            We believe that everyone should have <br />
            access to valuable assets to improve <br />
            their important work
          </h1>

          <div class="tick mt-5">
            <p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.5em"
                height="1.5em"
                viewBox="0 0 15 15"
              >
                <path
                  fill="#0a9353"
                  fill-rule="evenodd"
                  d="M7.252.066a.5.5 0 0 1 .496 0l7 4A.5.5 0 0 1 15 4.5v.72a10.15 10.15 0 0 1-7.363 9.76a.5.5 0 0 1-.274 0A10.152 10.152 0 0 1 0 5.22V4.5a.5.5 0 0 1 .252-.434zm-.18 10.645l4.318-5.399l-.78-.624l-3.682 4.601L4.32 7.116l-.64.768z"
                  clip-rule="evenodd"
                />
              </svg>
              30 Days trial
            </p>
            <p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.5em"
                height="1.5em"
                viewBox="0 0 15 15"
              >
                <path
                  fill="#0a9353"
                  fill-rule="evenodd"
                  d="M7.252.066a.5.5 0 0 1 .496 0l7 4A.5.5 0 0 1 15 4.5v.72a10.15 10.15 0 0 1-7.363 9.76a.5.5 0 0 1-.274 0A10.152 10.152 0 0 1 0 5.22V4.5a.5.5 0 0 1 .252-.434zm-.18 10.645l4.318-5.399l-.78-.624l-3.682 4.601L4.32 7.116l-.64.768z"
                  clip-rule="evenodd"
                />
              </svg>
              Cancel anytime
            </p>
            <p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.5em"
                height="1.5em"
                viewBox="0 0 15 15"
              >
                <path
                  fill="#0a9353"
                  fill-rule="evenodd"
                  d="M7.252.066a.5.5 0 0 1 .496 0l7 4A.5.5 0 0 1 15 4.5v.72a10.15 10.15 0 0 1-7.363 9.76a.5.5 0 0 1-.274 0A10.152 10.152 0 0 1 0 5.22V4.5a.5.5 0 0 1 .252-.434zm-.18 10.645l4.318-5.399l-.78-.624l-3.682 4.601L4.32 7.116l-.64.768z"
                  clip-rule="evenodd"
                />
              </svg>
              24/7 Customer Support
            </p>
          </div>

          <div class="billing mt-5">
            <a class="monthbill" href="#">
              Month Billing
            </a>
            <a class="annualbill" href="#">
              Annual Billing
            </a>
          </div>

          <h5 class="color-info mt-2">Save upto 20%</h5>

          <div class="plan mt-5">
            <div class="Silver">
              <h4>Silver</h4>
              <div class="planprice">
                <h2 class="mr-2">$0</h2>
                <p>
                  per month <br /> incl. tax
                </p>
              </div>

              <button class="btn-mid-icon-filled">Buy Now</button>
              <hr />

              <h5 class="mb-2 mt-1">FEATURES</h5>

              <h5>
                <i class="fa-solid fa-check mr-1"></i>5 forms{" "}
                <span>form limit</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>100{" "}
                <span>Monthly Subscription</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>1 User{" "}
                <span>Per Team</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>100 MB{" "}
                <span>Available Space</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>1000{" "}
                <span>Monthly Views</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>500{" "}
                <span>Total Submission Storage</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>10 Fields
                <span>Per Form</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>10
                <span>Monthly payment submission</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>10
                <span>Monthly signed document</span>
              </h5>
            </div>

            <div class="GoldR">
              <h5 class="text-center recommended">Recommended</h5>
              <div class="Gold">
                <h4>Gold</h4>
                <div class="planprice">
                  <h2 class="mr-2">$ 10</h2>
                  <p>
                    per month <br /> incl. tax
                  </p>
                </div>

                <button class="btn-mid-icon-filled bg-pink">Buy Now</button>
                <hr />

                <h5 class="mb-2 mt-1">FEATURES</h5>

                <h5>
                  <i class="fa-solid fa-check mr-1"></i>25 forms{" "}
                  <span>form limit</span>
                </h5>
                <h5>
                  <i class="fa-solid fa-check mr-1"></i>1000{" "}
                  <span>Monthly Subscription</span>
                </h5>
                <h5>
                  <i class="fa-solid fa-check mr-1"></i>1 User{" "}
                  <span>Per Team</span>
                </h5>
                <h5>
                  <i class="fa-solid fa-check mr-1"></i>1 GB{" "}
                  <span>Available Space</span>
                </h5>
                <h5>
                  <i class="fa-solid fa-check mr-1"></i>10000{" "}
                  <span>Monthly Views</span>
                </h5>
                <h5>
                  <i class="fa-solid fa-check mr-1"></i>1000{" "}
                  <span>Total Submission Storage</span>
                </h5>
                <h5>
                  <i class="fa-solid fa-check mr-1"></i>30 Fields
                  <span>Per Form</span>
                </h5>
                <h5>
                  <i class="fa-solid fa-check mr-1"></i>49
                  <span>Monthly payment submission</span>
                </h5>
                <h5>
                  <i class="fa-solid fa-check mr-1"></i>90
                  <span>Monthly signed document</span>
                </h5>
              </div>
            </div>

            <div class="Platinum">
              <h4>Platinum</h4>
              <div class="planprice">
                <h2 class="mr-2">$ 20</h2>
                <p>
                  per month <br /> incl. tax
                </p>
              </div>

              <button class="btn-mid-icon-filled">Buy Now</button>
              <hr />

              <h5 class="mb-2 mt-1">FEATURES</h5>

              <h5>
                <i class="fa-solid fa-check mr-1"></i>100 forms{" "}
                <span>form limit</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>5000{" "}
                <span>Monthly Subscription</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>10 User{" "}
                <span>Per Team</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>10 GB{" "}
                <span>Available Space</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>9999{" "}
                <span>Monthly Views</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>9999{" "}
                <span>Total Submission Storage</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>50 Fields
                <span>Per Form</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>99
                <span>Monthly payment submission</span>
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>1000
                <span>Monthly signed document</span>
              </h5>
            </div>
            <div class="Custom">
              <h4 class="color-white">Enterprise</h4>
              <div class="planprice">
                <h2>Offer *</h2>
                <p>
                  per month <br /> incl. tax
                </p>
              </div>

              <button class="btn-mid-icon-filled bg-white color-pink">
                Buy Now
              </button>
              <button class="btn-mid-icon-filled enterpriceContactbtn">
                Contact
              </button>
              <hr />

              <h5 class="mb-2 mt-1">FEATURES</h5>

              <h5>
                <i class="fa-solid fa-check mr-1"></i>Unlimited forms
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>Special pricing <br />{" "}
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for all features
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>Extra API supports
              </h5>
              <h5>
                <i class="fa-solid fa-check mr-1"></i>Priority support
              </h5>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
