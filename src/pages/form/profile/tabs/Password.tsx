import { Icon } from "@iconify-icon/solid";
import { useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { resetPasswordCall } from "~/lib/api/api_functions";
import { useToast } from "~/components/Toast";
import { GraphContext } from "~/lib/graph/graph";
import { validatePassword } from "~/lib/validations";

export const PasswordSection = (props: Readonly<{ profileData: any }>) => {
  const [graph, setGraph] = useContext(GraphContext)!;
  const { showErrorToast, showSuccessToast, showLoadingToast } = useToast();

  const [passwordData, setPasswordData] = createStore<{ [key: string]: any }>({
    currentUser: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = createStore({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
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
    const { currentPassword, newPassword, confirmPassword } = passwordData;
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
      promise: resetPasswordCall(passwordData, props.profileData),
      loadMessage: "Updating Password...",
      successMessage: "Password reset successfully",
      onSuccess: (value) => {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPassword({
          currentPassword: false,
          newPassword: false,
          confirmPassword: false,
        });
      },
    });
  };

  return (
    <div class="bg:#f5f7fa p:10px|15px w:80% m:20 r:8 box-shadow:0|0|12|.1|rgb(237,239,241)">
      <div>
        <div class={"font-weight:700"}>Password</div>
        <div class={"font-weight:400 mb:30"}>
          Update your account password here
        </div>
        <div
          class={
            "flex@md rel ai:center jc:space-between p:20 bt:1px|solid|lightgrey"
          }
        >
          <span class={"font-weight:600"}>Current User</span>

          <input
            name={"username"}
            readOnly
            placeholder={"username"}
            type={"text"}
            value={props.profileData.username}
          />
        </div>
        <div
          class={
            "flex@md rel ai:center jc:space-between p:20 mb:5 bt:1px|solid|lightgrey"
          }
        >
          <span class={"font-weight:600"}>Current Password</span>

          <input
            name={"currentPassword"}
            type={`${showPassword.currentPassword ? "text" : "password"}`}
            placeholder={"Enter Current Password"}
            value={passwordData.currentPassword}
            onChange={handleInputChange}
          />
          <Icon
            onClick={() => togglePasswordVisibility("currentPassword")}
            class="abs top:50px top:25px@md right:20 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
            aria-label="Toggle password visibility"
            icon={`${
              showPassword.currentPassword
                ? "iconamoon:eye-light"
                : "iconamoon:eye-off"
            }`}
          />
        </div>
        <div class={"flex@md rel ai:center jc:space-between p:5|20|20|20 mb:5"}>
          <span class={"font-weight:600"}>New Password</span>
          <input
            name={"newPassword"}
            type={`${showPassword.newPassword ? "text" : "password"}`}
            placeholder={"Enter New Password"}
            value={passwordData.newPassword}
            onChange={handleInputChange}
          />
          <Icon
            onClick={() => togglePasswordVisibility("newPassword")}
            class="abs top:33px top:10px@md right:20 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
            aria-label="Toggle password visibility"
            icon={`${
              showPassword.newPassword
                ? "iconamoon:eye-light"
                : "iconamoon:eye-off"
            }`}
          />
        </div>
        <div
          class={
            "flex@md rel ai:center jc:space-between p:5|20|20|20 mb:10 bb:1px|solid|lightgrey"
          }
        >
          <span class={"font-weight:600"}>Confirm Password</span>
          <input
            name={"confirmPassword"}
            type={`${showPassword.confirmPassword ? "text" : "password"}`}
            placeholder={"Enter Confirm Password"}
            value={passwordData.confirmPassword}
            onChange={handleInputChange}
          />
          <Icon
            onClick={() => togglePasswordVisibility("confirmPassword")}
            class="abs top:33px top:10px@md right:20 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
            aria-label="Toggle password visibility"
            icon={`${
              showPassword.confirmPassword
                ? "iconamoon:eye-light"
                : "iconamoon:eye-off"
            }`}
          />
        </div>
      </div>
      <div class={"flex jc:end"}>
        <button
          class={
            "p:5|10 m:15|10 r:4 border:none color:white bg:#5b7dff cursor:pointer"
          }
          onClick={onClickSave}
        >
          Update Password
        </button>
      </div>
    </div>
  );
};
