import { useNavigate } from "@solidjs/router";
import { createSignal, type JSX } from "solid-js";

import logo from "~/assets/graphics/logo.png";
import { useToast } from "~/components/styled/Toast";
import { validateEmail } from "~/lib/validation/validateEmail";
import {postAPI} from "~/lib/api/postApi";
import {API} from "~/lib/api/endpoints";

interface FormHeaderProps {
  subtitle: string;
  title: string;
}

interface InputFieldProps {
  id: string;
  label: string;
  name: string;
  onInput: (e: Event & { currentTarget: HTMLInputElement }) => void;
  placeholder: string;
  type: string;
  value: string;
}

interface TextAreaFieldProps {
  id: string;
  label: string;
  name: string;
  onInput: (e: Event & { currentTarget: HTMLTextAreaElement }) => void;
  placeholder: string;
  value: string;
}

// Deprecated: This component will be replaced in the next major version.
export function ContactForm(): JSX.Element {
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();
  const [formData, setFormData] = createSignal({
    email: "",
    message: "",
    name: "",
    subject: "",
  });
  const [_loadingSite, setLoadingSite] = createSignal(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData(), [field]: value });
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const emailError = validateEmail(formData().email);
    if (emailError) {
      showErrorToast(emailError);
    } else {
      setLoadingSite(true);
      await showLoadingToast({
        loadMessage: "Sending message...",
        onSuccess: () => {
          navigate("/");
        },
        promise: postAPI(API.profileUrl, {
          action: "create",
          email: formData().email.toLowerCase(),
          message: formData().message,
          name: formData().name,
          panel: "supportTicket",
          subject: formData().subject,
          uId: formData().uId,
        }),
        successMessage: "Message Sent Successfully",
      });
      setLoadingSite(false);
    }
  };

  return (
    <div class="flex @fade|.5s ai:center bg:cover bg:rgb(239,235,233) bg:url('https://img.freepik.com/free-vector/blurred-background-with-light-colors_1034-245.jpg?size=338&ext=jpg&ga=GA1.1.1224184972.1714435200&semt=ais') flex:auto flex:column h:100vh jc:center">
      <img alt="logo" class="h:70px js:center mb:100px" src={logo} />
      <form
        class="flex bg:base-5 jc:center m:10px mb:5rem p:20px|30px r:10 shadow:0|4px|8px|rgba(0,0,0,0.1) w:inherit"
        onSubmit={handleSubmit}
      >
        <div class="flex d:none@<md jc:center w:-webkit-fill-available">
          <img
            alt="Contact Us"
            class="w:25rem"
            src={"../../public/graphics/contact-us.jpg"}
          />
        </div>
        <div class="grid align-content:center m:0|30@lg mt:25 w:-webkit-fill-available w:100%@<md">
          <FormHeader
            subtitle="We are open for any suggestions, please don't hesitate to contact us."
            title="Contact Us"
          />

          <div class="grid gap:10 grid-template-columns:1fr|50%@>md">
            <InputField
              id="name"
              label="Full Name"
              name="name"
              onInput={(e) => handleInputChange("name", e.currentTarget.value)}
              placeholder="Your name"
              type="text"
              value={formData().name}
            />
            <InputField
              id="email"
              label="Email Address"
              name="email"
              onInput={(e) => handleInputChange("email", e.currentTarget.value)}
              placeholder="Your email"
              type="email"
              value={formData().email}
            />
          </div>

          <InputField
            id="subject"
            label="Subject"
            name="subject"
            onInput={(e) => handleInputChange("subject", e.currentTarget.value)}
            placeholder="What's the subject?"
            type="text"
            value={formData().subject}
          />

          <TextAreaField
            id="message"
            label="Message"
            name="message"
            onInput={(e) => handleInputChange("message", e.currentTarget.value)}
            placeholder="Write your message..."
            value={formData().message}
          />

          <button
            class="bg:rgb(226,65,74) border:none color:base-5 cursor:pointer p:10px r:4px w:100%"
            type="submit"
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
}

function FormHeader(props: Readonly<FormHeaderProps>): JSX.Element {
  return (
    <>
      <div class="flex f:20 font-weight:bold jc:left mb:5">{props.title}</div>
      <div class="flex color:rgb(152,152,153) f:15 font-weight:medium jc:left mb:10">
        {props.subtitle}
      </div>
    </>
  );
}

function InputField(props: Readonly<InputFieldProps>): JSX.Element {
  return (
    <div>
      <label class="block f:14 mb:5px" for={props.id}>
        {props.label}
      </label>
      <input
        class="border:1px|solid|#ccc p:8px r:4px w:100%"
        id={props.id}
        name={props.name}
        onInput={props.onInput}
        placeholder={props.placeholder}
        required
        type={props.type}
        value={props.value}
      />
    </div>
  );
}

function TextAreaField(props: Readonly<TextAreaFieldProps>): JSX.Element {
  return (
    <div class="mb:10px|0">
      <label class="block f:14 mb:5px" for={props.id}>
        {props.label}
      </label>
      <textarea
        aria-multiline="true"
        class="border:1px|solid|#ccc max-h:10rem p:8px r:4px w:100%"
        id={props.id}
        name={props.name}
        onInput={props.onInput}
        placeholder={props.placeholder}
        required
        rows={4}
        value={props.value}
      />
    </div>
  );
}
