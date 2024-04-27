import {isIntegerId, driver} from "~/globals/global";
import {APIEvent} from "@solidjs/start/dist/server";
import {getSession} from "~/pages/auth/_server";

export async function POST({request}: APIEvent) {
    const {email, password} = await request.json();

    try {
        const session = driver.session();

        const query = `MATCH (u:User {email: $email, password: $password}) return u;`;
        const result = await session.run(query, {email: email, password: password});

        if (result.records.length === 0) {
            return {error: "Not Authorized !"};
        }

        // TODO: User found, now check the password

        const user = result.records[0].get('u');

        const http_session = await getSession();
        await http_session.update(oldData => ({
            ...oldData,
            // userId: user.id,
            // username: user.username,
            // password: user.password,
            email: user.properties.email
        }));
        const {password: _, ...properties} = user.properties;
        return {
            id: !isIntegerId ? user.identity.toNumber() : user.identity,
            properties,
        }
    } catch (error) {
        console.error('Server error Failed to login:', error);
        return new Response('Internal Server Error', {status: 500});
    }
}
