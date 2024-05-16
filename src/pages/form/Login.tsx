import { createSignal, onMount, Show, useContext } from "solid-js";
import { APP_BASE_URL, validateEmail, validatePassword } from "~/lib/Utils";
import { A, useNavigate } from "@solidjs/router";
import { useToast } from "~/components/custom/Toast";
import { Icon } from "@iconify-icon/solid";
import { LoadingContext } from "~/lib/contexts";
import logo from "~/assets/graphics/logo.png";
import { signInCall } from "~/components/api/api_functions";
import "~/css/base.css";
import postAPI from "~/components/api/postApi";

export const Login = () => {
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();
  const [loadingSite, setLoadingSite] = useContext(LoadingContext);
  const [formData, setFormData] = createSignal({
    email: "",
    password: "",
    profileImage: "",
    username: "",
    loginType: "login",
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

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const emailError = validateEmail(formData().email);
    const passwordError = validatePassword(formData().password);
    if (emailError) {
      showErrorToast(emailError); // Show the error message if validation fails
    } else if (passwordError) {
      showErrorToast(passwordError); // Show the error message if validation fails
    } else {
      setLoadingSite(true);
      await showLoadingToast({
        promise: signInCall(formData),
        loadMessage: "Logging In...",
        successMessage: "Logged In Successfully",
        onSuccess: (value) => {
          setLoadingSite(false);

          if (value != null && value.id !== null) {
            navigate(`${APP_BASE_URL}/Page`);
          }
        },
        onError(error) {
          setLoadingSite(false);
        },
      });
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
        "grid-row-gap": "50px",
        height: "100vh",
      }}
    >
      <Show
        when={formData().profileImage}
        fallback={
          <img
            src={logo}
            alt="logo"
            class="@fade|.5s"
            style={{ "justify-self": "center", height: "70px" }}
          />
        }
      >
        <div class="text-align:-webkit-center">
          <img
            src={formData().profileImage}
            alt="logo"
            class="r:10 @fade|.5s bg:white p:2"
            style={{ "justify-self": "center", height: "130px" }}
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
        class="m:10px w:inherit mb:5rem bg:white jc:center r:10"
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          padding: "20px 30px",
          "box-shadow": "0 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        <img
          src={"../../public/graphics/login_vector.jpg"}
          style={{ width: "25rem" }}
          alt="logo"
          class="d:none@<md"
        />
        <div class="mt:25 w:100%@<md grid align-content:center m:0|30@lg">
          <div class="mb:5 f:20 font-weight:bold flex jc:left z:10">Log In</div>
          <div class="mb:10 f:15 font-weight:medium color:rgb(152,152,153) flex jc:left z:10">
            You Will be Redirected to Home Page
          </div>
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
            autocomplete="email"
            placeholder="Your email"
            required
          />
          <label
            for="password"
            class="f:14 mt:5"
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
              autocomplete="password"
              placeholder="Your Password"
              required
            />
            <Icon
              onClick={togglePasswordVisibility}
              class="abs top:8 right:5 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
              aria-label="Toggle password visibility"
              icon={`${showPassword() ? "iconamoon:eye-light" : "iconamoon:eye-off"}`}
            />
          </div>
          <div
            style={{
              display: "flex",
              "align-items": "center",
              "justify-content": "space-between",
              margin: "10px 0",
            }}
          >
            <label class="f:14">
              <input type="checkbox" />
              &nbsp;Remember me
            </label>
            <a
              href="/auth/forgotPassword"
              class="f:14"
              style={{ color: "#069", "text-decoration": "none" }}
            >
              Forgot Password?
            </a>
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
            Log In
          </button>
          <div class="flex justify-content:center mt:20 f:15">
            <span>
              Don't have an account?{" "}
              <A href={`/auth/signup`}>
                <u class="font:bolder text-fill:black">Sign Up</u>
              </A>
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};
