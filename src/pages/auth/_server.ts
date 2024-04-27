import {useSession} from "vinxi/http";

export function validateUsername(username: unknown) {
    if (typeof username !== "string" || username.length < 3) {
        return `Usernames must be at least 3 characters long`;
    }
}

export function validatePassword(password: any) {
    if (password.length < 3) {
        return `Passwords must be at least 3 characters long`;
    }
}

export async function login(username: string, password: string) {
    const user = {id: 1, username: username, password: 'admin', email: 'savan@gmail.com'};
    if (!user || password !== user.password) throw new Error("Invalid login");
    return user;
}

export async function logout() {
    const session = await getSession();
    await session.clear();
}

export async function register(username: string, password: string, email: string) {
    // const existingUser = await db.user.findUnique({ where: { username } });
    // if (existingUser) throw new Error("User already exists");
    // return db.user.create({
    //     data: { username: username, password }
    // });
    return {id: 1, username: username, password: password, email: email};
}

export function getSession() {
    const config = {
        password: "asdfgargabaewt124333415342erwbwetvfvgaqwt"
        // Other configuration options if required
    };
    return useSession(config);
}
