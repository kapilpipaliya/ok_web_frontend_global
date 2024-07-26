import {
  type Accessor,
  Match,
  type Setter,
  Show,
  Switch,
  createSignal,
  untrack,
} from "solid-js";
import { createStore } from "solid-js/store";

import { Breadcrumb } from "~/components/Breadcrumb";
import { LoaderNew } from "~/components/LoaderSimple";
import { useToast } from "~/components/Toast";
import { API } from "~/lib/api/endpoints";
import { getAPI } from "~/lib/api/getApi";
import { postAPI } from "~/lib/api/postApi";

import { GeneralSection } from "./tabs/General";
import { PasswordSection } from "./tabs/Password";
import { CurrentPlan, PricingPlans } from "./tabs/Pricing";
import { SupportTicketSection } from "./tabs/Support";

export function Settings() {
  const [selectedTab, setSelectedTab] = createSignal("General");
  const [isMainScreenLoad, setIsMainScreenLoad] = createSignal(false);
  const [plans, setPlans] = createSignal([]);
  const [contactList, setContactList] = createSignal<any>([]);
  const [originalProfileData, setOriginalProfileData] = createStore<{
    [key: string]: any;
  }>({}); // Track original data
  const { showErrorToast, showLoadingToast, showSuccessToast } = useToast();

  const [profileData, setProfileData] = createStore<{ [key: string]: any }>({
    country: "United States",
    email: "",
    id: "",
    profileImage: "",
    uId: "",
    username: "",
  });

  const breadcrumbData = [
    { href: "/admin", name: "Admin" },
    { name: "Settings" },
  ];

  getAPI(API.getUserUrl)
    .then((data: { [key: string]: any }) => {
      const user = data.user;
      setIsMainScreenLoad(true);
      setProfileData({
        country: "United States",
        email: user.P.email,
        id: user.id,
        profileImage:
          user.P.profileImage ??
          "https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png",
        uId: user.P.uId,
        username: user.P.username,
      });

      loadContactData();
      setOriginalProfileData(profileData); // Set original data
    })
    .catch((err) => {
      showErrorToast(err.message);
      setIsMainScreenLoad(false);
    });

  const loadContactData = async () => {
    untrack(() => {
      postAPI(API.profileUrl, {
        action: "getTicktes",
        email: profileData.email,
        panel: "supportTicket",
      }).then((value: any) => {
        if (value.contact.length > 0) {
          setContactList(value.contact);
        } else {
          setContactList([]);
        }
        setIsMainScreenLoad(false);
      });
    });
  };

  const loadPlans = async () => {
    setIsMainScreenLoad(true);
    untrack(() => {
      postAPI(API.profileUrl, {
        panel: "pricing",
      }).then((value: any) => {
        if (value.plans.length > 0) {
          setPlans(value.plans);
        } else {
          setPlans([]);
        }
        setIsMainScreenLoad(false);
      });
    });
  };

  loadPlans();

  return (
    <>
      <Breadcrumb breadcrumb={breadcrumbData} title="Account Setting" />
      <TabSection selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      <Show
        fallback={<LoaderNew loaderHeight="50vh" />}
        when={!isMainScreenLoad()}
      >
        <Switch>
          <Match when={selectedTab() === "General"}>
            <GeneralSection
              originalProfileData={originalProfileData}
              profileData={profileData}
              setOriginalProfileData={setOriginalProfileData}
              setProfileData={setProfileData}
            />
          </Match>
          <Match when={selectedTab() === "Pricing"}>
            <CurrentPlan />
            <PricingPlans plans={plans} />
          </Match>
          <Match when={selectedTab() === "Password"}>
            <PasswordSection profileData={profileData} />
          </Match>
          <Match when={selectedTab() === "Support"}>
            <SupportTicketSection
              contactList={contactList}
              setContactList={setContactList}
              setIsMainScreenLoad={setIsMainScreenLoad}
            />
          </Match>
        </Switch>
      </Show>
    </>
  );
}
const TabSection = (
  props: Readonly<{
    selectedTab: Accessor<string>;
    setSelectedTab: Setter<string>;
  }>,
) => {
  return (
    <div class="border:1px|solid|lightgrey box-shadow:0|0|0px|1px|rgba(0,0,0,0.06) box:border display:flex f:14px flex:wrap min-w:max position:relative px:4px py:2px r:0.3rem">
      <label
        class="flex:1 text:center"
        onClick={() => props.setSelectedTab("General")}
      >
        <input
          checked={props.selectedTab() === "General"}
          class="hidden"
          name="radio"
          type="radio"
        />
        <span
          class={`${props.selectedTab() === "General" ? "bb:1px|solid|rgb(0,0,255) fg:rgb(0,0,255)" : ""} flex align-items:center border:none cursor:pointer jc:center p:4px text:rgb(128,128,128) transition:all|.15s|ease-in-out`}
        >
          General
        </span>
      </label>
      <label
        class="flex:1 text:center"
        onClick={() => props.setSelectedTab("Pricing")}
      >
        <input
          checked={props.selectedTab() === "Pricing"}
          class="hidden"
          name="radio"
          type="radio"
        />
        <span
          class={`${props.selectedTab() === "Pricing" ? "bb:1px|solid|rgb(0,0,255) fg:rgb(0,0,255)" : ""} flex align-items:center border:none cursor:pointer jc:center p:4px text:rgb(128,128,128) transition:all|.15s|ease-in-out`}
        >
          Pricing
        </span>
      </label>
      <label
        class="flex:1 text:center"
        onClick={() => props.setSelectedTab("Password")}
      >
        <input
          checked={props.selectedTab() === "Password"}
          class="hidden"
          name="radio"
          type="radio"
        />
        <span
          class={`${props.selectedTab() === "Password" ? "bb:1px|solid|rgb(0,0,255) fg:rgb(0,0,255)" : ""} flex align-items:center border:none cursor:pointer jc:center p:4px text:rgb(128,128,128) transition:all|.15s|ease-in-out`}
        >
          Password
        </span>
      </label>
      <label
        class="flex:1 text:center"
        onClick={() => props.setSelectedTab("Support")}
      >
        <input
          checked={props.selectedTab() === "Support"}
          class="hidden"
          name="radio"
          type="radio"
        />
        <span
          class={`${props.selectedTab() === "Support" ? "bb:1px|solid|rgb(0,0,255) fg:rgb(0,0,255)" : ""} flex align-items:center border:none cursor:pointer jc:center p:4px text:rgb(128,128,128) transition:all|.15s|ease-in-out`}
        >
          Support
        </span>
      </label>
    </div>
  );
};
