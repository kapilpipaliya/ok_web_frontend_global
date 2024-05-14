import { createSignal } from "solid-js";
import {
  APP_BASE_URL,
  validateEmail,
  validatePassword,
  validateUsername,
} from "~/lib/Utils";
import { useNavigate } from "@solidjs/router";
import { useToast } from "~/components/custom/Toast";
import { Icon } from "@iconify-icon/solid";
import logo from "~/assets/graphics/logo.png";
import "~/css/base.css";
import { registerUserCall } from "~/components/api/api_functions";

export const SignUp = () => {
  // const {Ws} = useContext(WsContext);
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();
  const [loadingSite, setLoadingSite] = createSignal(false);

  const [formData, setFormData] = createSignal({
    username: "",
    subdomain: "",
    email: "",
    password: "",
    loginType: "signup",
  });

  const [showPassword, setShowPassword] = createSignal(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword());
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const usernameError = validateUsername(formData().username);
    const emailError = validateEmail(formData().email);
    const passwordError = validatePassword(formData().password);
    if (usernameError) {
      showErrorToast(usernameError); // Show the error message if validation fails
    } else if (emailError) {
      showErrorToast(emailError); // Show the error message if validation fails
    } else if (passwordError) {
      showErrorToast(passwordError); // Show the error message if validation fails
    } else {
      setLoadingSite(true);
      await showLoadingToast({
        promise: registerUserCall(formData),
        loadMessage: "Registering User...",
        successMessage: "Registered Successfully",
        onSuccess: (value) => {
          if (value != null && value.id !== null) {
            navigate(`${APP_BASE_URL}/Page`);
          }
        },
      });
      setLoadingSite(false);
    }
  };

  return (
    <div
      class="@fade|.5s"
      style={{
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
        class="m:10px mb:5rem bg:white jc:center r:10"
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          padding: "20px 30px",
          "box-shadow": "0 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        <img
          src={"../../public/graphics/register_vector.png"}
          alt="logo"
          class="w:25rem d:none@<md"
        />
        <div class="w:50% w:100%@<md grid align-content:center m:0|30@lg">
          <div class="mb:5 f:20 font-weight:bold flex jc:left z:10">
            Sign Up
          </div>
          <div class="mb:10 f:15 font-weight:medium color:rgb(152,152,153) flex jc:left z:10">
            Let's Bright up your future!
          </div>
          <div class="grid-template-columns:1fr|50% grid gap:0|10">
            {" "}
            <div class="m:10|0|0|0">
              <label
                for="subdomain"
                class="f:14"
                style={{ display: "block", "margin-bottom": "5px" }}
              >
                Sub Domain
              </label>
              <input
                name="subdomain"
                type="text"
                value={formData().subdomain}
                onInput={(e) =>
                  setFormData({ ...formData(), subdomain: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  "border-radius": "4px",
                }}
                placeholder="Enter SubDomain"
                required
              />
            </div>
            <div class="m:10|0|0|0">
              <label
                for="username"
                class="f:14"
                style={{ display: "block", "margin-bottom": "5px" }}
              >
                Username
              </label>
              <input
                name="username"
                type="text"
                value={formData().username}
                onInput={(e) =>
                  setFormData({ ...formData(), username: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  "border-radius": "4px",
                }}
                placeholder="Enter Name"
                required
              />
            </div>
            <div class="m:10|0|0|0">
              <label
                for="username"
                class="f:14"
                style={{ display: "block", "margin-bottom": "5px" }}
              >
                Email Address
              </label>
              <input
                name="email"
                type="text"
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
                placeholder="Enter Email"
                required
              />
            </div>
            <div class="m:10|0|10|0">
              <label
                for="password"
                class="f:14"
                style={{ display: "block", "margin-bottom": "5px" }}
              >
                Password
              </label>
              <div class="rel">
                <input
                  name="password"
                  type={`${showPassword() ? "text" : "password"}`}
                  value={formData().password}
                  onInput={(e) =>
                    setFormData({ ...formData(), password: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    "border-radius": "4px",
                  }}
                  placeholder="Enter Password"
                  required
                />
                <Icon
                  onClick={togglePasswordVisibility}
                  class="abs top:8 right:5 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
                  aria-label="Toggle password visibility"
                  icon={`${showPassword() ? "iconamoon:eye-light" : "iconamoon:eye-off"}`}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "8px",
              background: "rgb(226,65,74)",
              color: "white",
              border: "none",
              "border-radius": "4px",
              cursor: "pointer",
            }}
          >
            Sign Up
          </button>
          <div class="flex text-align:center jc:center mt:20 f:15">
            Already have an account?&nbsp;
            <a href={`/auth/login`} replace={true}>
              <u class="font:bold">Sign In</u>
            </a>
          </div>
        </div>
      </form>
    </div>
  );
};
