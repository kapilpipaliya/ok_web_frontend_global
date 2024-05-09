
// For executing child processes
import { exec } from 'child_process';

import fetch from 'node-fetch';
// For HTTP agents
import { Agent } from 'http';

// Docker API Reference: https://docs.docker.com/engine/api/v1.24/

const AUTH_TOKEN = 'your_secret_super'; // Replace with your actual secret token

interface Container {
    id: string;
    name: string;
    status: string;
    image: string;
    age: string;
    ports: Array<{ PrivatePort: number; PublicPort: number; Type: string }>;
}

export function listDockerContainers(): Promise<Container[]>  {
    return new Promise((resolve, reject) => {
        exec('curl --unix-socket /var/run/docker.sock http://localhost/containers/json?all=true', (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const containers = JSON.parse(stdout);
                    const containerList = containers.map((container: any) => ({
                        id: container.Id,
                        name: container.Names[0], // Assuming you want the first name
                        status: container.State,
                        image: container.Image,
                        age: container.Status,
                        ports: container.Ports,
                    }));
                    resolve(containerList);
                } catch (parseErr) {
                    reject(parseErr);
                }
            }
        });
    });
}
type Callback<T> = (error: Error | null, result?: T) => void;

function startDockerContainer(containerId: string, callback: Callback<string>) {
    exec(`curl --unix-socket /var/run/docker.sock -X POST http://localhost/containers/${containerId}/start`, (err, stdout, stderr) => {
        if (err) {
            return callback(err);
        } else {
            return callback(null, `Docker container ${containerId} started successfully`);
        }
    });
}

// Custom agent for Unix socket
const socketPath = '/var/run/docker.sock';
const agent = new Agent({ socketPath });


function pullImageFromRegistry(imageName: string, callback: Callback<string>) {
    try {
        exec(`curl --unix-socket /var/run/docker.sock -X POST http://localhost/images/create?fromImage=${imageName} --max-time 20`, (err, stdout, stderr) => {
            if (err) {
                return callback(err);
            } else {
                const response = stdout;
                if (response.includes("pull access denied for")) {
                    return callback(null, `Pull access denied for Docker image ${imageName} ,please provide correct  repository `);
                }
                else {
                    return callback(null, `Docker image ${imageName} pulled successfully ,please click create button to create container`);
                }
            }
        });
    } catch (error) {
        console.error('Error pulling image:', error);
    }
}

function stopDockerContainer(containerId: string, callback: Callback<string>) {
    exec(`curl --unix-socket /var/run/docker.sock -X POST http://localhost/containers/${containerId}/stop`, (err, stdout, stderr) => {
        if (err) {
            return callback(err);
        } else {
            return callback(null, `Docker container ${containerId} stopped successfully`);
        }
    });
}

function removeDockerContainer(containerId: string, callback: Callback<string>) {
    exec(`curl --unix-socket /var/run/docker.sock -X DELETE http://localhost/containers/${containerId}`, (err, stdout, stderr) => {
        if (err) {
            return callback(err);
        } else {
            return callback(null, `Docker container ${containerId} removed successfully`);
        }
    });
}
interface PortBindings {
    [port: string]: string;
}


export async function createDockerContainer(Image: string, name: string, portBindings: PortBindings) {

    if (!Image) {
        throw Error('Image name is required');
    }

    // Preparing PortBindings for Docker
    const hostConfig: any = {};
    // For documentation purpose only
    let ExposedPorts: any = {};
    if (portBindings) {
        const formattedPortBindings: any = {};
        for (const [externalPort, internalPort] of Object.entries(portBindings)) {
            formattedPortBindings[`${internalPort}/tcp`] = [{ "HostIp": "localhost", HostPort: externalPort }];
            ExposedPorts[`${internalPort}/tcp`] = {}
        }
        hostConfig.PortBindings = formattedPortBindings;

    }

    const url = `http://localhost/containers/create?name=${name}`;
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Image, HostConfig: hostConfig, ExposedPorts }),
        agent
    };
    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            return Error(data.message || 'Failed to create container');
        }
        const { Id: containerId } = data;

        startDockerContainer(containerId, (err, message) => {
            if (err) {
                console.error(err);
                throw Error(err.message); 
            } else {
                return { message };
            }
        });
        return {data};
    } catch (error: any) {
        throw Error(error.message,{}); 
    }
}
/*
app.get('/docker/list', authorize, (req, res) => {
    listDockerContainers((err, containerList) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(containerList);
        }
    });
});

app.post('/docker/start/:containerId', authorize, (req, res) => {
    const { containerId } = req.params;

    if (!containerId) {
        return res.status(400).json({ error: 'Invalid request. Missing containerId.' });
    }

    startDockerContainer(containerId, (err, message) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ message });
        }
    });
});

app.post('/docker/createNew', authorize, async (req, res) => {
   
});

app.post('/docker/pull', authorize, (req, res) => {
    const { imageName } = req.body;

    if (!imageName) {
        return res.status(400).json({ error: 'Invalid request. Missing imageName.' });
    }

    pullImageFromRegistry(imageName, (err, message) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ message });
        }
    });
});

app.post('/docker/stop/:containerId', authorize, (req, res) => {
    const { containerId } = req.params;

    if (!containerId) {
        return res.status(400).json({ error: 'Invalid request. Missing containerId.' });
    }

    stopDockerContainer(containerId, (err, message) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ message });
        }
    });
});

app.delete('/docker/remove/:containerId', authorize, (req, res) => {
    const { containerId } = req.params;

    if (!containerId) {
        return res.status(400).json({ error: 'Invalid request. Missing containerId.' });
    }

    removeDockerContainer(containerId, (err, message) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ message });
        }
    });
});
*/