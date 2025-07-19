import { exec } from "child_process";
import { promisify } from "util";
import type { APIEvent } from "@solidjs/start/server";

const execAsync = promisify(exec);

export async function POST(event: APIEvent) {
  try {
    // Get authorization token from headers
    const authToken = event.request.headers.get("Authorization");
    
    // Simple token-based authentication
    // You should change this token to something secure
    const RESTART_TOKEN = process.env.RESTART_TOKEN || "your-secure-token-here";
    
    if (authToken !== `Bearer ${RESTART_TOKEN}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Execute the restart script
    const scriptPath = `${process.env.HOME || "/home/ubuntu"}/ok_web_frontend_global/restart-server.sh`;
    
    // Run the script asynchronously and return immediately
    exec(scriptPath, (error, stdout, stderr) => {
      if (error) {
        console.error("Restart script error:", error);
      }
      console.log("Restart script output:", stdout);
      if (stderr) {
        console.error("Restart script stderr:", stderr);
      }
    });

    return new Response(JSON.stringify({ 
      message: "Restart initiated",
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Restart endpoint error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}