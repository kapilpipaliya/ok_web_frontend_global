import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";

import { useToast } from "~/components/Toast";
import { contactUsCall } from "~/lib/api/api_functions";
import { useLoading } from "~/lib/contexts";
import { validateEmail } from "~/lib/validations";
import { Footer } from "~/pages/website/Footer";
import "~/pages/website/krd.css";
import "~/pages/website/style.css";

import { Header } from "./Header";
import { SiteTitle } from "./SiteTitle";

export function ContactUs() {
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();
  const [formData, setFormData] = createSignal({
    email: "",
    message: "",
    name: "",
    subject: "",
  });
  const [loadingSite, setLoadingSite] = useLoading();

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const emailError = validateEmail(formData().email);
    if (emailError) {
      showErrorToast(emailError); // Show the error message if validation fails
    } else {
      setLoadingSite(true);
      await showLoadingToast({
        loadMessage: "Sending message...",
        onSuccess: (value) => {
          setFormData({
            email: "",
            message: "",
            name: "",
            subject: "",
          });
        },
        promise: contactUsCall(formData),
        successMessage: "Message Sent Successfully",
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
      <SiteTitle>Contact Us - Get in Touch with EasyFormForge</SiteTitle>

      <Header />
      <div
        class="@fade|.5s"
        style={{
          "align-items": "center",
          display: "flex",
          flex: "auto",
          "flex-direction": "column",
          "justify-content": "center",
          padding: "43px",
        }}
      >
        <form
          class="bg:white jc:center m:10px r:10 w:inherit"
          onSubmit={handleSubmit}
          style={{
            "box-shadow": "0 4px 8px rgba(0,0,0,0.1)",
            display: "flex",
            padding: "20px 30px",
          }}
        >
          <div class="flex d:none@<md jc:center w:-webkit-fill-available">
            <img
              alt="Contact Us"
              class="w:25rem "
              src={"../../public/graphics/contact-us.jpg"}
            />
          </div>
          <div class="grid align-content:center m:0|30@lg mt:25 w:-webkit-fill-available w:100%@<md">
            <div class="flex f:20 font-weight:bold jc:left mb:5">
              Contact Us
            </div>
            <div class="flex color:rgb(152,152,153) f:15 font-weight:medium jc:left mb:10">
              We are open to any suggestions, please don't hesitate to contact
              us.
            </div>
            <div class="grid gap:10 grid-template-columns:1fr|50%@>md ">
              <div>
                <label
                  class="f:14"
                  for="fullname"
                  style={{ display: "block", "margin-bottom": "5px" }}
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  onInput={(e) =>
                    setFormData({ ...formData(), name: e.target.value })
                  }
                  placeholder="Your name"
                  required
                  style={{
                    border: "1px solid #ccc",
                    "border-radius": "4px",
                    padding: "8px",
                    width: "100%",
                  }}
                  type="text"
                  value={formData().name}
                />
              </div>
              <div>
                <label
                  class="f:14"
                  for="email"
                  style={{ display: "block", "margin-bottom": "10px" }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  onInput={(e) =>
                    setFormData({ ...formData(), email: e.target.value })
                  }
                  placeholder="Your email"
                  required
                  style={{
                    border: "1px solid #ccc",
                    "border-radius": "4px",
                    padding: "8px",
                    width: "100%",
                  }}
                  type="email"
                  value={formData().email}
                />
              </div>
            </div>
            <div style={{ margin: "10px 0" }}>
              <label
                class="f:14"
                for="subject"
                style={{ display: "block", "margin-bottom": "5px" }}
              >
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                onInput={(e) =>
                  setFormData({ ...formData(), subject: e.target.value })
                }
                placeholder="What's the subject?"
                required
                style={{
                  border: "1px solid #ccc",
                  "border-radius": "4px",
                  padding: "8px",
                  width: "100%",
                }}
                type="text"
                value={formData().subject}
              />
            </div>
            <div style={{ "margin-bottom": "10px 0" }}>
              <label
                class="f:14"
                for="username"
                style={{ display: "block", "margin-bottom": "5px" }}
              >
                Message
              </label>
              <textarea
                aria-multiline="true"
                class="max-h:10rem"
                id="message"
                name="text"
                onInput={(e) =>
                  setFormData({ ...formData(), message: e.target.value })
                }
                placeholder="Write your message.."
                required
                rows="4"
                style={{
                  border: "1px solid #ccc",
                  "border-radius": "4px",
                  padding: "8px",
                  width: "100%",
                }}
                typeof="textarea"
                value={formData().message}
              />
            </div>

            <button
              style={{
                background: "rgb(226,65,74)",
                border: "none",
                "border-radius": "4px",
                color: "white",
                cursor: "pointer",
                padding: "10px",
                width: "100%",
              }}
              type="submit"
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
      email: email(),
      firstName: firstName(),
      lastName: lastName(),
      phone: phone(),
      subject: subject(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div class="form-inline">
        <label for="fname">First Name</label>
        <input
          id="fname"
          name="firstname"
          onInput={(e) => setFirstName(e.target.value)}
          placeholder="First name.."
          type="text"
        />

        <label for="lname">Last Name</label>
        <input
          id="lname"
          name="lastname"
          onInput={(e) => setLastName(e.target.value)}
          placeholder="Last name.."
          type="text"
        />
      </div>

      <div class="form-inline">
        <label for="email">
          <b>Email</b>
        </label>
        <input
          name="email"
          onInput={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          type="text"
        />

        <label for="phone">Enter your phone number:</label>
        <input
          id="phone"
          name="phone"
          onInput={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          type="text"
        />
      </div>

      <label for="subject">Subject</label>
      <textarea
        id="subject"
        name="subject"
        onInput={(e) => setSubject(e.target.value)}
        placeholder="Your message.."
        style="height:200px"
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
