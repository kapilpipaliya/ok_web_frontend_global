import { type JSX, Show } from "solid-js";

import { AuthenticatedMenu } from "./AuthenticatedMenu";
import { UnauthenticatedMenu } from "./UnauthenticatedMenu";
export interface MenuItemsProps {
  isAuthenticated: boolean;
  navigate: ReturnType<typeof useNavigate>;
  onClose: () => void;
  setLoadingSite: ReturnType<typeof useLoading>[1];
  showLoadingToast: ReturnType<typeof useToast>['showLoadingToast'];
  signOutCall: () => Promise<void>;
}

export function MenuItems(props: Readonly<MenuItemsProps>): JSX.Element {
  return (
    <Show fallback={<UnauthenticatedMenu onClose={props.onClose} />} when={props.isAuthenticated}>
      <AuthenticatedMenu
        navigate={props.navigate}
        onClose={props.onClose}
        setLoadingSite={props.setLoadingSite}
        showLoadingToast={props.showLoadingToast}
        signOutCall={props.signOutCall} />
    </Show>
  );
}
