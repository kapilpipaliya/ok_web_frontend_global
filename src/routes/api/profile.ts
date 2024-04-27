import {APIEvent} from "@solidjs/start/dist/server";
import {driver, isIntegerId} from "~/globals/global";
import {getSession} from "~/pages/auth/_server";

export async function POST({request}: APIEvent) {
    const {email, username, country,userId} = await request.json();

    try {
        const session = driver.session();

        const checkResult = await session.run(`MATCH (u:User) WHERE u.email = $email RETURN u`, {email: email});
        if (checkResult.records.length > 0) {
            await session.close();
            return {error: 'Email address already exists'};
        }

        const query = `MATCH (u:User) WHERE id(u) = $userId SET u.username = $username, u.email = $email RETURN u;`;
        const result = await session.run(query, {email: email, username: username, userId: userId});

        await session.close();
        if (result.records.length === 0) {
            throw new Error('No user found with the specified ID.');
        }
        const user = result.records[0].get('u');
        const { password: _, ...properties } = user.properties;

        return {
            message: 'Profile updated successfully',
            id: !isIntegerId ? user.identity.toNumber() : user.identity,
            properties,
        };
    } catch (error) {
        console.error('Server error Failed to login:', error);
        return new Response('Internal Server Error', {status: 500});
    }
}
