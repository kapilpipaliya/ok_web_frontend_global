import {session} from "~/globals/global";
import {APIEvent} from "@solidjs/start/dist/server";
import {useToast} from "~/components/custom-component/toast";
import {getCookie, setCookie} from "vinxi/http";
// @ts-ignore
import bcrypt from 'bcryptjs';
// @ts-ignore
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'JWTSECRETKEY'; // Use an environment variable in production
function decryptJWT(token: string , secret: string ) {
    try {
        // Verify the token with the secret key and options
        const decoded = jwt.verify(token, secret);
        return decoded;
    } catch (error) {
        throw new Error('Invalid token: ' + error.message);
    }
}

export async function isLoggedIn(): Promise<boolean> {
    // Assuming the token is stored in localStorage
    const token = getCookie('token');

    // Check if the token exists
    if (!token) {
        return false;
    }

    const decodedKey = decryptJWT(token, JWT_SECRET);
    const extractedEmail = decodedKey.email
    if (!extractedEmail) {
        return false;
    }
    try {
        const query = `MATCH (u:User {email: $username}) return u;`;
        const result = await session.run(query, {username: extractedEmail});

        return result.records.length !== 0;
    } catch (error) {
        console.error('Server error Failed to login:', error);
        return false;
    }
}

export async function POST({request}: APIEvent) {
    if (!await isLoggedIn()) {
        return new Response('Unauthorized', {status: 401});
    }
    // Extract the username and password from the request body
    const {username, password} = await request.json();

    try {

        // Query Memgraph for the user with the given username
        const query = `MATCH (u:User {email: $username, password: $password}) return u;`;
        const result = await session.run(query, {username: username, password: password});

        if (result.records.length === 0) {
            return new Response('User not found', {status: 404});
        }

        // User found, now check the password
        const user = result.records[0].get('u');

        // Verify password and generate JWT if valid
        // if (await bcrypt.compare(password, user.properties.password)) {
        const token = jwt.sign({email: user.properties.email}, JWT_SECRET, {expiresIn: '24h'});
        const response = new Response(JSON.stringify({token}), {
            status: 200,
            headers: {'Content-Type': 'application/json'}
        });
        setCookie('token', token);
        return response;
        // } else {
        //     return new Response('Invalid password', { status: 401 });
        // }
    } catch (error) {
        console.error('Server error Failed to login:', error);
        return new Response('Internal Server Error', {status: 500});
    }
}

export function PATCH() {
    // ...
}

export function DELETE() {
    // ...
}
