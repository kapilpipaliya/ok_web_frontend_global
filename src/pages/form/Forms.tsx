import "~/css/base.css";
import { createSignal, Match, Show, Switch, useContext } from "solid-js";
import {
  APP_BASE_URL,
  validateEmail,
  validatePassword,
  validateUsername,
} from "~/lib/Utils";
import { A, useNavigate } from "@solidjs/router";
import { useToast } from "~/components/custom/Toast";
import { Icon } from "@iconify-icon/solid";
import { LoadingContext } from "~/lib/contexts";
import logo from "~/assets/graphics/logo.png";
import sendEmail from "~/lib/server/email";
import {
  contactUsCall,
  registerUserCall,
  signInCall,
} from "~/components/api/api_functions";

export const Login = () => {
  const navigate = useNavigate();
  const { showErrorToast, showLoadingToast } = useToast();
  const [loadingSite, setLoadingSite] = useContext(LoadingContext);

  const [formData, setFormData] = createSignal({
    email: "",
    password: "",
    loginType: "login",
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
          alt="logo"
          class="w:25rem d:none@<md"
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

export const SignUp = () => {
  // const {setAlert} = useContext(AlertMessageContext);
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

export const ForgotPasswordForm = () => {
  const { showErrorToast, showLoadingToast } = useToast();
  const [username, setUsername] = createSignal("");
  const [otp, setOtp] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [showConfirmPassword, setConfirmShowPassword] = createSignal(false);
  const [showNewPassword, setNewShowPassword] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [stage, setStage] = createSignal(0); // 0: Email, 1: OTP, 2: New Passwords

  const validatePassword = (password: string) => {
    // Example validation: Minimum eight characters, at least one letter and one number
    const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{6,16}$/;
    return regex.test(password);
  };
  const handleEmailSubmit = async (event: Event) => {
    event.preventDefault();
    setIsLoading(true);
    const data = await sendEmail(username(), "Reset Password");
    setIsLoading(false);
    setStage(1);
  };

  const handleOtpSubmit = (event: Event) => {
    event.preventDefault();
    setIsLoading(true);
    console.log("OTP submitted:", otp());
    setIsLoading(false);
    setStage(2); // Move to password reset stage
  };

  const handlePasswordResetSubmit = (event: Event) => {
    event.preventDefault();
    if (newPassword() !== confirmPassword()) {
      showErrorToast("Passwords do not match.");
      return; // Stop the form submission
    }

    // Validate the new password
    if (!validatePassword(newPassword())) {
      showErrorToast(
        "Password must be at least 6 characters long and include at least one letter and one number and one uppercase.",
      );
      return; // Stop the form submission
    }
    setIsLoading(true);
    console.log("New password submitted:", newPassword(), confirmPassword());
    // Reset password
    // On success:
    setIsLoading(false);
    alert("Password has been reset successfully.");
    // Optionally redirect to login or inform the user
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
      <Switch>
        <Match when={isLoading()}>
          <div class="p:5rem bg:white r:10">
            <div class="loader" />
          </div>
        </Match>
        <Match when={true}>
          <Show when={stage() === 0}>
            <form
              class="@fade|.5s mb:5rem bg:white r:10 w:70vw@<xs w:50vw<@md w:40vw@lg w:28vw@>xl"
              onSubmit={handleEmailSubmit}
              style={{
                display: "grid",
                "max-width": "600px",
                padding: "20px 30px",
                "box-shadow": "0 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div class="mb:5 f:20 font-weight:bold flex jc:left z:10">
                Forgot Password
              </div>
              <div class="mb:10 f:15 font-weight:medium color:rgb(152,152,153) flex jc:left z:10">
                Provide the email address associated with your account. We will
                send you a link to reset your password.
              </div>
              <div style={{ margin: "10px 0" }}>
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
                  value={username()}
                  onInput={(e) => setUsername(e.target.value)}
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
                Confirm
              </button>
              <div class="flex justify-content:center mt:20 f:15">
                <span>
                  Return to&nbsp;
                  <A href={`/auth/login`}>
                    <u class="font:bolder text-fill:black">Log In</u>
                  </A>
                </span>
              </div>
            </form>
          </Show>
          <Show when={stage() === 1}>
            <form
              class="@fade|.5s mb:5rem bg:white r:10 w:70vw@<xs w:50vw@<md w:40vw@lg w:28vw@>xl"
              onSubmit={handleOtpSubmit}
              style={{
                display: "grid",
                "max-width": "600px",
                padding: "20px 30px",
                "box-shadow": "0 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div class="mb:5 f:20 font-weight:bold flex jc:left z:10">
                OTP Verification
              </div>
              <div class="mb:10 f:15 font-weight:medium color:rgb(152,152,153) flex jc:left z:10">
                We have sent an OTP to your email. Please enter it below to
                proceed.
              </div>
              <div style={{ margin: "10px 0" }}>
                <label
                  for="username"
                  class="f:14"
                  style={{ display: "block", "margin-bottom": "5px" }}
                >
                  One Time Password (OTP)
                </label>
                <input
                  maxlength={6}
                  value={otp()}
                  onInput={(e) => setOtp(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    "border-radius": "4px",
                  }}
                  placeholder="Enter 6 digit code"
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
                Submit
              </button>
              <div class="flex justify-content:center mt:20 f:15">
                <span>
                  Return to&nbsp;
                  <A href={`/auth/login`}>
                    <u class="font:bolder text-fill:black">Log In</u>
                  </A>
                </span>
              </div>
            </form>
          </Show>
          <Show when={stage() === 2}>
            <form
              class="@fade|.5s mb:5rem bg:white r:10 w:70vw@<xs w:50vw<@md w:40vw@lg w:28vw@>xl"
              onSubmit={handlePasswordResetSubmit}
              style={{
                display: "grid",
                "max-width": "600px",
                padding: "20px 30px",
                "box-shadow": "0 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div class="mb:5 f:20 font-weight:bold flex jc:left z:10">
                Reset Password
              </div>
              <div class="mb:10 f:15 font-weight:medium color:rgb(152,152,153) flex jc:left z:10">
                Below you can enter your new password.
              </div>
              <div class="rel" style={{ margin: "10px 0" }}>
                <label
                  for="username"
                  class="f:14"
                  style={{ display: "block", "margin-bottom": "5px" }}
                >
                  New Password
                </label>
                <input
                  type={`${showNewPassword() ? "text" : "password"}`}
                  value={newPassword()}
                  onInput={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    "border-radius": "4px",
                  }}
                  placeholder="New Password"
                  required
                />
                <Icon
                  onClick={() => setNewShowPassword(!showNewPassword())}
                  class="abs top:32 right:5 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
                  aria-label="Toggle password visibility"
                  icon={`${showNewPassword() ? "iconamoon:eye-light" : "iconamoon:eye-off"}`}
                />
              </div>
              <div class="rel" style={{ margin: "10px 0" }}>
                <label
                  for="username"
                  class="f:14"
                  style={{ display: "block", "margin-bottom": "5px" }}
                >
                  Confirm Password
                </label>
                <input
                  type={`${showConfirmPassword() ? "text" : "password"}`}
                  value={confirmPassword()}
                  onInput={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ccc",
                    "border-radius": "4px",
                  }}
                  placeholder="Confirm Password"
                  required
                />
                <Icon
                  onClick={() => setConfirmShowPassword(!showConfirmPassword())}
                  class="abs top:32 right:5 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
                  aria-label="Toggle password visibility"
                  icon={`${showConfirmPassword() ? "iconamoon:eye-light" : "iconamoon:eye-off"}`}
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
                Confirm
              </button>
              <div class="flex mt:20 f:15" style={{ "text-align": "center" }}>
                Return to&nbsp;
                <A href={`/auth/login`}>
                  <u class="font:bolder text-fill:black">Log In</u>
                </A>
              </div>
            </form>
          </Show>
        </Match>
      </Switch>
    </div>
  );
};

export const ContactUs = () => {
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
          navigate(`/`);
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
};
