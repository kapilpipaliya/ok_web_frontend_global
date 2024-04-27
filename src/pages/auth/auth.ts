import {action, cache, redirect, useNavigate} from "@solidjs/router";
import {getSession, login, logout as logoutSession, register, validatePassword, validateUsername} from "./_server";
import {APP_BASE_URL} from "~/lib/Utils";

export const getUser = async () => {
    "use server";
    // try {
        const session = await getSession();
        const userId = session.data.userId;
        if (userId === undefined) {
            return redirect("/auth/login");
        }
        // const user = await db.user.findUnique({where: {id: userId}});
        // if (!user) throw new Error("User not found");
        return {id: userId, user: session.data.user, password: session.data.password, email: session.data.email};
    // } catch {
    //     console.log("Error");
    // }
};

export const loginOrRegister = async (props: {
    email?: any,
    password: string;
    loginType: string;
    username: string
}) => {
    "use server";
    const username = String(props.username);
    const password = String(props.password);
    const email = String(props.email);
    const loginType = props.loginType;
    let error = validateUsername(username) || validatePassword(password);
    if (error) return new Error(error);
    try {
        const user = await (loginType !== "login"
            ? register(username, password, email)
            : login(username, password));
        const session = await getSession();
        await session.update(oldData => ({
            ...oldData,
            userId: user.id,
            username: user.username,
            password: user.password,
            email: user.email
        }));
    } catch (err) {
        return err as Error;
    }
};

export const logout = async () => {
    "use server";
    await logoutSession();
};
