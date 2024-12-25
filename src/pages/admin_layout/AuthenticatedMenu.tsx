import type { JSX } from "solid-js";

import { useNavigate } from "@solidjs/router";

import { useToast } from "~/components/styled/Toast";
import { useGraph } from "~/lib/graph/graph";

export interface AuthenticatedMenuProps {
  onClose: () => void;
  signOutCall: () => Promise<{
    [key: string]: any;
  }>;
}

export function AuthenticatedMenu(
  props: Readonly<AuthenticatedMenuProps>,
): JSX.Element {
  const [graph, setGraph] = useGraph();
  const navigate = useNavigate();
  const { showLoadingToast } = useToast();
  return (
    <>
      <li class="m:5|10 mt:5px">
        <a
          class="flex ai:center bg:rgb(241,241,241):hover color:#333 p:5px|7px r:5|5|5|5 text-decoration:none"
          href={`${graph.APP_BASE_URL}/settings`}
          onclick={props.onClose}
        >
          Account Setting
        </a>
      </li>
      <li class="m:5|10 mt:5px">
        <a
          class="flex ai:center bg:rgb(241,241,241):hover color:#333 p:5px|7px r:5|5|5|5 text-decoration:none"
          href="/contact-us"
          onclick={props.onClose}
        >
          Help
        </a>
      </li>
      <hr class="color:rgb(223,223,223)" />
      <li class="m:5|10 mt:5px">
        <a
          class="flex ai:center color:#333 cursor:default p:10px|7px r:5|5|5|5 text-decoration:none"
          onclick={async () => {
            props.onClose();
            setGraph("isLoadingPage", true);
            await showLoadingToast({
              loadMessage: "Logging Out...",
              onSuccess: (value) => {
                if (value != null && value.message !== null) {
                  navigate("/auth/login");
                }
              },
              promise: props.signOutCall(),
              successMessage: "Log Out Successfully",
            });
            setGraph("isLoadingPage", false);
          }}
        >
          Sign Out
        </a>
      </li>
    </>
  );
}
