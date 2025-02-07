import { Icon } from "@iconify-icon/solid";
import { createSignal, type JSX, Match, Show, Switch } from "solid-js";

import logo from "~/assets/graphics/logo.png";
import { useToast } from "~/components/styled/Toast";
import { validatePassword } from "~/lib/validation/validatePassword";
import { sendEmail } from "~/server/sendEmail";

// Reusable Form Component
interface FormProps {
  children: JSX.Element;
  description: string;
  onSubmit: (event: Event) => void;
  title: string;
}

// Reusable Input Field Component
interface InputFieldProps {
  label: string;
  maxLength?: number;
  onInput: (value: string) => void;
  onToggle?: () => void;
  placeholder: string;
  showToggle?: boolean;
  toggleValue?: boolean;
  type: string;
  value: string;
}

export function ForgotPassword(): JSX.Element {
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
    await sendEmail(username(), "Reset Password");
    setIsLoading(false);
    setStage(1);
  };

  const handleOtpSubmit = (event: Event) => {
    event.preventDefault();
    setIsLoading(true);
    setIsLoading(false);
    setStage(2); // Move to password reset stage
  };

  const handlePasswordResetSubmit = (event: Event) => {
    event.preventDefault();
    if (newPassword() !== confirmPassword()) {
      showErrorToast("Passwords do not match.");
      return; // Stop the form submission
    }

    if (!validatePassword(newPassword())) {
      showErrorToast(
        "Password must be at least 6 characters long and include at least one letter, one number, and one uppercase letter.",
      );
      return;
    }

    setIsLoading(true);
    // Reset password logic here
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
            <div>Loading</div>
          </div>
        </Match>
        <Match when={!isLoading()}>
          <Show when={stage() === 0}>
            <Form
              description="Provide the email address associated with your account. We will send you a link to reset your password."
              onSubmit={handleEmailSubmit}
              title="Forgot Password"
            >
              <>
                <InputField
                  label="Email Address"
                  onInput={setUsername}
                  placeholder="Your email"
                  type="text"
                  value={username()}
                />
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
                    <a href={"/auth/login"}>
                      <u class="text-fill:black font:bolder">Log In</u>
                    </a>
                  </span>
                </div>
              </>
            </Form>
          </Show>

          <Show when={stage() === 1}>
            <Form
              description="We have sent an OTP to your email. Please enter it below to proceed."
              onSubmit={handleOtpSubmit}
              title="OTP Verification"
            >
              <>
                <InputField
                  label="One Time Password (OTP)"
                  maxLength={6}
                  onInput={setOtp}
                  placeholder="Enter 6 digit code"
                  type="text"
                  value={otp()}
                />
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
                    <a href={"/auth/login"}>
                      <u class="text-fill:black font:bolder">Log In</u>
                    </a>
                  </span>
                </div>
              </>
            </Form>
          </Show>

          <Show when={stage() === 2}>
            <Form
              description="Below you can enter your new password."
              onSubmit={handlePasswordResetSubmit}
              title="Reset Password"
            >
              <>
                <InputField
                  label="New Password"
                  onInput={setNewPassword}
                  onToggle={() => setNewShowPassword(!showNewPassword())}
                  placeholder="New Password"
                  showToggle={true}
                  toggleValue={showNewPassword()}
                  type={showNewPassword() ? "text" : "password"}
                  value={newPassword()}
                />
                <InputField
                  label="Confirm Password"
                  onInput={setConfirmPassword}
                  onToggle={() =>
                    setConfirmShowPassword(!showConfirmPassword())
                  }
                  placeholder="Confirm Password"
                  showToggle={true}
                  toggleValue={showConfirmPassword()}
                  type={showConfirmPassword() ? "text" : "password"}
                  value={confirmPassword()}
                />
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
                  <a href={"/auth/login"}>
                    <u class="text-fill:black font:bolder">Log In</u>
                  </a>
                </div>
              </>
            </Form>
          </Show>
        </Match>
      </Switch>
    </div>
  );
}

function Form(props: Readonly<FormProps>): JSX.Element {
  return (
    <form
      class="@fade|.5s bg:white mb:5rem r:10 w:70vw@<xs w:50vw<@md w:40vw@lg w:28vw@>xl"
      onSubmit={props.onSubmit}
      style={{
        "box-shadow": "0 4px 8px rgba(0,0,0,0.1)",
        display: "grid",
        "max-width": "600px",
        padding: "20px 30px",
      }}
    >
      <div class="flex f:20 font-weight:bold jc:left mb:5">{props.title}</div>
      <div class="flex color:rgb(152,152,153) f:15 font-weight:medium jc:left mb:10">
        {props.description}
      </div>
      {props.children}
    </form>
  );
}

function InputField(props: Readonly<InputFieldProps>): JSX.Element {
  return (
    <div class="rel" style={{ margin: "10px 0" }}>
      <label class="f:14" style={{ display: "block", "margin-bottom": "5px" }}>
        {props.label}
      </label>
      <input
        maxLength={props.maxLength}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        placeholder={props.placeholder}
        required
        style={{
          border: "1px solid #ccc",
          "border-radius": "4px",
          padding: "8px",
          width: "100%",
        }}
        type={props.type}
        value={props.value}
      />
      {props.showToggle && props.onToggle && (
        <Icon
          aria-label="Toggle password visibility"
          class="abs flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50% right:5 top:32"
          icon={props.toggleValue ? "iconamoon:eye-light" : "iconamoon:eye-off"}
          noobserver
          onClick={props.onToggle}
        />
      )}
    </div>
  );
}
