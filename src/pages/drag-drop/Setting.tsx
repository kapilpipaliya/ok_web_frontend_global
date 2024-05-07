import {
  createEffect,
  createSignal,
  For,
  Match,
  onCleanup,
  Show,
  Switch,
  untrack,
} from "solid-js";
import "~/css/base.css";
import { TextField } from "~/components/solid-blocks/blocks";
import { Icon } from "@iconify-icon/solid";
import PageHeader from "~/components/custom/Breadcumb";
import { getUser } from "~/lib/auth/auth";
import "~/css/tab.css";
import { createStore } from "solid-js/store";
import { useToast } from "~/components/custom/Toast";
import { validateEmail, validatePassword } from "~/lib/Utils";
import { toast } from "solid-toast";
import {
  Table,
  TableBody,
  TableBodyRow,
  TableData,
  TableHead,
  TableHeader,
  TableHeadRow,
} from "~/components/custom/Table";
import { ChipDropDown } from "~/components/custom/Chip";
import CustomModal from "~/components/custom/CommonDialog";
import { DeleteDialog } from "~/components/custom/DeleteDialog";
import { getDriver } from "~/lib/global";
import postAPI from "~/lib/auth/PostApi";
import { API } from "~/components/api/DataFetcher";

function Settings() {
  const { showErrorToast, showSuccessToast } = useToast();
  const [selectedTab, setSelectedTab] = createSignal("Support");
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
    country: "United States",
  });
  const [isEdit, setIsEdit] = createSignal(false);
  getUser().then((data) => {
    setProfileData({
      username: data.properties.username,
      email: data.properties.email,
      id: data.id,
      country: "United States",
    });
    loadContactData();
    setOriginalProfileData(profileData); // Set original data
  });
  const sectionStyle = {
    "background-color": "#f5f7fa",
    padding: "20px",
    margin: "20px",
    "border-radius": "8px",
    "box-shadow": "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  const inputStyle = {
    padding: "5px 10px",
    margin: "5px 0",
    width: "40%",
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
      setProfileData({ ...profileData, [name]: value });
    };

    const profileCall = async () => {
      let updatedData: { [key: string]: any } = {};
      for (const key in profileData) {
        console.log(profileData[key], originalProfileData[key]);
        if (profileData[key] !== originalProfileData[key]) {
          // Compare with original data
          updatedData[key] = profileData[key];
        }
      }
      try {
        const payload = {
          ...updatedData,
          userId: profileData.id,
          panel: "profile",
        };

        let response = await postAPI(API.profileUrl, payload);
        if (response.error) {
          return Promise.reject(new Error(response.error));
        }
        return response;
      } catch (error: any) {
        return Promise.reject(new Error(error.response));
      }
    };
    const onClickSave = async () => {
      if (!profileData.username.trim()) {
        showErrorToast("Please enter username");
        return false;
      }
      if (!profileData.email.trim()) {
        showErrorToast("Please enter email");
        return false;
      }
      if (!validateEmail(profileData.email)) {
        showErrorToast("Please enter valid email");
        return false;
      }
      let response = {} as { [key: string]: any };
      await toast.promise(profileCall(), {
        loading: "Saving Changes...",
        success: (val) => {
          response = val;
          return <span>{val.message}</span>;
        },
        error: (error) => {
          console.log("error => ", error);
          return <span>{error.message}</span>;
        },
      });
      if (response!.error) {
        showErrorToast(response!.error);
        return;
      }
    };
    return (
      <div style={sectionStyle}>
        <div>
          <div class={"font-weight:700"}>Personal Info</div>
          <div class={"font-weight:400 mb:30"}>
            Update personal details here
          </div>
          <div
            class={
              "flex ai:center jc:space-between p:20|20|0|20 m:10|0|5|0 bt:1px|solid|lightgrey"
            }
          >
            <span class={"font-weight:600"}>User Id</span>
            <TextField
              labelClass={"w:40%"}
              name={"id"}
              label={"Id"}
              disabled={true}
              value={profileData.id}
              onChange={handleInputChange}
            />
          </div>
          <div
            class={
              "flex ai:center jc:space-between p:20 m:10|0 bt:1px|dashed|lightgrey bb:1px|dashed|lightgrey"
            }
          >
            <span class={"font-weight:600"}>UserName</span>
            <TextField
              name={"username"}
              disabled={!isEdit()}
              labelClass={"w:40%"}
              label={"Username"}
              value={profileData.username}
              onChange={handleInputChange}
            />
          </div>
          <div
            class={
              "flex ai:center jc:space-between p:5|20|20|20 mb:10 bb:1px|dashed|lightgrey"
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

    const updatePasswordCall = async () => {
      try {
        const payload = {
          panel: "password",
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          username: profileData.username,
        };

        let response = await postAPI(API.profileUrl, payload);
        if (response.error) {
          return Promise.reject(new Error(response.error));
        }
        return response;
      } catch (error: any) {
        return Promise.reject(new Error(error.response));
      }
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
      let response = {} as { [key: string]: any };
      await toast.promise(updatePasswordCall(), {
        loading: "Updating Password...",
        success: (val) => {
          response = val;
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
          return <span>Password Updated Successfully</span>;
        },
        error: (error) => {
          return <span>{error.message}</span>;
        },
      });
      if (response!.error) {
        showErrorToast(response!.error);
        return;
      }
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
              "flex@md rel ai:center jc:space-between p:20 m:10|0 bt:1px|solid|lightgrey bb:1px|dashed|lightgrey"
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
            class={
              "flex@md rel ai:center jc:space-between p:5|20|20|20 mb:10 bb:1px|dashed|lightgrey"
            }
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
        console.log(newMessage, parentVertexId, getDriver("super"));
        const data = await postAPI(API.profileUrl, {
          newMessage: newMessage,
          parentVertexId: parentVertexId,
          panel: "supportTicket",
          action: "chat",
          subAction: "send",
        });

        if (data.error) {
          showErrorToast("Issue in sending message. Please try again later.");
        }
        setMessages([...messages()!, newMessage]);
        setInputMessage("");
        setTimeout(fakeReply, 1000);
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
      console.log(messages());
    };

    const Chat = (props: { id: number }) => {
      let messageContainer: HTMLDivElement;
      const getMessages = async () => {
        const message = await postAPI(API.profileUrl, {
          parentVertexId: props.id,
          panel: "supportTicket",
          action: "chat",
          subAction: "get",
        });
        setMessages(message.vertexes.map((v: any) => v.properties));
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
            <div class="flex ai:center jc:center">
              <div class="loader" />
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
              <For
                each={messages()}
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
      const res: any = await postAPI(API.profileUrl, {
        panel: "supportTicket",
        action: "delete",
        id,
      });
      if (res.error) {
        showErrorToast(res.error.message);
      } else {
        showSuccessToast("Support ticket deleted successfully");
        const data = contactList().filter((c: any) => c.id != id);
        setContactList(data);
      }
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
