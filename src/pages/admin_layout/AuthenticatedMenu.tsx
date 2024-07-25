import { A, type useNavigate } from "@solidjs/router";
import { type JSX } from "solid-js";

import { type useToast } from "~/components/Toast";
import { APP_BASE_URL } from "~/lib/constants";
import { type useLoading } from "~/lib/contexts";

export interface AuthenticatedMenuProps {
  navigate: ReturnType<typeof useNavigate>;
  onClose: () => void;
  setLoadingSite: ReturnType<typeof useLoading>[1];
  showLoadingToast: ReturnType<typeof useToast>['showLoadingToast'];
  signOutCall: () => Promise<void>;
}


export function AuthenticatedMenu(props: Readonly<AuthenticatedMenuProps>): JSX.Element {
  return (
    <>
      <li class="m:5|10 mt:5px">
        <A class="flex ai:center bg:rgb(241,241,241):hover color:#333 p:5px|7px r:5|5|5|5 text-decoration:none" href={`${APP_BASE_URL}/setting`} onclick={props.onClose}>
          Account Setting
        </A>
      </li>
      <li class="m:5|10 mt:5px">
        <A class="flex ai:center bg:rgb(241,241,241):hover color:#333 p:5px|7px r:5|5|5|5 text-decoration:none" href="/contact-us" onclick={props.onClose}>
          Help
        </A>
      </li>
      <hr class="color:rgb(223,223,223)" />
      <li class="m:5|10 mt:5px">
        <a
          class="flex ai:center color:#333 cursor:default p:10px|7px r:5|5|5|5 text-decoration:none"
          onclick={async () => {
            props.onClose();
            props.setLoadingSite(true);
            await props.showLoadingToast({
              loadMessage: "Logging Out...",
              onSuccess: (value) => {
                if (value != null && value.message !== null) {
                  props.navigate("/auth/login");
                }
              },
              promise: props.signOutCall(),
              successMessage: "Log Out Successfully",
            });
            props.setLoadingSite(false);
          }}
        >
          Sign Out
        </a>
      </li>
    </>
  );
}
