import { Icon } from "@iconify-icon/solid";
import { createStore } from "solid-js/store";

import { useToast } from "~/components/Toast";
import { resetPasswordCall } from "~/lib/api/service/user/resetPasswordCall";
import { useGraph } from "~/lib/graph/graph";
import { validatePassword } from "~/lib/validation/validatePassword";

export const PasswordSection = (props: Readonly<{ profileData: any }>) => {
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showLoadingToast, showSuccessToast } = useToast();

  const [passwordData, setPasswordData] = createStore<{ [key: string]: any }>({
    confirmPassword: "",
    currentPassword: "",
    currentUser: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = createStore({
    confirmPassword: false,
    currentPassword: false,
    newPassword: false,
  });
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };
  const togglePasswordVisibility = (name: any) => {
    setShowPassword((prev: any) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const onClickSave = async () => {
    const { confirmPassword, currentPassword, newPassword } = passwordData;
    if (!currentPassword.trim()) {
      showErrorToast("Please enter current password");
      return false;
    }
    if (!newPassword.trim()) {
      showErrorToast("Please enter new password");
      return false;
    }
    if (!confirmPassword.trim()) {
      showErrorToast("Please enter confirm password");
      return false;
    }

    const currentPasswordError = validatePassword(currentPassword);
    if (currentPasswordError) {
      showErrorToast(`Current ${currentPasswordError}`);
      return false;
    }
    const newPasswordError = validatePassword(newPassword);
    if (newPasswordError) {
      showErrorToast(`New ${newPasswordError}`);
      return false;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      showErrorToast("New and confirm passwords doesn't match");
      return false;
    }
    if (currentPassword.trim() === newPassword.trim()) {
      showErrorToast("New password can't be the same as current password");
      return false;
    }
    await showLoadingToast({
      loadMessage: "Updating Password...",
      onSuccess: (value) => {
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
        <div class={"font-weight:700"}>Password</div>
        <div class={"font-weight:400 mb:30"}>
          Update your account password here
        </div>
        <div
          class={
            "flex@md rel ai:center bt:1px|solid|lightgrey jc:space-between p:20"
          }
        >
          <span class={"font-weight:600"}>Current User</span>

          <input
            name={"username"}
            placeholder={"username"}
            readOnly
            type={"text"}
            value={props.profileData.username}
          />
        </div>
        <div
          class={
            "flex@md rel ai:center bt:1px|solid|lightgrey jc:space-between mb:5 p:20"
          }
        >
          <span class={"font-weight:600"}>Current Password</span>

          <input
            name={"currentPassword"}
            onChange={handleInputChange}
            placeholder={"Enter Current Password"}
            type={`${showPassword.currentPassword ? "text" : "password"}`}
            value={passwordData.currentPassword}
          />
          <Icon
            aria-label="Toggle password visibility"
            class="abs flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50% right:20 top:50px top:25px@md"
            icon={`${
              showPassword.currentPassword
                ? "iconamoon:eye-light"
                : "iconamoon:eye-off"
            }`}
            onClick={() => togglePasswordVisibility("currentPassword")}
          />
        </div>
        <div class={"flex@md rel ai:center jc:space-between mb:5 p:5|20|20|20"}>
          <span class={"font-weight:600"}>New Password</span>
          <input
            name={"newPassword"}
            onChange={handleInputChange}
            placeholder={"Enter New Password"}
            type={`${showPassword.newPassword ? "text" : "password"}`}
            value={passwordData.newPassword}
          />
          <Icon
            aria-label="Toggle password visibility"
            class="abs flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50% right:20 top:33px top:10px@md"
            icon={`${
              showPassword.newPassword
                ? "iconamoon:eye-light"
                : "iconamoon:eye-off"
            }`}
            onClick={() => togglePasswordVisibility("newPassword")}
          />
        </div>
        <div
          class={
            "flex@md rel ai:center bb:1px|solid|lightgrey jc:space-between mb:10 p:5|20|20|20"
          }
        >
          <span class={"font-weight:600"}>Confirm Password</span>
          <input
            name={"confirmPassword"}
            onChange={handleInputChange}
            placeholder={"Enter Confirm Password"}
            type={`${showPassword.confirmPassword ? "text" : "password"}`}
            value={passwordData.confirmPassword}
          />
          <Icon
            aria-label="Toggle password visibility"
            class="abs flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50% right:20 top:33px top:10px@md"
            icon={`${
              showPassword.confirmPassword
                ? "iconamoon:eye-light"
                : "iconamoon:eye-off"
            }`}
            onClick={() => togglePasswordVisibility("confirmPassword")}
          />
        </div>
      </div>
      <div class={"flex jc:end"}>
        <button
          class={
            "bg:#5b7dff border:none color:white cursor:pointer m:15|10 p:5|10 r:4"
          }
          onClick={onClickSave}
        >
          Update Password
        </button>
      </div>
    </div>
  );
};
