import { Icon } from "@iconify-icon/solid";
import { A, useNavigate } from "@solidjs/router";
import { Show, createSignal, onMount } from "solid-js";

import logo from "~/assets/graphics/logo.png";
import { useToast } from "~/components/Toast";
import { signInCall } from "~/lib/api/api_functions";
import {postAPI} from "~/lib/api/postApi";
import { APP_BASE_URL } from "~/lib/constants";
import { useLoading } from "~/lib/contexts";
import { validateEmail, validatePassword, validateUsername } from "~/lib/validations";

export function Login() {
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();
  const [loadingSite, setLoadingSite] = useLoading();
  const [formData, setFormData] = createSignal({
    email: "",
    loginType: "login",
    password: "",
    profileImage: "",
    username: "",
  });

  const getAll = async () => {
    const data = await postAPI("/api/get_subdomain_Info", {});
    setFormData({
      ...formData(),
      profileImage: data.profileImage,
      username: data.username,
    });
  };

  onMount(() => {
    getAll();
  });

  const [showPassword, setShowPassword] = createSignal(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword());
  };

  const handleSubmit = async (event: MouseEvent) => {
    event.preventDefault();
    if (formData().email.includes("@")) {
      const emailError = validateEmail(formData().email);
      if (emailError) {
          showErrorToast("Please enter a valid email address or username");
          return;
      }
    } else {
      const usernameError = validateUsername(formData().email);
      if (usernameError) {
        showErrorToast("Please enter a valid email address or username"); 
        return;
      }
    }
    
    const passwordError = validatePassword(formData().password);
    if (passwordError) {
      showErrorToast(passwordError);
    } else {
      setLoadingSite(true);
      await showLoadingToast({
        loadMessage: "Logging In...",
        onError(error) {
          setLoadingSite(false);
        },
        onSuccess: (value) => {
          setLoadingSite(false);

          if (value != null && value.id !== null) {
            navigate(`${APP_BASE_URL}/Page`);
          }
        },
        promise: signInCall(formData),
        successMessage: "Logged In Successfully",
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
        "grid-row-gap": "50px",
        height: "100vh",
        "justify-content": "center",
      }}
    >
      <Show
        fallback={
          <img
            alt="logo"
            class="@fade|.5s"
            src={logo}
            style={{ height: "70px", "justify-self": "center" }}
          />
        }
        when={formData().profileImage}
      >
        <div class="text-align:-webkit-center">
          <img
            alt="logo"
            class="@fade|.5s bg:white p:2 r:10"
            src={formData().profileImage}
            style={{ height: "130px", "justify-self": "center" }}
          />
          <div class="m:10">
            <span>Welcome Back,</span>
            <span class="color:rgb(226,65,75) font-weight:bold font:19">
              {formData().username}
            </span>
          </div>
        </div>
      </Show>
      <form
        class="bg:white jc:center m:10px mb:5rem r:10 w:inherit"
        style={{
          "box-shadow": "0 4px 8px rgba(0,0,0,0.1)",
          display: "flex",
          padding: "20px 30px",
        }}
      >
        <img
          alt="logo"
          class="d:none@<md"
          src={"../../public/graphics/login_vector.jpg"}
          style={{ width: "25rem" }}
        />
        <div class="grid align-content:center m:0|30@lg mt:25 w:100%@<md">
          <div class="flex f:20 font-weight:bold jc:left mb:5">Log In</div>
          <div class="flex color:rgb(152,152,153) f:15 font-weight:medium jc:left mb:10">
            You Will be Redirected to Home Page
          </div>
          <label
            class="f:14"
            for="username"
            style={{ display: "block", "margin-bottom": "5px" }}
          >
            Email Address or Username
          </label>
          <input
            autocomplete="email"
            name="email"
            onInput={(e) =>
              setFormData({ ...formData(), email: e.target.value })
            }
            placeholder="Your email or username"
            required
            style={{
              border: "1px solid #ccc",
              "border-radius": "4px",
              padding: "8px",
              width: "100%",
            }}
            type="text"
            value={formData().email}
          />
          <label
            class="f:14 mt:5"
            for="password"
            style={{ display: "block", "margin-bottom": "5px" }}
          >
            Password
          </label>
          <div class="rel">
            <input
              autocomplete="password"
              name="password"
              onInput={(e) =>
                setFormData({ ...formData(), password: e.target.value })
              }
              placeholder="Your Password"
              required
              style={{
                border: "1px solid #ccc",
                "border-radius": "4px",
                padding: "8px",
                width: "100%",
              }}
              type={`${showPassword() ? "text" : "password"}`}
              value={formData().password}
            />
            <Icon
              aria-label="Toggle password visibility"
              class="abs flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50% right:5 top:8"
              icon={`${
                showPassword() ? "iconamoon:eye-light" : "iconamoon:eye-off"
              }`}
              onClick={togglePasswordVisibility}
            />
          </div>
          <div
            style={{
              "align-items": "center",
              display: "flex",
              "justify-content": "space-between",
              margin: "10px 0",
            }}
          >
            <label class="f:14">
              <input type="checkbox" />
              &nbsp;Remember me
            </label>
            <a
              class="f:14"
              href="/auth/forgotPassword"
              style={{ color: "#069", "text-decoration": "none" }}
            >
              Forgot Password?
            </a>
          </div>
          <button
            onClick={handleSubmit}
            style={{
              background: "rgb(226,65,74)",
              border: "none",
              "border-radius": "4px",
              color: "white",
              cursor: "pointer",
              padding: "10px",
              width: "100%",
            }}
            type="button"
          >
            Log In
          </button>
          <div class="flex f:15 justify-content:center mt:20">
            <span>
              Don't have an account?{" "}
              <A href={"/auth/signup"}>
                <u class="text-fill:black font:bolder">Sign Up</u>
              </A>
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
