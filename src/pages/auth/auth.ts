import {getSession, login, logout as logoutSession, register, validatePassword, validateUsername} from "./_server";
import {isIntegerId, driver} from "~/globals/global";

// use this function in all api to find if user is logged in or not?
export const getUser = async () => {
    "use server";
    // try {
    const session = await getSession();
    const neoSession = driver.session();

    const email = session.data.email;
    if (email === undefined) {
        return {error: "Not Authorized"};
    }
    const query = `MATCH (u:User {email: $email}) return u;`;
    const result = await neoSession.run(query, {email: email});

    if (result.records.length === 0) {
        return {error: "Not Authorized"};
    }
    const user = result.records[0].get('u');
    const {password, ...properties} = user.properties;


    return {
        id: !isIntegerId ? user.identity.toNumber() : user.identity,
        properties
    }

    // } catch (error) {
    //     console.error('Server error Failed to login:', error);
    //     return new Response('Internal Server Error', {status: 500});
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
