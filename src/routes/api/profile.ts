import {APIEvent} from "@solidjs/start/dist/server";
import {driver, isIntegerId} from "~/globals/global";
import {getSession} from "~/pages/auth/_server";

export async function POST({request}: APIEvent) {
    const {email, username, country, userId} = await request.json();

    try {
        const session = driver.session();

        // Check if user not exists
        const userExists = await session.run(`MATCH (u:User) WHERE id(u) = $userId RETURN u;`, {userId: userId});
        if (userExists.records.length === 0) {
            await session.close();
            return {error: 'User not exists'};
        }

        // Check if email already exists
        if (email) {
            const checkResult = await session.run(`MATCH (u:User) WHERE u.email = $email RETURN u`, {email: email});
            if (checkResult.records.length > 0) {
                await session.close();
                return {error: 'Email address already exists'};
            }
        }

        // Check if username already exists
        if (username) {
            const checkResult = await session.run(`MATCH (u:User) WHERE u.username = $username RETURN u`, {username: username});
            if (checkResult.records.length > 0) {
                await session.close();
                return {error: 'Username already exists'};
            }
        }

        let query = `MATCH (u:User) WHERE id(u) = $userId`;

        const parameters = {
            userId: userId
        };

        if (email) {
            if (query.includes('SET')) {
                query += ', u.email = $email'; // Add a comma to separate multiple SET clauses
            } else {
                query += ' SET u.email = $email';
            }
            parameters.email = email;
        }

        if (username) {
            if (query.includes('SET')) {
                query += ', u.username = $username'; // Add a comma to separate multiple SET clauses
            } else {
                query += ' SET u.username = $username';
            }
            parameters.username = username;
        }

        query += ' RETURN u;';
        console.log("query", query,parameters)
        const result = await session.run(query, parameters);
        await session.close();
        if (result.records.length === 0) {
            throw new Error('No user found with the specified ID.');
        }
        const user = result.records[0].get('u');
        const {password: _, ...properties} = user.properties;

        return {
            message: 'Profile updated successfully',
            id: !isIntegerId ? user.identity.toNumber() : user.identity,
            properties,
        };
    } catch (error) {
        console.log("Error",error.stack)
        return new Response('Internal Server Error', {status: 500});
    }
}
