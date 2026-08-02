import { defineWebSocketHandler } from "h3";

export default defineWebSocketHandler({
  async open(peer) {
    console.log("[WS] WebSocket opened:", peer.id, peer.url);
    peer.send("Welcome! Connection established.");
  },
  async message(peer, msg) {
    const message = msg.text();
    console.log("[WS] Received message from", peer.id, ":", message);

    // Echo back the message
    const response = `Echo: ${message}`;
    console.log("[WS] Sending response:", response);
    peer.send(response);

    // Broadcast to all connected clients in the room
    peer.publish("chat-room", message);
  },
  async close(peer, details) {
    console.log("[WS] WebSocket closed:", peer.id, details);
  },
  async error(peer, error) {
    console.error("[WS] WebSocket error:", peer.id, error);
  },
});
