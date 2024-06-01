import { createSignal } from "solid-js";
import { validateEmail } from "~/lib/Utils";
import { useNavigate } from "@solidjs/router";
import { useToast } from "~/components/custom/Toast";
import logo from "~/assets/graphics/logo.png";
import { contactUsCall } from "~/components/api/api_functions";
import '~/css/base.css'
export function ContactForm() {
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();
  const [formData, setFormData] = createSignal({
    email: "",
    name: "",
    subject: "",
    message: "",
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
        promise: contactUsCall(formData),
        loadMessage: "Sending message...",
        successMessage: "Message Sent Successfully",
        onSuccess: (value) => {
          navigate("/");
        },
      });
      setLoadingSite(false);
    }
  };

  return (
    <div
      class="@fade|.5s"
      style={{
        flex: "auto",
        "background-size": "cover",
        "background-image":
          "url('https://img.freepik.com/free-vector/blurred-background-with-light-colors_1034-245.jpg?size=338&ext=jpg&ga=GA1.1.1224184972.1714435200&semt=ais')",
        display: "flex",
        "background-color": "rgb(239,235,233)",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        height: "100vh",
      }}
    >
      <img
        src={logo}
        alt="logo"
        class="h:70px mb:100px"
        style={{ "justify-self": "center" }}
      />
      <form
        class="m:10px w:inherit mb:5rem bg:white jc:center r:10"
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
            We are open or any suggestions, please don't hesitate to contact us.
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
                style={{ display: "block", "margin-bottom": "5px" }}
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
  );
}
