import {
  type Accessor,
  createSignal,
  type JSX,
  Match,
  type Setter,
  Show,
  Switch,
  untrack,
} from "solid-js";
import { createStore } from "solid-js/store";

import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { LoaderNew } from "~/components/styled/LoaderSimple";
import { useToast } from "~/components/styled/Toast";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { UserDropdownMenuDisplay } from "~/pages/admin_layout/DropdownMenuDisplay";
import { SelectThemeButton } from "~/pages/admin_layout/theme/SelectThemeButton";

import { SupportTicketSection } from "./tabs/Support";

interface ProfileData {
  [key: string]: any;
  country: string;
  email: string;
  id: string;
  profileImage: string;
  uId: string;
  username: string;
}

interface TabSectionProps {
  selectedTab: Accessor<string>;
  setSelectedTab: Setter<string>;
}

export function Settings(): JSX.Element {
  const [selectedTab, setSelectedTab] = createSignal<string>("General");
  const [isMainScreenLoad, setIsMainScreenLoad] = createSignal<boolean>(false);
  const [contactList, setContactList] = createSignal<any[]>([]);
  const [originalProfileData, setOriginalProfileData] =
    createStore<ProfileData>({});
  const { showErrorToast, showLoadingToast, showSuccessToast } = useToast();

  const [profileData, setProfileData] = createStore<ProfileData>({
    country: "United States",
    email: "",
    id: "",
    profileImage: "",
    uId: "",
    username: "",
  });

  const loadUserData = async () => {
    try {
      loadContactData();
      setOriginalProfileData(profileData); // Set original data
      setIsMainScreenLoad(true);
    } catch (err) {
      showErrorToast((err as Error).message);
      setIsMainScreenLoad(false);
    }
  };

  const loadContactData = async () => {
    untrack(async () => {
      try {
        const value = await postAPI(API.profileUrl, {
          action: "getTicktes",
          email: profileData.email,
          panel: "supportTicket",
        });

        setContactList(value.contact.length > 0 ? value.contact : []);
      } finally {
        setIsMainScreenLoad(false);
      }
    });
  };

  // Load user data and plans when the component mounts
  loadUserData();

  return (
    <>
      <HeaderWithDescription
        description="Manage your account settings and preferences."
        title="Account Settings"
      />
      <div class="position:fixed right:1rem top:1rem flex gap:4">
        <SelectThemeButton />
        <UserDropdownMenuDisplay />
      </div>
      <TabSection selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      <Show
        fallback={<LoaderNew loaderHeight="50vh" />}
        when={!isMainScreenLoad()}
      >
        <Switch>
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

const TabSection = (props: TabSectionProps): JSX.Element => {
  const tabs = ["General", "Pricing", "Password", "Support"];

  return (
    <div class="border:1px|solid|lightgrey box-shadow:0|0|0px|1px|rgba(0,0,0,0.06) box:border display:flex f:14px flex:wrap min-w:max position:relative px:4px py:2px r:0.3rem">
      {tabs.map((tab) => (
        <label
          class="flex:1 text:center"
          key={tab}
          onClick={() => props.setSelectedTab(tab)}
        >
          <input
            checked={props.selectedTab() === tab}
            class="hidden"
            name="radio"
            type="radio"
          />
          <span
            class={`${
              props.selectedTab() === tab
                ? "bb:1px|solid|rgb(0,0,255) fg:rgb(0,0,255)"
                : ""
            } flex align-items:center border:none cursor:pointer jc:center p:4px text:rgb(128,128,128) transition:all|.15s|ease-in-out`}
          >
            {tab}
          </span>
        </label>
      ))}
    </div>
  );
};
