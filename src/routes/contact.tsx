import Footer from "~/components/website/Footer";
import Header from "~/components/website/Header";
import '../../css/style.css'
import '../../css/krd.css'
import SiteTitle from "~/components/website/utils";
export default function Contact() {
  return (
    <>
      <SiteTitle>Contact Us</SiteTitle>

      <Header />
      <div class="cntc pt-5">
        <div class="innersection container pb-100">
          <h1 class="pt-100">Get in touch</h1>

          <div class="container formContact mt-5">
            <form action="">
              <div class="form-inline">
                <label for="fname">First Name</label>
                <input
                  type="text"
                  id="fname"
                  name="firstname"
                  placeholder="First name.."
                />

                <label for="lname">Last Name</label>
                <input
                  type="text"
                  id="lname"
                  name="lastname"
                  placeholder="Last name.."
                />
              </div>

              <div class="form-inline">
                <label for="email">
                  <b>Email</b>
                </label>
                <input type="text" placeholder="Email" name="email" required />
                <label for="phone">Enter your phone number:</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  placeholder="Phone Number"
                />
              </div>

              <label for="subject">Subject</label>
              <textarea
                id="subject"
                name="subject"
                placeholder="Your message.."
                style="height:200px"
              ></textarea>

              <input
                class="btn-small-icon-filled formsubmitbtn"
                type="submit"
                value="Submit"
              />
            </form>
          </div>

          <div class="contactways pt-5">
            <div class="phone">
              <a href="#">
                <i class="fa-solid fa-phone-volume"></i>
              </a>
              <h5 class="">Call</h5>
              <h4>9879879879</h4>
            </div>
            <div class="email">
              <a href="#">
                <i class="fa-solid fa-envelope"></i>
              </a>
              <h5 class="">Email</h5>
              <h4>hi@easyform.com</h4>
            </div>
            <div class="address">
              <a href="#">
                <i class="fa-solid fa-location-dot"></i>
              </a>
              <h5 class="">Address</h5>
              <p class="text-center">
                #124, Rockwell street, <br />
                Amhedabad, 360009
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
