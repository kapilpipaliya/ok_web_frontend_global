import { Footer } from "~/components/website/Footer";
import "~/components/website/style.css";
import "~/components/website/krd.css";
import { createSignal, useContext } from "solid-js";
import { Header } from "../Header";
import SiteTitle from "../SiteTitle";
import { contactUsCall } from "~/lib/api/api_functions";
import { useNavigate } from "@solidjs/router";
import { useToast } from "~/components/custom/Toast";
import "~/css/base.css";
import { LoadingContext } from "~/lib/contexts";
import { validateEmail } from "~/lib/validations";
export default function ContactUs() {
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();
  const [formData, setFormData] = createSignal({
    email: "",
    name: "",
    subject: "",
    message: "",
  });
  const [loadingSite, setLoadingSite] = useContext(LoadingContext);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const emailError = validateEmail(formData().email);
    if (emailError) {
      showErrorToast(emailError); // Show the error message if validation fails
    } else {
      setLoadingSite(true);
      await showLoadingToast({
        promise: contactUsCall(formData),
        loadMessage: "Sending message...",
        successMessage: "Message Sent Successfully",
        onSuccess: (value) => {
          setFormData({
            email: "",
            name: "",
            subject: "",
            message: "",
          });
        },
      });
      setLoadingSite(false);
    }
  };
  return (
    <div
      style={{
        "background-image":
          "url('https://i.ibb.co/dbr8LBk/bg-contact-us-page.jpg')",
        "background-size": "cover",
      }}
    >
      <SiteTitle>Contact Us</SiteTitle>

      <Header />
      <div
        class="@fade|.5s"
        style={{
          flex: "auto",
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          "justify-content": "center",
          padding: "43px",
        }}
      >
        <form
          class="m:10px w:inherit bg:white jc:center r:10"
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            padding: "20px 30px",
            "box-shadow": "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div class="d:none@<md flex jc:center w:-webkit-fill-available">
            <img
              src={"../../public/graphics/contact-us.jpg"}
              alt="logo"
              class="w:25rem "
            />
          </div>
          <div class="mt:25 w:-webkit-fill-available w:100%@<md grid align-content:center m:0|30@lg">
            <div class="mb:5 f:20 font-weight:bold flex jc:left z:10">
              Contact Us
            </div>
            <div class="mb:10 f:15 font-weight:medium color:rgb(152,152,153) flex jc:left z:10">
              We are open or any suggestions, please don't hesitate to contact
              us.
            </div>
            <div class="grid grid-template-columns:1fr|50%@>md gap:10 ">
              <div>
                <label
                  for="fullname"
                  class="f:14"
                  style={{ display: "block", "margin-bottom": "5px" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData().name}
                  onInput={(e) =>
                    setFormData({ ...formData(), name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    "border-radius": "4px",
                  }}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label
                  for="email"
                  class="f:14"
                  style={{ display: "block", "margin-bottom": "10px" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData().email}
                  onInput={(e) =>
                    setFormData({ ...formData(), email: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    "border-radius": "4px",
                  }}
                  placeholder="Your email"
                  required
                />
              </div>
            </div>
            <div style={{ margin: "10px 0" }}>
              <label
                for="subject"
                class="f:14"
                style={{ display: "block", "margin-bottom": "5px" }}
              >
                Subject
              </label>
              <input
                name="subject"
                id="subject"
                type="text"
                value={formData().subject}
                onInput={(e) =>
                  setFormData({ ...formData(), subject: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  "border-radius": "4px",
                }}
                placeholder="What's the subject?"
                required
              />
            </div>
            <div style={{ "margin-bottom": "10px 0" }}>
              <label
                for="username"
                class="f:14"
                style={{ display: "block", "margin-bottom": "5px" }}
              >
                Message
              </label>
              <textarea
                id="message"
                rows="4"
                typeof="textarea"
                aria-multiline="true"
                name="text"
                class="max-h:10rem"
                value={formData().message}
                onInput={(e) =>
                  setFormData({ ...formData(), message: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  "border-radius": "4px",
                }}
                placeholder="Write your message.."
                required
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px",
                background: "rgb(226,65,74)",
                color: "white",
                border: "none",
                "border-radius": "4px",
                cursor: "pointer",
              }}
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
const ContactForm = () => {
  const [firstName, setFirstName] = createSignal("");
  const [lastName, setLastName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [phone, setPhone] = createSignal("");
  const [subject, setSubject] = createSignal("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Handle form submission
    console.log({
      firstName: firstName(),
      lastName: lastName(),
      email: email(),
      phone: phone(),
      subject: subject(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div class="form-inline">
        <label for="fname">First Name</label>
        <input
          type="text"
          id="fname"
          name="firstname"
          placeholder="First name.."
          onInput={(e) => setFirstName(e.target.value)}
        />

        <label for="lname">Last Name</label>
        <input
          type="text"
          id="lname"
          name="lastname"
          placeholder="Last name.."
          onInput={(e) => setLastName(e.target.value)}
        />
      </div>

      <div class="form-inline">
        <label for="email">
          <b>Email</b>
        </label>
        <input
          type="text"
          placeholder="Email"
          name="email"
          required
          onInput={(e) => setEmail(e.target.value)}
        />

        <label for="phone">Enter your phone number:</label>
        <input
          type="text"
          id="phone"
          name="phone"
          placeholder="Phone Number"
          onInput={(e) => setPhone(e.target.value)}
        />
      </div>

      <label for="subject">Subject</label>
      <textarea
        id="subject"
        name="subject"
        placeholder="Your message.."
        style="height:200px"
        onInput={(e) => setSubject(e.target.value)}
      />

      <input
        class="btn-small-icon-filled formsubmitbtn"
        type="submit"
        value="Submit"
      />
    </form>
  );
};
const ContactWays = () => (
  <div class="contactways pt-5">
    <div class="phone">
      <a href="#">
        <i class="fa-solid fa-phone-volume" />
      </a>
      <h5 class="">Call</h5>
      <h4>9879879879</h4>
    </div>
    <div class="email">
      <a href="#">
        <i class="fa-solid fa-envelope" />
      </a>
      <h5 class="">Email</h5>
      <h4>hi@easyform.com</h4>
    </div>
    <div class="address">
      <a href="#">
        <i class="fa-solid fa-location-dot" />
      </a>
      <h5 class="">Address</h5>
      <p class="text-center">
        #124, Rockwell street, <br />
        Amhedabad, 360009
      </p>
    </div>
  </div>
);
