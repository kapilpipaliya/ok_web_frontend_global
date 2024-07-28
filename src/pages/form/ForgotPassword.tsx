import { Icon } from "@iconify-icon/solid";
import { A } from "@solidjs/router";
import { Match, Show, Switch, createSignal } from "solid-js";

import logo from "~/assets/graphics/logo.png";
import { useToast } from "~/components/Toast";
import { validatePassword } from "~/lib/validation/validatePassword";
import { sendEmail } from "~/server/sendEmail";

export function ForgotPassword() {
  const { showErrorToast, showLoadingToast } = useToast();
  const [username, setUsername] = createSignal("");
  const [otp, setOtp] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [showConfirmPassword, setConfirmShowPassword] = createSignal(false);
  const [showNewPassword, setNewShowPassword] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [stage, setStage] = createSignal(0); // 0: Email, 1: OTP, 2: New Passwords

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
    showErrorToast("Password has been reset successfully.");
    // Optionally redirect to login or inform the user
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
      <Switch>
        <Match when={isLoading()}>
          <div class="bg:white p:5rem r:10">
            <div >Loading</div>
          </div>
        </Match>
        <Match when={true}>
          <Show when={stage() === 0}>
            <form
              class="@fade|.5s bg:white mb:5rem r:10 w:70vw@<xs w:50vw<@md w:40vw@lg w:28vw@>xl"
              onSubmit={handleEmailSubmit}
              style={{
                "box-shadow": "0 4px 8px rgba(0,0,0,0.1)",
                display: "grid",
                "max-width": "600px",
                padding: "20px 30px",
              }}
            >
              <div class="flex f:20 font-weight:bold jc:left mb:5">
                Forgot Password
              </div>
              <div class="flex color:rgb(152,152,153) f:15 font-weight:medium jc:left mb:10">
                Provide the email address associated with your account. We will
                send you a link to reset your password.
              </div>
              <div style={{ margin: "10px 0" }}>
                <label
                  class="f:14"
                  for="username"
                  style={{ display: "block", "margin-bottom": "5px" }}
                >
                  Email Address
                </label>
                <input
                  name="email"
                  onInput={(e) => setUsername(e.target.value)}
                  placeholder="Your email"
                  required
                  style={{
                    border: "1px solid #ccc",
                    "border-radius": "4px",
                    padding: "8px",
                    width: "100%",
                  }}
                  type="text"
                  value={username()}
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
                Confirm
              </button>
              <div class="flex f:15 justify-content:center mt:20">
                <span>
                  Return to&nbsp;
                  <A href={"/auth/login"}>
                    <u class="text-fill:black font:bolder">Log In</u>
                  </A>
                </span>
              </div>
            </form>
          </Show>
          <Show when={stage() === 1}>
            <form
              class="@fade|.5s bg:white mb:5rem r:10 w:50vw@<md w:70vw@<xs w:40vw@lg w:28vw@>xl"
              onSubmit={handleOtpSubmit}
              style={{
                "box-shadow": "0 4px 8px rgba(0,0,0,0.1)",
                display: "grid",
                "max-width": "600px",
                padding: "20px 30px",
              }}
            >
              <div class="flex f:20 font-weight:bold jc:left mb:5">
                OTP Verification
              </div>
              <div class="flex color:rgb(152,152,153) f:15 font-weight:medium jc:left mb:10">
                We have sent an OTP to your email. Please enter it below to
                proceed.
              </div>
              <div style={{ margin: "10px 0" }}>
                <label
                  class="f:14"
                  for="username"
                  style={{ display: "block", "margin-bottom": "5px" }}
                >
                  One Time Password (OTP)
                </label>
                <input
                  maxlength={6}
                  onInput={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6 digit code"
                  required
                  style={{
                    border: "1px solid #ccc",
                    "border-radius": "4px",
                    padding: "8px",
                    width: "100%",
                  }}
                  value={otp()}
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
                Submit
              </button>
              <div class="flex f:15 justify-content:center mt:20">
                <span>
                  Return to&nbsp;
                  <A href={"/auth/login"}>
                    <u class="text-fill:black font:bolder">Log In</u>
                  </A>
                </span>
              </div>
            </form>
          </Show>
          <Show when={stage() === 2}>
            <form
              class="@fade|.5s bg:white mb:5rem r:10 w:70vw@<xs w:50vw<@md w:40vw@lg w:28vw@>xl"
              onSubmit={handlePasswordResetSubmit}
              style={{
                "box-shadow": "0 4px 8px rgba(0,0,0,0.1)",
                display: "grid",
                "max-width": "600px",
                padding: "20px 30px",
              }}
            >
              <div class="flex f:20 font-weight:bold jc:left mb:5">
                Reset Password
              </div>
              <div class="flex color:rgb(152,152,153) f:15 font-weight:medium jc:left mb:10">
                Below you can enter your new password.
              </div>
              <div class="rel" style={{ margin: "10px 0" }}>
                <label
                  class="f:14"
                  for="username"
                  style={{ display: "block", "margin-bottom": "5px" }}
                >
                  New Password
                </label>
                <input
                  onInput={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  required
                  style={{
                    border: "1px solid #ccc",
                    "border-radius": "4px",
                    padding: "8px",
                    width: "100%",
                  }}
                  type={`${showNewPassword() ? "text" : "password"}`}
                  value={newPassword()}
                />
                <Icon
                  aria-label="Toggle password visibility"
                  class="abs flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50% right:5 top:32"
                  icon={`${
                    showNewPassword()
                      ? "iconamoon:eye-light"
                      : "iconamoon:eye-off"
                  }`}
                  onClick={() => setNewShowPassword(!showNewPassword())}
                />
              </div>
              <div class="rel" style={{ margin: "10px 0" }}>
                <label
                  class="f:14"
                  for="username"
                  style={{ display: "block", "margin-bottom": "5px" }}
                >
                  Confirm Password
                </label>
                <input
                  onInput={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                  style={{
                    border: "1px solid #ccc",
                    "border-radius": "4px",
                    padding: "8px",
                    width: "100%",
                  }}
                  type={`${showConfirmPassword() ? "text" : "password"}`}
                  value={confirmPassword()}
                />
                <Icon
                  aria-label="Toggle password visibility"
                  class="abs flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50% right:5 top:32"
                  icon={`${
                    showConfirmPassword()
                      ? "iconamoon:eye-light"
                      : "iconamoon:eye-off"
                  }`}
                  onClick={() => setConfirmShowPassword(!showConfirmPassword())}
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
                Confirm
              </button>
              <div class="flex f:15 mt:20" style={{ "text-align": "center" }}>
                Return to&nbsp;
                <A href={"/auth/login"}>
                  <u class="text-fill:black font:bolder">Log In</u>
                </A>
              </div>
            </form>
          </Show>
        </Match>
      </Switch>
    </div>
  );
}
