import {
 createSignal,
 For,
 Match,
 Show,
 Switch,
 untrack,
 useContext
} from "solid-js";
import "~/css/base.css";
import { TextField } from "~/components/solid-blocks/blocks";
import { Icon } from "@iconify-icon/solid";
import PageHeader from "~/components/custom/Breadcumb";
import "~/css/tab.css";
import { createStore } from "solid-js/store";
import { useToast } from "~/components/custom/Toast";
import { validateEmail, validatePassword } from "~/lib/Utils";
import {
 Table,
 TableBody,
 TableBodyRow,
 TableData,
 TableHead,
 TableHeader,
 TableHeadRow
} from "~/components/custom/Table";
import { ChipDropDown } from "~/components/custom/Chip";
import CustomModal from "~/components/custom/CommonDialog";
import { DeleteDialog } from "~/components/custom/DeleteDialog";
import postAPI from "~/components/api/postApi";
import { API } from "~/components/api/DataFetcher";
import { GraphContext } from "~/lib/graph/graph";
import { equals } from "rambda";
import {
 deleteSupportTicketCall,
 getChatsSupportCall,
 resetPasswordCall,
 sendChatsSupportCall
} from "~/components/api/api_functions";
import getAPI from "~/components/api/getApi";

function Settings() {
  const [graph, setGraph] = useContext(GraphContext)!;
  const { showErrorToast, showSuccessToast, showLoadingToast } = useToast();
  const [selectedTab, setSelectedTab] = createSignal("General");
  const [isDataFetching, setIsDataFetching] = createSignal(false);
  const breadcrumbData = [
    { name: "Admin", href: "/admin" },
    { name: "Settings" },
  ];

  // detete - deleteNodeMGCall
  // new reply - newRowMGCall(driver, parentVertex.id, 'SupportReply', {text: 'text', timestamp: 'timestamp', personal: 'personal'})
  // to get all reply getChildVertexes(driver, ['SupportReply'], parentVertex)

  const icons: any = {
    Basic: "quill:stack-alt",
    Premium: "ant-design:fire-outlined",
    Pro: "mage:electricity",
    "Advanced Pro":
      "streamline:money-graph-arrow-increase-ascend-growth-up-arrow-stats-graph-right-grow",
  };
  const [selectedPlan, setSelectedPlan] = createSignal("");
  const [plans, setPlans] = createSignal([]);
  const [contactList, setContactList] = createSignal<any>([]);
  const isSelected = (planName: string) => selectedPlan() === planName;
  const [originalProfileData, setOriginalProfileData] = createStore<{
    [key: string]: any;
  }>({}); // Track original data
  const [profileData, setProfileData] = createStore<{ [key: string]: any }>({
    username: "",
    email: "",
    id: "",
    uId: "",
    profileImage: "",
    country: "United States",
  });
  const [isEdit, setIsEdit] = createSignal(false);
  getAPI(API.getUserUrl).then((data: { [key: string]: any }) => {
    setProfileData({
      username: data.properties.username,
      email: data.properties.email,
      id: data.id,
      uId: data.properties.uId,
      profileImage:
        data.properties.profileImage ??
        "https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png",
      country: "United States",
    });
    console.log(profileData.profileImage);

    loadContactData();
    setOriginalProfileData(profileData); // Set original data
  });
  const sectionStyle = {
    "background-color": "#f5f7fa",
    padding: "20px",
    width: "80%",
    margin: "20px",
    "border-radius": "8px",
    "box-shadow": "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  const inputStyle = {
    padding: "5px 10px",
    "border-radius": "4px",
    border: "1px solid #ccc",
  };

  const buttonStyle = {
    padding: "5px 10px",
    margin: "15px 10px",
    "border-radius": "4px",
    border: "none",
    "background-color": "#5b7dff",
    color: "white",
    cursor: "pointer",
  };
  const outlineStyle = {
    padding: "5px 15px",
    margin: "15px 0",
    "border-radius": "4px",
    border: "1px solid #5b7dff",
    color: "#5b7dff",
    cursor: "pointer",
  };
  const loadContactData = async () => {
    setIsDataFetching(true);
    untrack(() => {
      postAPI(API.profileUrl, {
        panel: "supportTicket",
        action: "getTicktes",
        email: profileData.email,
      }).then((value: any) => {
        if (value.contact.length > 0) {
          setContactList(value.contact);
        } else {
          setContactList([]);
        }
        setIsDataFetching(false);
      });
    });
  };
  const loadPlans = async () => {
    setIsDataFetching(true);
    untrack(() => {
      postAPI(API.profileUrl, {
        panel: "pricing",
      }).then((value: any) => {
        if (value.plans.length > 0) {
          setPlans(value.plans);
        } else {
          setPlans([]);
        }
        setIsDataFetching(false);
      });
    });
  };

  loadPlans();

  const GeneralSection = () => {
    const handleInputChange = (e: any) => {
      const { name, value } = e.target;
      setProfileData({ ...profileData, [name]: value.toLowerCase() });
    };

    const profileCall = async () => {
      let updatedData: { [key: string]: any } = {};
      for (const key in profileData) {
        if (profileData[key] !== originalProfileData[key]) {
          // Compare with original data
          updatedData[key] = profileData[key];
        }
      }

      if (selectedImage() !== null) {
        const formData = new FormData();
        formData.append(selectedImage()?.name, selectedImage()!);
        const res = await fetch(
          `/api/uploadImage?name=profile&username=${profileData.username}`,
          {
            method: "POST",
            body: formData,
          },
        );
        const result = await res.json();

        if (result.message) {
          showSuccessToast(result.message);
          updatedData.profileImage = result.newFilename;
        }
      }
      const payload = {
        panel: "profile",
        userId: profileData.id,
        uId: profileData.uId,
        ...updatedData,
      };
      return await postAPI(API.profileUrl, payload);
    };

    const onClickSave = async () => {
      if (equals(profileData, originalProfileData) && selectedImage() == null) {
        showErrorToast("No changes to save");
        return false;
      }
      if (!profileData.username.trim()) {
        showErrorToast("Please enter username");
        return false;
      }
      if (!profileData.email.trim()) {
        showErrorToast("Please enter email");
        return false;
      }
      if (validateEmail(profileData.email)) {
        showErrorToast("Please enter valid email");
        return false;
      }
      await showLoadingToast({
        promise: profileCall(), // This should return a promise
        loadMessage: "Saving Changes...",
        onSuccess: async (data) => {
          if (data.user) {
            setSelectedImage(null);
            await getAPI(API.getUserUrl).then((data: { [key: string]: any }) => {
              setIsEdit(false);
              setProfileData({
                username: data.properties.username.toLowerCase(),
                email: data.properties.email.toLowerCase(),
                id: data.id,
                uId: data.properties.uId,
                profileImage:
                  data.properties.profileImage ??
                  "https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png",
                country: "United States",
              });
              loadContactData();
              setOriginalProfileData(profileData); // Set original data
              setGraph("member", data);
            });
          }
        },
        onError: (error) => {
          setSelectedImage(null);
          console.error("API call failed:", error);
        },
      });
    };
    const [selectedImage, setSelectedImage] = createSignal(null);
    const handleImageChange = async (e: any) => {
      setSelectedImage(e.target.files[0]);
    };

    const handleAvatarClick = () => {
      if (isEdit()) {
        const fileInput = document.getElementById("fileInput");
        fileInput?.click();
      }
    };
    return (
      <div class=" max-w:70%@>lg" style={sectionStyle}>
        <div class={"font-weight:700"}>Personal Info</div>
        <div class={"font-weight:400"}>
          Update personal details here
          <div class="flex m:10|0">
            <input
              name="profileImage"
              type="file"
              accept="image/png, image/jpg, image/jpeg"
              id="fileInput"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            <div class="circle-avatar" onClick={handleAvatarClick}>
              <img
                src={
                  profileData.profileImage ||
                  "https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png"
                }
                alt="Avatar"
                style={{
                  "object-fit": "cover",
                  width: "60px",
                  height: "60px",
                  "border-radius": "50%",
                  cursor: "pointer",
                }}
              />
            </div>
            <div class="ml:10">
              <div style={`font-size: 22px; font-weight: 600;`}>
                {profileData.username}
              </div>
              <div style={`font-size: 18px;`}>{profileData.email}</div>
            </div>
          </div>
          <div class="p:10 gap:10 grid-template-columns:repeat(2,50%) justify-self:center grid@>lg">
            <div>
              <span class={"font-weight:500 font:15 color:dimgrey"}>
                User Id
              </span>
              <TextField
                labelClass={"w:40%"}
                name={"id"}
                label={"Id"}
                disabled={true}
                value={profileData.id}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <span class={"font-weight:500 font:15 color:dimgrey"}>
                UserName
              </span>
              <TextField
                name={"username"}
                disabled={!isEdit()}
                labelClass={"w:40%"}
                label={"Username"}
                value={profileData.username}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <span class={"font-weight:500 font:15 color:dimgrey"}>
                Email Address
              </span>
              <TextField
                name={"email"}
                disabled={!isEdit()}
                labelClass={"w:40%"}
                label={"Email Address"}
                value={profileData.email}
                onChange={handleInputChange}
              />
            </div>
            <div class="d:grid">
              <span class={"font-weight:500 font:15 color:dimgrey"}>
                Country
              </span>
              <select
                name={"country"}
                disabled={!isEdit()}
                style={inputStyle}
                value={profileData.country}
                onChange={handleInputChange}
              >
                <option>United States</option>
                <option>Canada</option>
                <option>United Kingdom</option>
              </select>
            </div>
          </div>
          <div class={"flex jc:end"}>
            <Show
              when={isEdit()}
              fallback={
                <button
                  style={buttonStyle}
                  onClick={() => {
                    setIsEdit(true);
                  }}
                >
                  Edit Settings
                </button>
              }
            >
              <button
                style={outlineStyle}
                onClick={() => {
                  setProfileData(originalProfileData);
                  setIsEdit(false);
                }}
              >
                Cancel
              </button>
              <button style={buttonStyle} onClick={onClickSave}>
                Save Changes
              </button>
            </Show>
          </div>
          {/* <div class="p:10 grid-template-columns:repeat(2,50%) justify-self:center grid@>lg">
            <div class="r:20 flex ai:center jc:center text-align:-webkit-center p:15px m:25 bg:#ffffff justify-self:center max-w:400px@>lg" >
              <div class="p:0|20">
                <div style={`display: flex; flex-direction: column; align-items: center; gap: 10px;`}>
                  <input name="profileImage" type="file" accept="image/png, image/jpg, image/jpeg" id="fileInput" onChange={handleImageChange} style={{ display: 'none' }} />
                  <div class="circle-avatar" onClick={handleAvatarClick}>
                    <img src={profileData.profileImage} alt="Avatar" style={{ width: '100px', height: '100px', 'border-radius': '50%', cursor: 'pointer' }} />
                  </div>
                  <div style={`font-size: 24px; font-weight: bold;`}>{profileData.username}</div>
                  <div style={`font-size: 18px; margin-bottom: 10px;`}>Product Design</div>
                </div>
                <div style={`text-align: center; font-size: 14px;`}>
                  I choose the product design track because I love solving visual problems using UI/UX designs.
                </div>
                <div style={`display: flex; justify-content: center; gap: 10px;`} class="mt:10">
                  <img style={`width: 24px; height: 24px;`} src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram" alt="Instagram" />
                  <img style={`width: 24px; height: 24px;`} src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter" alt="Twitter" />
                  <img style={`width: 24px; height: 24px;`} src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook" alt="Facebook" />
                </div>
              </div>
            </div>
            <div>
             
             
              <div
                class={
                  "flex ai:center jc:space-between p:5|20|20|20"
                }
              >
                <span class={"font-weight:600"}>Email Address</span>
                <TextField
                  name={"email"}
                  disabled={!isEdit()}
                  labelClass={"w:40%"}
                  label={"Email Address"}
                  value={profileData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div
                class={
                  "flex ai:center jc:space-between p:5|20|20|20 mb:10 bb:1px|solid|lightgrey"
                }
              >
                <span class={"font-weight:600"}>Country</span>
                <select
                  name={"country"}
                  disabled={!isEdit()}
                  style={inputStyle}
                  value={profileData.country}
                  onChange={handleInputChange}
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                </select>
              </div>

            </div> 

          </div> */}
        </div>
      </div>
    );
  };
  const PricingPlans = () => {
    return (
      <>
        <div class={"m:10|20"}>
          <div class={"font-weight:700"}>Account Plans</div>
          <span class={"font-weight:500 color:grey f:14"}>
            Pick an account plan that fits your workflow.
          </span>
        </div>

        <div
          class={
            "grid grid-template-columns:(2fr|50%) m:0|20 gap:10 grid-rows:2 w:80%@>md"
          }
        >
          <For each={plans()}>
            {(plan: any) => (
              <div
                class={`${isSelected(plan.name) ? "b:2px|solid|rgb(56,114,250) color:black" : "b:1.5px|solid|rgb(227,227,227) color:black"} r:10 p:0|5 cursor:pointer`}
                onClick={() => setSelectedPlan(plan.name)}
              >
                <div
                  class={
                    "flex jc:space-between ai:center font-weight:medium p:10|20"
                  }
                >
                  <div class={"flex ai:center"}>
                    <div
                      class={
                        "h:35 w:35 bg:rgb(227,227,227) r:50% grid place-items:center"
                      }
                    >
                      <Icon
                        height={22}
                        width={22}
                        class={"color:black"}
                        icon={icons[plan.name]}
                      />
                    </div>
                    <div class={"p:5|10"}>
                      <div>{plan.name}</div>
                      <span class={"color:grey f:14"}>{plan.currency}</span>
                    </div>
                  </div>
                  <div>
                    <span>
                      ${plan.price} / {plan.type}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </>
    );
  };
  const CurrentPlan = () => {
    const [plan, setPlan] = createStore<any>({
      name: "Premium",
      currency: "INR",
      price: 1000,
      type: "Monthly",
    });
    return (
      <div class={"m:10|20"}>
        <div class={"font-weight:700"}>Current Plan</div>
        <span class={"font-weight:500 color:grey f:14"}>
          We’ll credit your account if you need to downgrade during the billing
          cycle.
        </span>
        <div class={"w:50%@>md w:39%@lg m:10|0 mb:20"}>
          <div
            class={`b:2px|solid|rgb(33,146,15) color:black r:10 p:0|5 cursor:pointer`}
          >
            <div
              class={
                "flex jc:space-between ai:center font-weight:medium p:10|20"
              }
            >
              <div class={"flex ai:center"}>
                <div
                  class={
                    "h:35 w:35 bg:rgb(227,227,227) r:50% grid place-items:center"
                  }
                >
                  <Icon
                    height={22}
                    width={22}
                    class={"color:black"}
                    icon={icons[plan.name]}
                  />
                </div>
                <div class={"p:5|10"}>
                  <div>{plan.name}</div>
                  <span class={"color:grey f:14"}>{plan.currency}</span>
                </div>
              </div>
              <div>
                <span>
                  ${plan.price} / {plan.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const PasswordSection = () => {
    const [passwordData, setPasswordData] = createStore<{ [key: string]: any }>(
      {
        currentUser: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
    );
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
        promise: resetPasswordCall(passwordData, profileData),
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
      <div style={sectionStyle}>
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

            <TextField
              name={"username"}
              readOnly
              label={"username"}
              type={"text"}
              labelClass={"w:40%"}
              value={profileData.username}
            />
          </div>
          <div
            class={
              "flex@md rel ai:center jc:space-between p:20 mb:5 bt:1px|solid|lightgrey"
            }
          >
            <span class={"font-weight:600"}>Current Password</span>

            <TextField
              name={"currentPassword"}
              type={`${showPassword.currentPassword ? "text" : "password"}`}
              labelClass={"w:40%"}
              placeholder={"Enter Current Password"}
              value={passwordData.currentPassword}
              onChange={handleInputChange}
            />
            <Icon
              onClick={() => togglePasswordVisibility("currentPassword")}
              class="abs top:50px top:25px@md right:20 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
              aria-label="Toggle password visibility"
              icon={`${showPassword.currentPassword ? "iconamoon:eye-light" : "iconamoon:eye-off"}`}
            />
          </div>
          <div
            class={"flex@md rel ai:center jc:space-between p:5|20|20|20 mb:5"}
          >
            <span class={"font-weight:600"}>New Password</span>
            <TextField
              name={"newPassword"}
              type={`${showPassword.newPassword ? "text" : "password"}`}
              labelClass={"w:40%"}
              placeholder={"Enter New Password"}
              value={passwordData.newPassword}
              onChange={handleInputChange}
            />
            <Icon
              onClick={() => togglePasswordVisibility("newPassword")}
              class="abs top:33px top:10px@md right:20 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
              aria-label="Toggle password visibility"
              icon={`${showPassword.newPassword ? "iconamoon:eye-light" : "iconamoon:eye-off"}`}
            />
          </div>
          <div
            class={
              "flex@md rel ai:center jc:space-between p:5|20|20|20 mb:10 bb:1px|solid|lightgrey"
            }
          >
            <span class={"font-weight:600"}>Confirm Password</span>
            <TextField
              name={"confirmPassword"}
              type={`${showPassword.confirmPassword ? "text" : "password"}`}
              labelClass={"w:40%"}
              placeholder={"Enter Confirm Password"}
              value={passwordData.confirmPassword}
              onChange={handleInputChange}
            />
            <Icon
              onClick={() => togglePasswordVisibility("confirmPassword")}
              class="abs top:33px top:10px@md right:20 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
              aria-label="Toggle password visibility"
              icon={`${showPassword.confirmPassword ? "iconamoon:eye-light" : "iconamoon:eye-off"}`}
            />
          </div>
        </div>
        <div class={"flex jc:end"}>
          <button style={buttonStyle} onClick={onClickSave}>
            Update Password
          </button>
        </div>
      </div>
    );
  };
  const SupportTicketSection = () => {
    const [messages, setMessages] = createSignal<any>([]);
    const [inputMessage, setInputMessage] = createSignal("");

    const sendMessage = async (parentVertexId: number) => {
      if (inputMessage().trim() !== "") {
        const newMessage = {
          text: inputMessage(),
          timestamp: new Date().toLocaleTimeString(),
          personal: true,
        };

        await sendChatsSupportCall(parentVertexId, newMessage)
          .then((e) => {
            setMessages([...messages()!, newMessage]);
            setInputMessage("");
            setTimeout(fakeReply, 1000);
          })
          .catch((e) => {
            showErrorToast("Issue in sending message. Please try again later");
          });
      }
    };

    const fakeReply = () => {
      const replies = [
        "Hi there, how can I assist?",
        "Thanks for your message!",
        "We're looking into this for you.",
        "Can you provide more detail?",
        "Thank you for waiting.",
      ];
      const randomIndex = Math.floor(Math.random() * replies.length);
      const reply = {
        text: replies[randomIndex],
        timestamp: new Date().toLocaleTimeString(),
        personal: false,
      };
      setMessages([...messages()!, reply]);
    };

    const Chat = (props: { id: number }) => {
      let messageContainer: HTMLDivElement;

      const getMessages = async () => {
        const message = await getChatsSupportCall(props.id);
        setMessages(
          message.vertexes.length > 0
            ? message.vertexes.map((v: any) => v.properties)
            : [],
        );
        scrollToBottom();
      };

      const scrollToBottom = () => {
        if (messageContainer) {
          messageContainer.scrollTop = messageContainer.scrollHeight;
        }
      };

      getMessages();

      return (
        <Show
          when={messages().length > 0}
          fallback={
            <div class="text-align:-webkit-center">
              <img
                class="h:30vh"
                src="https://img.freepik.com/free-vector/messaging-concept-illustration_114360-1008.jpg?t=st=1714712810~exp=1714716410~hmac=7374a2e9362db971e16f802634bd6a0ee53d66e92611274c2d60403b73baf49d&w=826"
              />
              <div style="text-align:center;" class="font-weight:600">
                No messages yet
              </div>
            </div>
          }
        >
          <div style="top: 50%; left: 50%; max-height: 500px; z-index: 2; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;">
            <div
              class="grid flex-col"
              ref={(el) => {
                messageContainer = el;
              }}
              style="overflow-y: auto; padding: 10px;"
            >
              <For each={messages()}>
                {(msg: any) => (
                  <>
                    <div class="rel mb:10 mt:10 @fade|.5s">
                      <div
                        style={`color: #fff; float: ${msg.personal ? "right" : "left"}; text-align: ${msg.personal ? "right" : "left"}; background: ${msg.personal ? "linear-gradient(120deg, #248A52, #257287)" : "rgb(29 92 194 / 76%)"}; border-radius: 5px; padding: 5px; margin-bottom: 5px;`}
                      >
                        {msg.text}
                      </div>
                      <div
                        class={`abs bottom:-10 ${msg.personal ? "right:0" : "left:0"}`}
                        style="font-size: 8px;"
                      >
                        {msg.timestamp}
                      </div>
                      <div
                        class={`abs ${msg.personal ? "right:0 bg:#267e70 h:7px bottom:7px" : "left:0 bg:#5783d2 h:7px bottom:8px"}`}
                        style="font-size:8px;width: 10px;transform: skew(298deg, 22deg);top: ;"
                      />
                    </div>
                  </>
                )}
              </For>
            </div>
          </div>
        </Show>
      );
    };

    const OpenDialog = (props: { id: number }) => {
      return (
        <CustomModal
          bodyStyle={{ "max-height": "none", overflow: "auto" }}
          openButton={false}
          buttonLabel={
            <Icon
              class="color:#37c"
              height={22}
              width={22}
              icon="bi:chat-text"
            />
          }
          title="Chat With Support"
          body={
            <div>
              <Chat id={props.id} />
            </div>
          }
          footer={() => (
            <div class={"flex ai:center jc:center"}>
              <div
                class="b:1.5px|solid|lightseagreen r:5"
                style="width: 100%;position: relative;"
              >
                <input
                  type="text"
                  value={inputMessage()}
                  onInput={(e) => setInputMessage(e.target.value)}
                  style="background: none; border: none; outline: none;padding: 0 25px 0px 10px; width: calc(100% - 40px); line-height: 40px;"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendMessage(props.id);
                    }
                  }}
                  placeholder="Type message..."
                />
                <div
                  onClick={() => sendMessage(props.id)}
                  class="flex jc:center"
                  style="position: absolute; top: 5px; right: 10px; color: #fff; border: none; background: #248A52; font-size: 10px; text-transform: uppercase;padding: 4px 6px; border-radius: 10px; cursor: pointer;"
                >
                  <Icon icon={"fluent:send-48-filled"} height={22} width={22} />
                </div>
              </div>
            </div>
          )}
          dialogClass="min-w:30% r:10px p:0"
        />
      );
    };

    const deleteContact = async (id: string) => {
      setIsDataFetching(true);
      await showLoadingToast({
        promise: deleteSupportTicketCall(id),
        loadMessage: "Deleting Ticket...",
        successMessage: "Support ticket deleted successfully",
        onSuccess: (value) => {
          const data = contactList().filter((c: any) => c.id != id);
          setContactList(data);
        },
      });
      setIsDataFetching(false);
    };

    const changeStatus = async (id: string, status: string) => {
      setIsDataFetching(true);
      const res: any = await postAPI(API.profileUrl, {
        panel: "supportTicket",
        action: "updateStatus",
        id,
        status,
      });
      if (res.error) {
        showErrorToast(res.error.message);
      } else {
        showSuccessToast(res.message);
        const data = contactList().map((c: any) => {
          if (c.id == id) {
            c.status = status;
          }
          return c;
        });
        setContactList(data);
      }

      setIsDataFetching(false);
    };

    return (
      <div class={"w:80%@>md w:100%"}>
        <div class={"m:10|20"}>
          <div class={"font-weight:700"}>Support Ticket Details</div>
          <span class={"font-weight:500 color:grey f:14"}>
            List of all your contacts with our platforms
          </span>
        </div>
        <div class="m:0|15">
          <Table>
            <TableHead>
              <TableHeadRow>
                <For
                  each={[
                    "id",
                    "Name",
                    "Subject",
                    "Message",
                    "Status",
                    "Actions",
                  ]}
                >
                  {(header) => {
                    return <TableHeader>{header}</TableHeader>;
                  }}
                </For>
                <TableHeader />
              </TableHeadRow>
            </TableHead>
            <TableBody>
              <For
                fallback={
                  <TableBodyRow>
                    <TableData colSpan={6} class={"font-weight:600"}>
                      No Tickets Found
                    </TableData>
                  </TableBodyRow>
                }
                each={contactList()}
              >
                {(row: any, index) => {
                  return (
                    <TableBodyRow index={index()}>
                      <TableData>{row.id}</TableData>
                      <TableData>{row.name}</TableData>
                      <TableData>{row.subject}</TableData>
                      <TableData>{row.message}</TableData>
                      <TableData>
                        <ChipDropDown
                          selectedItem={row.status}
                          onChanged={(e) => {
                            changeStatus(row.id, e);
                          }}
                        />
                      </TableData>
                      <TableData>
                        <div class={"flex jc:center ai:center"}>
                          <OpenDialog id={row.id} />
                          <DeleteDialog
                            buttonLabel={
                              <Icon
                                icon="fluent:delete-48-regular"
                                class="color:rgb(255,0,0)"
                                height={22}
                                width={22}
                              />
                            }
                            onConfirm={() => {
                              deleteContact(row.id);
                            }}
                            title={"Delete Support Ticket"}
                            message={
                              "Are you sure you want to delete this ticket?"
                            }
                          />
                        </div>
                      </TableData>
                    </TableBodyRow>
                  );
                }}
              </For>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };
  return (
    <>
      <PageHeader title="Account Setting" breadcrumb={breadcrumbData} />
      <div class="radio-inputs m:20">
        <label class="radio" onClick={() => setSelectedTab("General")}>
          <input
            type="radio"
            name="radio"
            checked={selectedTab() === "General"}
          />
          <span class="name">General</span>
        </label>
        <label class="radio" onClick={() => setSelectedTab("Pricing")}>
          <input
            type="radio"
            name="radio"
            checked={selectedTab() === "Pricing"}
          />
          <span class="name">Pricing</span>
        </label>
        <label class="radio" onClick={() => setSelectedTab("Password")}>
          <input
            type="radio"
            name="radio"
            checked={selectedTab() === "Password"}
          />
          <span class="name">Password</span>
        </label>
        <label class="radio" onClick={() => setSelectedTab("Support")}>
          <input
            type="radio"
            name="radio"
            checked={selectedTab() === "Support"}
          />
          <span class="name">Support</span>
        </label>
      </div>

      <Show
        when={!isDataFetching()}
        fallback={
          <div class={"h:50vh grid place-items:center"}>
            <div class={"loader"} />
          </div>
        }
      >
        <Switch>
          <Match when={selectedTab() === "General"}>
            <GeneralSection />
          </Match>
          <Match when={selectedTab() === "Pricing"}>
            <CurrentPlan />
            <PricingPlans />
          </Match>
          <Match when={selectedTab() === "Password"}>
            <PasswordSection />
          </Match>
          <Match when={selectedTab() === "Support"}>
            <SupportTicketSection />
          </Match>
        </Switch>
      </Show>
    </>
  );
}

export default Settings;
