import neo4j, { Session } from 'neo4j-driver';

// Main function to initiate the migration process.
export async function syncNodesMGCall(args: any) {
    "use server";
    
    const nodesToTransfer = args.nodesToTransfer;
    const userport = args.userport;
    // Creating Neo4j driver instances for admin and user sessions.
    const admin = neo4j.driver('bolt://localhost:1102', undefined, { disableLosslessIntegers: true });
    const user = neo4j.driver(`bolt://localhost:${userport}`, undefined, { disableLosslessIntegers: true });

    console.log("Starting migration process...");
    const sessionSource = admin.session();
    const sessionTarget = user.session();

    try {
        await transferNodeTypes(sessionSource, sessionTarget, nodesToTransfer);
        return {
            error: false,
            message: 'Migration completed successfully.'
        }
    } catch (error) {
        console.error('Error migrating nodes:', error);
        return {
            error: true,
            message: 'Error migrating nodes.'
        }
    } finally {
        console.log("Closing database sessions...");
        await sessionSource.close();
        await sessionTarget.close();
        console.log("Database sessions closed.");
    }
}

// Function to transfer nodes of specified types.
async function transferNodeTypes(sessionSource: Session, sessionTarget: Session, nodesToTransfer: string[]) {
    for (const nodeType of nodesToTransfer) {
        const readResult = await sessionSource.run(`MATCH (n:${nodeType}) RETURN n;`);
        // console.log(`Retrieved ${readResult.records.length} ${nodeType} nodes from admin database.`);

        for (const record of readResult.records) {
            await transferNode(sessionSource, sessionTarget, record, nodeType);
        }
    }
}

// Function to handle transfer of a single node.
async function transferNode(sessionSource: any, sessionTarget: any, record: { get: (arg0: string) => any; }, nodeType: string) {
    const node = record.get('n');
    const properties = { ...node.properties };
    const existingNode = await findExistingNode(sessionTarget, nodeType, properties.name);

    let createdNode;
    if (existingNode) {
        // console.log(`Node ${properties.name} already exists in target database.`);
        createdNode = await updateNodeProperties(sessionTarget, existingNode, properties);
    } else {
        createdNode = await createNode(sessionTarget, nodeType, properties);
    }

    await addNodeEdges(sessionSource, sessionTarget, nodeType, node, createdNode);

    // console.log("Node successfully transferd or updated.");
}

// Function to update properties of an existing node.
async function updateNodeProperties(session: { run: (arg0: string, arg1: { id: any; props: any; }) => any; }, node: { identity: any; }, properties: any) {
    const result = await session.run(
        `MATCH (n) WHERE id(n) = $id SET n += $props RETURN n;`,
        { id: node.identity, props: properties }
    );
    return result.records[0].get('n');
}

// Function to create a new node.
async function createNode(session: { run: (arg0: string, arg1: { props: any; }) => any; }, nodeType: any, properties: any) {
    const result = await session.run(
        `CREATE (n:${nodeType}) SET n = $props RETURN n;`,
        { props: properties }
    );
    return result.records[0].get('n');
}

// Function to add edges between nodes based on certain conditions.
async function addNodeEdges(sessionSource: Session, sessionTarget: Session, nodeType: string, node: any, createdNode: any) {
    if (nodeType === 'Comp') {
        const superChildrenVertexes = await getChildrenVertex(sessionSource, node.identity, 'CompProp');
        const userChildrenVertexes = await getChildrenVertex(sessionTarget, createdNode.identity, 'CompProp');

        for (const superVertex of superChildrenVertexes.records) {
            const superProperties = { ...superVertex.get('m').properties };
            let isPropertyExist = false;

            for (const childVertex of userChildrenVertexes.records) {
                const userProperties = { ...childVertex.get('m').properties };
                if (superProperties.name === userProperties.name) {
                    const query = `MATCH (a) WHERE id(a) = $compPropNodeId SET a += $props RETURN a;`;
                    await sessionTarget.run(query, { compPropNodeId: childVertex.get('m').identity, props: superProperties });
                    isPropertyExist = true;
                }
            }
            if (!isPropertyExist) {
                const query = `MATCH (a) WHERE id(a) = $compNodeId CREATE (a)-[:CompProp]->(b) SET b = $props RETURN b;`;
                await sessionTarget.run(query, { compNodeId: createdNode.identity, props: superProperties });
            }
        }
    }
}

// Function to retrieve child vertices of a node based on a specific edge type.
const getChildrenVertex = (session: any, id: any, edgeType: any) => {
    return session.run(`MATCH (n)-[r:${edgeType}]->(m) WHERE id(n) = $id RETURN m;`, { id: id });
}

// Function to find an existing node by name.
async function findExistingNode(session: { run: (arg0: string, arg1: { name: any; }) => any; }, nodeType: any, name: any) {
    const result = await session.run(`MATCH (n:${nodeType} {name: $name}) RETURN n;`, { name: name });
    return result.records.length > 0 ? result.records[0].get('n') : null;
}
