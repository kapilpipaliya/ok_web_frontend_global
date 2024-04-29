import {getSession, login, logout as logoutSession, register, validatePassword, validateUsername} from "./_server";
import {isIntegerId, driver} from "~/globals/global";

export const getPlans = async () => {
    "use server";
    const session = await getSession();
    const neoSession = driver.session();

    const email = session.data.email;
    if (email === undefined) {
        return {error: "Not Authorized"};
    }

    const query = `MATCH (n:Pricing) RETURN n;`;
    const result = await neoSession.run(query);
    const plans = result.records.map((r) => r.get('n').properties);
    return {
        plans: plans
    }
};

export const updatePassword = async (currentPassword: string, newPassword: string, username: string) => {
    "use server";
    const session = await getSession();
    const neoSession = driver.session();

    const email = session.data.email;
    if (email === undefined) {
        return {error: "Not Authorized"};
    }

    const findUserQuery = `MATCH (u:User) WHERE u.password = $password AND u.username = $username RETURN u;`;
    const findUserResult = await neoSession.run(findUserQuery, {password: currentPassword, username: username});
    if (findUserResult.records.length === 0) {
        return {error: "Current Password is not valid"};
    }


    const query = `MATCH (u:User) WHERE u.username = $username SET u.password = $password RETURN u;`;
    const result = await neoSession.run(query, {username: username, password: newPassword});
    if (result.records.length === 0) {
        return {error: "Failed to update password"}
    }
    return {
        message: 'Password updated successfully',
    }
};
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
