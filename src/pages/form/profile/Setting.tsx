import {
  createSignal,
  Match,
  type Setter,
  Show,
  Switch,
  untrack,
  type Accessor,
} from "solid-js";
import "~/css/base.css";
import {PageHeader} from "~/components/Breadcrumb";
import "~/css/tab.css";
import { createStore } from "solid-js/store";
import { useToast } from "~/components/Toast";
import {postAPI} from "~/lib/api/postApi";
import { API } from "~/lib/api/endpoints";
import {getAPI} from "~/lib/api/getApi";
import { PasswordSection } from "./tabs/Password";
import { GeneralSection } from "./tabs/General";
import { CurrentPlan, PricingPlans } from "./tabs/Pricing";
import { SupportTicketSection } from "./tabs/Support";
import { LoaderNew } from "~/components/LoaderSimple";

export function Settings() {
  const [selectedTab, setSelectedTab] = createSignal("General");
  const [isMainScreenLoad, setIsMainScreenLoad] = createSignal(false);
  const [plans, setPlans] = createSignal([]);
  const [contactList, setContactList] = createSignal<any>([]);
  const [originalProfileData, setOriginalProfileData] = createStore<{
    [key: string]: any;
  }>({}); // Track original data
  const { showErrorToast, showSuccessToast, showLoadingToast } = useToast();

  const [profileData, setProfileData] = createStore<{ [key: string]: any }>({
    username: "",
    email: "",
    id: "",
    uId: "",
    profileImage: "",
    country: "United States",
  });

  const breadcrumbData = [
    { name: "Admin", href: "/admin" },
    { name: "Settings" },
  ];

  getAPI(API.getUserUrl)
    .then((data: { [key: string]: any }) => {
      setIsMainScreenLoad(true);
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
        panel: "supportTicket",
        action: "getTicktes",
        email: profileData.email,
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
      <PageHeader title="Account Setting" breadcrumb={breadcrumbData} />
      <TabSection setSelectedTab={setSelectedTab} selectedTab={selectedTab} />

      <Show
        when={!isMainScreenLoad()}
        fallback={<LoaderNew loaderHeight="50vh" />}
      >
        <Switch>
          <Match when={selectedTab() === "General"}>
            <GeneralSection
              profileData={profileData}
              originalProfileData={originalProfileData}
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
const TabSection = (props: {
  setSelectedTab: Setter<string>;
  selectedTab: Accessor<string>;
}) => {
  return (
    <div class="radio-inputs m:20">
      <label class="radio" onClick={() => props.setSelectedTab("General")}>
        <input
          type="radio"
          name="radio"
          checked={props.selectedTab() === "General"}
        />
        <span class="name">General</span>
      </label>
      <label class="radio" onClick={() => props.setSelectedTab("Pricing")}>
        <input
          type="radio"
          name="radio"
          checked={props.selectedTab() === "Pricing"}
        />
        <span class="name">Pricing</span>
      </label>
      <label class="radio" onClick={() => props.setSelectedTab("Password")}>
        <input
          type="radio"
          name="radio"
          checked={props.selectedTab() === "Password"}
        />
        <span class="name">Password</span>
      </label>
      <label class="radio" onClick={() => props.setSelectedTab("Support")}>
        <input
          type="radio"
          name="radio"
          checked={props.selectedTab() === "Support"}
        />
        <span class="name">Support</span>
      </label>
    </div>
  );
};
