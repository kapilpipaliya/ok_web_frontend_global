import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";

import logo from "~/assets/graphics/logo.png";
import { useToast } from "~/components/Toast";
import "~/css/base.css";
import { contactUsCall } from "~/lib/api/api_functions";
import { validateEmail } from "~/lib/validations";
export function ContactForm() {
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();
  const [formData, setFormData] = createSignal({
    email: "",
    message: "",
    name: "",
    subject: "",
  });
  const [loadingSite, setLoadingSite] = createSignal(false);

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
          navigate("/");
        },
        promise: contactUsCall(formData),
        successMessage: "Message Sent Successfully",
      });
      setLoadingSite(false);
    }
  };

  return (
    <div
      class="@fade|.5s"
      style={{
        "align-items": "center",
        "background-color": "rgb(239,235,233)",
        "background-image":
          "url('https://img.freepik.com/free-vector/blurred-background-with-light-colors_1034-245.jpg?size=338&ext=jpg&ga=GA1.1.1224184972.1714435200&semt=ais')",
        "background-size": "cover",
        display: "flex",
        flex: "auto",
        "flex-direction": "column",
        height: "100vh",
        "justify-content": "center",
      }}
    >
      <img
        alt="logo"
        class="h:70px mb:100px"
        src={logo}
        style={{ "justify-self": "center" }}
      />
      <form
        class="bg:white jc:center m:10px mb:5rem r:10 w:inherit"
        onSubmit={handleSubmit}
        style={{
          "box-shadow": "0 4px 8px rgba(0,0,0,0.1)",
          display: "flex",
          padding: "20px 30px",
        }}
      >
        <div class="flex d:none@<md jc:center w:-webkit-fill-available">
          <img
            alt="logo"
            class="w:25rem "
            src={"../../public/graphics/contact-us.jpg"}
          />
        </div>
        <div class="grid align-content:center m:0|30@lg mt:25 w:-webkit-fill-available w:100%@<md">
          <div class="flex f:20 font-weight:bold jc:left mb:5 z:10">
            Contact Us
          </div>
          <div class="flex color:rgb(152,152,153) f:15 font-weight:medium jc:left mb:10 z:10">
            We are open or any suggestions, please don't hesitate to contact us.
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
                style={{ display: "block", "margin-bottom": "5px" }}
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
  );
}
