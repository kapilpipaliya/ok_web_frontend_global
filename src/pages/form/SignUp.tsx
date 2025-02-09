import { Icon } from "@iconify-icon/solid";
import { useNavigate } from "@solidjs/router";
import { createSignal, type JSX } from "solid-js";

import logo from "~/assets/graphics/logo.png";
import { useToast } from "~/components/styled/Toast";
import { registerUserCall } from "~/lib/api/service/user/registerUserCall";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { validateEmail } from "~/lib/validation/validateEmail";
import { validatePassword } from "~/lib/validation/validatePassword";
import { validateUsername } from "~/lib/validation/validateUsername";

import { handleLoginRedirect } from "./handleLoginRedirect";

interface InputFieldProps {
  label: string;
  name: string;
  onInput: (e: Event & { currentTarget: HTMLInputElement }) => void;
  placeholder: string;
  value: string;
}

export function SignUp(): JSX.Element {
  const [graph, setGraph] = useGraph();
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();

  const [formData, setFormData] = createSignal({
    email: "",
    loginType: "signup",
    password: "",
    subDomain: "",
    username: "",
  });

  const [showPassword, setShowPassword] = createSignal(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword());
  };

  const handleSubmit = async (event: MouseEvent) => {
    event.preventDefault();

    const { email, password, username } = formData();

    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (usernameError) {
      showErrorToast(usernameError);
    } else if (emailError) {
      showErrorToast(emailError);
    } else if (passwordError) {
      showErrorToast(passwordError);
    } else {
      const globalStoreId = "globalStoreId";
      const _globalStore = graph.vertexes[globalStoreId] as Vertex;

      mergeVertexProperties(0, globalStoreId, graph, setGraph, {
        isLoadingPage: true,
      });
      await showLoadingToast({
        loadMessage: "Registering User...",
        onError: () => {
          mergeVertexProperties(0, globalStoreId, graph, setGraph, {
            isLoadingPage: false,
          });
        },
        onSuccess: (value) => {
          mergeVertexProperties(0, globalStoreId, graph, setGraph, {
            isLoadingPage: false,
          });
          handleLoginRedirect(value as Vertex, graph, navigate);
        },
        promise: registerUserCall(formData),
        successMessage: "Registered Successfully",
      });
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
        class="bg:white jc:center m:10px mb:5rem r:10"
        style={{
          "box-shadow": "0 4px 8px rgba(0,0,0,0.1)",
          display: "flex",
          padding: "20px 30px",
        }}
      >
        <img
          alt="register vector"
          class="d:none@<md w:25rem"
          src={"../../public/graphics/register_vector.png"}
        />
        <div class="grid align-content:center m:0|30@lg w:50% w:100%@<md">
          <div class="flex f:20 font-weight:bold jc:left mb:5">Sign Up</div>
          <div class="flex color:rgb(152,152,153) f:15 font-weight:medium jc:left mb:10">
            Let's Bright up your future!
          </div>
          <div class="grid gap:0|10 grid-template-columns:1fr|50%">
            <InputField
              label="Sub Domain"
              name="subDomain"
              onInput={(e) =>
                setFormData({ ...formData(), subDomain: e.target.value })
              }
              placeholder="Enter SubDomain"
              value={formData().subDomain}
            />
            <InputField
              label="Username"
              name="username"
              onInput={(e) =>
                setFormData({ ...formData(), username: e.target.value })
              }
              placeholder="Enter Name"
              value={formData().username}
            />
            <InputField
              label="Email Address"
              name="email"
              onInput={(e) =>
                setFormData({ ...formData(), email: e.target.value })
              }
              placeholder="Enter Email"
              value={formData().email}
            />
            <PasswordField
              label="Password"
              name="password"
              onInput={(e) =>
                setFormData({ ...formData(), password: e.target.value })
              }
              placeholder="Enter Password"
              showPassword={showPassword()}
              togglePasswordVisibility={togglePasswordVisibility}
              value={formData().password}
            />
          </div>

          <button
            onClick={handleSubmit}
            style={{
              background: "rgb(226,65,74)",
              border: "none",
              "border-radius": "4px",
              color: "white",
              cursor: "pointer",
              padding: "8px",
              width: "100%",
            }}
            type="button"
          >
            Sign Up
          </button>
          <div class="flex f:15 jc:center mt:20 text-align:center">
            Already have an account?&nbsp;
            <a href={"/auth/login"} replace={true}>
              <u class="font:bold">Sign In</u>
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}

const InputField = (props: InputFieldProps): JSX.Element => (
  <div class="m:10|0|0|0">
    <label
      class="f:14"
      for={props.name}
      style={{ display: "block", marginBottom: "5px" }}
    >
      {props.label}
    </label>
    <input
      name={props.name}
      onInput={props.onInput}
      placeholder={props.placeholder}
      required
      style={{
        border: "1px solid #ccc",
        "border-radius": "4px",
        padding: "8px",
        width: "100%",
      }}
      type="text"
      value={props.value}
    />
  </div>
);

interface PasswordFieldProps {
  label: string;
  name: string;
  onInput: (e: Event & { currentTarget: HTMLInputElement }) => void;
  placeholder: string;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  value: string;
}

const PasswordField = (props: PasswordFieldProps): JSX.Element => (
  <div class="m:10|0|10|0">
    <label
      class="f:14"
      for={props.name}
      style={{ display: "block", marginBottom: "5px" }}
    >
      {props.label}
    </label>
    <div class="rel">
      <input
        name={props.name}
        onInput={props.onInput}
        placeholder={props.placeholder}
        required
        style={{
          border: "1px solid #ccc",
          "border-radius": "4px",
          padding: "8px",
          width: "100%",
        }}
        type={props.showPassword ? "text" : "password"}
        value={props.value}
      />
      <Icon
        aria-label="Toggle password visibility"
        class="abs flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50% right:5 top:8"
        icon={props.showPassword ? "iconamoon:eye-light" : "iconamoon:eye-off"}
        noobserver
        onClick={props.togglePasswordVisibility}
      />
    </div>
  </div>
);
