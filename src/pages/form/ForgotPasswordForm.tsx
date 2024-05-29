import { createSignal, Match, Show, Switch } from "solid-js";
import { A } from "@solidjs/router";
import { useToast } from "~/components/custom/Toast";
import { Icon } from "@iconify-icon/solid";
import logo from "~/assets/graphics/logo.png";
import sendEmail from "~/cypher_api/server/email";
import { validatePassword } from "~/lib/validations";

export function ForgotPasswordForm() {
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
}
