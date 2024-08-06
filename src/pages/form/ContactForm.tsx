import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";

import logo from "~/assets/graphics/logo.png";
import { useToast } from "~/components/Toast";
import { contactUsCall } from "~/lib/api/service/support/contactUsCall";
import { validateEmail } from "~/lib/validation/validateEmail";

// Deprecated: This component will be replaced in the next major version.
export function ContactForm() {
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();
  const [formData, setFormData] = createSignal({
    email: "",
    message: "",
    name: "",
    subject: "",
  });
  const [_loadingSite, setLoadingSite] = createSignal(false);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const emailError = validateEmail(formData().email);
    if (emailError) {
      showErrorToast(emailError); // Show the error message if validation fails
    } else {
      setLoadingSite(true);
      await showLoadingToast({
        loadMessage: "Sending message...",
        onSuccess: (_value) => {
          navigate("/");
        },
        promise: contactUsCall(formData),
        successMessage: "Message Sent Successfully",
      });
      setLoadingSite(false);
    }
  };

  return (
    <div class="flex @fade|.5s ai:center bg:cover bg:rgb(239,235,233) bg:url('https://img.freepik.com/free-vector/blurred-background-with-light-colors_1034-245.jpg?size=338&ext=jpg&ga=GA1.1.1224184972.1714435200&semt=ais') flex:auto flex:column h:100vh jc:center">
      <img alt="logo" class="h:70px js:center mb:100px" src={logo} />
      <form
        class="flex bg:white jc:center m:10px mb:5rem p:20px|30px r:10 shadow:0|4px|8px|rgba(0,0,0,0.1) w:inherit"
        onSubmit={handleSubmit}
      >
        <div class="flex d:none@<md jc:center w:-webkit-fill-available">
          <img
            alt="logo"
            class="w:25rem "
            src={"../../public/graphics/contact-us.jpg"}
          />
        </div>
        <div class="grid align-content:center m:0|30@lg mt:25 w:-webkit-fill-available w:100%@<md">
          <div class="flex f:20 font-weight:bold jc:left mb:5">Contact Us</div>
          <div class="flex color:rgb(152,152,153) f:15 font-weight:medium jc:left mb:10">
            We are open or any suggestions, please don't hesitate to contact us.
          </div>
          <div class="grid gap:10 grid-template-columns:1fr|50%@>md ">
            <div>
              <label class="block f:14 mb:5px" for="fullname">
                Full Name
              </label>
              <input
                class="border:1px|solid|#ccc p:8px r:4px w:100%"
                id="name"
                name="name"
                onInput={(e) =>
                  setFormData({ ...formData(), name: e.target.value })
                }
                placeholder="Your name"
                required
                type="text"
                value={formData().name}
              />
            </div>
            <div>
              <label class="block f:14 mb:5px" for="email">
                Email Address
              </label>
              <input
                class="border:1px|solid|#ccc p:8px r:4px w:100%"
                id="email"
                name="email"
                onInput={(e) =>
                  setFormData({ ...formData(), email: e.target.value })
                }
                placeholder="Your email"
                required
                type="email"
                value={formData().email}
              />
            </div>
          </div>
          <div class="m:10px|0">
            <label class="block f:14 mb:5px" for="subject">
              Subject
            </label>
            <input
              class="border:1px|solid|#ccc p:8px r:4px w:100%"
              id="subject"
              name="subject"
              onInput={(e) =>
                setFormData({ ...formData(), subject: e.target.value })
              }
              placeholder="What's the subject?"
              required
              type="text"
              value={formData().subject}
            />
          </div>
          <div class="mb:10px|0">
            <label class="block f:14 mb:5px" for="username">
              Message
            </label>
            <textarea
              aria-multiline="true"
              class="border:1px|solid|#ccc max-h:10rem p:8px r:4px w:100%"
              id="message"
              name="text"
              onInput={(e) =>
                setFormData({ ...formData(), message: e.target.value })
              }
              placeholder="Write your message.."
              required
              rows="4"
              typeof="textarea"
              value={formData().message}
            />
          </div>

          <button
            class="bg:rgb(226,65,74) border:none color:white cursor:pointer p:10px r:4px w:100%"
            type="submit"
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
}
