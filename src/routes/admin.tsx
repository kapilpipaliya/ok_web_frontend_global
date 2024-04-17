import type { RouteSectionProps } from "@solidjs/router";
import Counter from "~/components/Counter";

export default function UsersLayout(props: RouteSectionProps) {
    return (
        <div>
            <h1>Admin</h1>
            {/* insert the child route */ props.children}
        </div>
    );
}
