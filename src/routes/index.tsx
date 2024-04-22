import {createAsync, redirect, type RouteDefinition, useNavigate} from "@solidjs/router";
import {getUser} from "~/pages/auth/auth";
import {APP_BASE_URL} from "~/lib/Utils";

export default function Home() {
    const navigate = useNavigate();
    const user = createAsync(() => getUser(), {deferStream: true});
    if (user()?.id) {
        navigate(`${APP_BASE_URL}`)
    }
    return (
        <main class="w-full p-4 space-y-2">
            <h2 class="font-bold text-3xl">Hello Guest</h2>
            <button onClick={() => navigate(`/auth/login`)}>Login</button>
            <button onClick={() => navigate(`/auth/signup`)}>SignUp</button>
        </main>
    );
}
