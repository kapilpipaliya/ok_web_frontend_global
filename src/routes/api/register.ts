import {driver, neo4jSession} from "~/globals/global";
import {APIEvent} from "@solidjs/start/dist/server";
import {getSession} from "~/pages/auth/_server";

export async function POST({request}: APIEvent) {
    console.log('Start')
    const {username, password} = await request.json();
    try {
    const neo4jSession = driver.session();
        // const existingUser = await db.user.findUnique({ where: { username } });
        // if (existingUser) throw new Error("User already exists");
        // return db.user.create({
        //     data: { username: username, password }
        // });

        const query = `CREATE (u:User {email: $username, password: $password}) return u;`;
        const result = await neo4jSession.run(query, {username: username, password: password});

        if (result.records.length === 0) {
            return new Response('User can not created', {status: 404});
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
    } catch (error) {
        console.error('Server error Failed to register:', error);
        return new Response('Internal Server Error', {status: 500});
    } finally {
        await neo4jSession.close();
    }
    console.log('ens')
}
