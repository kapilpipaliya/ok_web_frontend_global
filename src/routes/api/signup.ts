import { APIEvent } from "@solidjs/start/dist/server";
import { Session } from "neo4j-driver";
import { TransactionPromise } from "neo4j-driver-core";
import { getDriver, isIntegerId } from "~/globals/global";
import { getSession } from "~/pages/auth/_server";

export async function POST({ request }: APIEvent) {
    const { username, email, password } = await request.json();
    const session = getDriver('super').session();
    const tx = session.beginTransaction();

    try {
        const checkResultUsername = await tx.run(`MATCH (u:User) WHERE u.username = $username RETURN u;`, { username });
        if (checkResultUsername.records.length > 0) {
            await tx.rollback();
            await session.close();
            return { error: 'Username already exists' };
        }

        const checkResult = await tx.run(`MATCH (u:User) WHERE u.email = $email RETURN u;`, { email: email });
        if (checkResult.records.length > 0) {
            await tx.rollback();
            await session.close();
            return { error: 'Email address already exists' };
        }

        const createUserQuery = `CREATE (u:User {username: $username, email: $email, password: $password}) RETURN u;`;
        const createUserResult = await tx.run(createUserQuery, { username, email, password });

        const user = createUserResult.records[0].get('u');

        let port1, port2, port3;
        try {
            const portResult = await PortConfigure(tx, username);
            port1 = portResult.port1;
            port2 = portResult.port2;
            port3 = portResult.port3;
        } catch (error: any) {
            console.error('DB Setup error:', error.message);
            await tx.rollback();
            await session.close();
            return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        await tx.commit();
        await session.close();

        

        const http_session = await getSession();
        await http_session.update(oldData => ({
            ...oldData,
            // userId: user.id,
            // username: user.username,
            // password: user.password,
            email: user.properties.email
        }));
        const { password: _, ...properties } = user.properties;
        return {
            id: !isIntegerId ? user.identity.toNumber() : user.identity,
            properties,
        }
    } catch (error: any) {
        console.error('Server error:', error.message);
        await tx.rollback();
        await session.close();
        return new Response(error.message, { status: 500 });
    }

}


async function PortConfigure(tx: TransactionPromise, username: string) {
   
    const query = `MATCH (n:DBPort) RETURN n;`;
    const resultPort = await tx.run(query);
    let portsResult: any;
    if (resultPort.records.length === 0) {
        const query = `CREATE (n:DBPort {port1: 1150, port2: 1151, port3: 1152}) RETURN n;`;
        const resultPort = await tx.run(query);
        portsResult = resultPort.records[0].get('n').properties
    } else {
        portsResult = resultPort.records[0].get('n').properties
    }
    let { port1, port2, port3 } = portsResult

    const response = await fetch('http://easyformforge.com:5000/docker/createNew', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        
        body: JSON.stringify({
            Image: 'memgraph/memgraph-platform',
            name: username,
            "portBindings": {[port1]: "7687", [port2]: "7444", [port3]: "3000"},
        })
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        return Promise.reject(new Error(errorMessage || response.statusText));
    }

    const result = await response.json();
    if (result.error) {
        return Promise.reject(new Error(result.error));
    }

   

    let userDriver;
    if (!getDriver(username)) {
        userDriver = getDriver(username, port1);
    }
    const server = await fetch(`http://localhost:3100/loadData/${username}/${port1}`)
    // TODO : sync initial data to drivers[username]
    console.log(`http://localhost:3100/loadData/${username}/${port3}`);

    if (server.status !== 200) {
        console.error('Server error:', server.error);
        return Promise.reject(new Error(server.error));
    }
    port1 = port1 + 10;
    port2 = port2 + 10;
    port3 = port3 + 10;
    const updatePort = `MATCH (n:DBPort) SET n.port1 = ${port1}, n.port2 = ${port2}, n.port3 = ${port3} RETURN n;`;
    await tx.run(updatePort);
    return {port1, port2, port3}
}