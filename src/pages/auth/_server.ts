import {useSession} from "vinxi/http";
import {redirect} from "@solidjs/router";

export function getSession() {
    const config = {
        password: "asdfgargabaewt124333415342erwbwetvfvgaqwt"
        // Other configuration options if required
    };
    return useSession(config);
}

export function validateUsername(email: any) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address.';
    }
    return undefined; // No error, email is val
}
export function validatePassword(password: any) {
    const conditions = [
        { regex: /.{8,}/, message: 'Passwords must be at least 8 characters long.' },
        { regex: /[A-Z]/, message: 'Password must include at least one uppercase letter.' },
        { regex: /[a-z]/, message: 'Password must include at least one lowercase letter.' },
        { regex: /[0-9]/, message: 'Password must include at least one number.' },
        { regex: /[!@#$%^&*(),.?":{}|<>]/, message: 'Password must include at least one special character.' }
    ];

    for (const condition of conditions) {
        if (!condition.regex.test(password)) {
            return condition.message;
        }
    }

    return undefined; // No errors, password is valid
}

export async function login(username: string, password: string) {
    // const user = {id: 1, username: username, password: 'admin', email: 'savan@gmail.com'};
    // if (!user || password !== user.password) throw new Error("Invalid login");
    // return user;
}

export async function logout() {
    const session = await getSession();
    await session.update((d) => (d.userId = undefined));
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
