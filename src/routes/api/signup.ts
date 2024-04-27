import {APIEvent} from "@solidjs/start/dist/server";
import {isIntegerId,  driver} from "~/globals/global";

export async function POST({request}: APIEvent) {
    // if (!await isLoggedIn()) {
    //     return new Response('Unauthorized', {status: 401});
    // }
    // Extract the username and password from the request body
    const {username, email, password} = await request.json();
    const session = driver.session();

    try {

        const checkResult = await session.run(`MATCH (u:User) WHERE u.email = $email RETURN u`, {email: email});
        if (checkResult.records.length > 0) {
            await session.close();
            return {error: 'User already exists'};
        }

        // Query Memgraph for the user with the given username
        const query = `CREATE (u:User {username: $username, email: $email,password:$password}) RETURN u;`;
        const result = await session.run(query, {username: username, email: email, password: password});
        await session.close();

        // User found, now check the password
        const user = result.records[0].get('u');
        return {
            id: !isIntegerId ? user.identity.toNumber() : user.identity,
            properties: user.properties
        }
    } catch (error) {
        console.error('Server error Failed to login:', error);
        return new Response('Internal Server Error', {status: 500});
    }
}
