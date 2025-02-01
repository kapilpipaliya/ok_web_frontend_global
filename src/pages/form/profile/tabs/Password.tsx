import { Icon } from "@iconify-icon/solid";
import { type JSX, Show } from "solid-js";
import { createStore } from "solid-js/store";

import { useToast } from "~/components/styled/Toast";
import { resetPasswordCall } from "~/lib/api/service/user/resetPasswordCall";
import { useGraph } from "~/lib/graph/graph";
import { validatePassword } from "~/lib/validation/validatePassword";

interface PasswordSectionProps {
  profileData: {
    username: string;
  };
}

export const PasswordSection = (
  props: Readonly<PasswordSectionProps>,
): JSX.Element => {
  const [_graph, _setGraph] = useGraph();
  const { showErrorToast, showLoadingToast, showSuccessToast } = useToast();

  const [passwordData, setPasswordData] = createStore({
    confirmPassword: "",
    currentPassword: "",
    newPassword: "",
  });

  const [showPassword, setShowPassword] = createStore({
    confirmPassword: false,
    currentPassword: false,
    newPassword: false,
  });

  const handleInputChange = (
    e: { currentTarget: HTMLInputElement } & Event,
  ) => {
    const { name, value } = e.currentTarget;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const togglePasswordVisibility = (name: keyof typeof showPassword) => {
    setShowPassword((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const onClickSave = async () => {
    const { confirmPassword, currentPassword, newPassword } = passwordData;

    if (!currentPassword.trim()) {
      showErrorToast("Please enter current password");
      return;
    }
    if (!newPassword.trim()) {
      showErrorToast("Please enter new password");
      return;
    }
    if (!confirmPassword.trim()) {
      showErrorToast("Please enter confirm password");
      return;
    }

    const currentPasswordError = validatePassword(currentPassword);
    if (currentPasswordError) {
      showErrorToast(`Current ${currentPasswordError}`);
      return;
    }
    const newPasswordError = validatePassword(newPassword);
    if (newPasswordError) {
      showErrorToast(`New ${newPasswordError}`);
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      showErrorToast("New and confirm passwords don't match");
      return;
    }
    if (currentPassword.trim() === newPassword.trim()) {
      showErrorToast("New password can't be the same as current password");
      return;
    }

    await showLoadingToast({
      loadMessage: "Updating Password...",
      onSuccess: () => {
        setPasswordData({
          confirmPassword: "",
          currentPassword: "",
          newPassword: "",
        });
        setShowPassword({
          confirmPassword: false,
          currentPassword: false,
          newPassword: false,
        });
      },
      promise: resetPasswordCall(passwordData, props.profileData),
      successMessage: "Password reset successfully",
    });
  };

  return (
    <div class="bg:#f5f7fa box-shadow:0|0|12|.1|rgb(237,239,241) m:20 p:10px|15px r:8 w:80%">
      <div>
        <div class="font-weight:700">Password</div>
        <div class="font-weight:400 mb:30">
          Update your account password here
        </div>

        <PasswordField
          label="Current User"
          name="username"
          readOnly
          value={props.profileData.username}
        />

        <PasswordField
          label="Current Password"
          name="currentPassword"
          onChange={handleInputChange}
          showPassword={showPassword.currentPassword}
          togglePasswordVisibility={() =>
            togglePasswordVisibility("currentPassword")
          }
          value={passwordData.currentPassword}
        />

        <PasswordField
          label="New Password"
          name="newPassword"
          onChange={handleInputChange}
          showPassword={showPassword.newPassword}
          togglePasswordVisibility={() =>
            togglePasswordVisibility("newPassword")
          }
          value={passwordData.newPassword}
        />

        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          onChange={handleInputChange}
          showPassword={showPassword.confirmPassword}
          togglePasswordVisibility={() =>
            togglePasswordVisibility("confirmPassword")
          }
          value={passwordData.confirmPassword}
        />
      </div>

      <div class="flex jc:end">
        <button
          class="bg:#5b7dff border:none color:white cursor:pointer m:15|10 p:5|10 r:4"
          onClick={onClickSave}
        >
          Update Password
        </button>
      </div>
    </div>
  );
};

interface PasswordFieldProps {
  label: string;
  name: string;
  onChange?: (e: { currentTarget: HTMLInputElement } & Event) => void;
  readOnly?: boolean;
  showPassword?: boolean;
  togglePasswordVisibility?: () => void;
  value: string;
}

const PasswordField = (props: PasswordFieldProps): JSX.Element => {
  return (
    <div class="flex@md rel ai:center bt:1px|solid|lightgrey jc:space-between mb:5 p:20">
      <span class="font-weight:600">{props.label}</span>
      <input
        name={props.name}
        onChange={props.onChange}
        placeholder={`Enter ${props.label}`}
        readOnly={props.readOnly}
        type={props.showPassword ? "text" : "password"}
        value={props.value}
      />
      <Show when={!props.readOnly}>
        <Icon
          aria-label="Toggle password visibility"
          class="abs flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50% right:20 top:33px top:10px@md"
          icon={
            props.showPassword ? "iconamoon:eye-light" : "iconamoon:eye-off"
          }
          onClick={props.togglePasswordVisibility}
          noobserver
        />
      </Show>
    </div>
  );
};
