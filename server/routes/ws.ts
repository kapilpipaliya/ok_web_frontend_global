import { defineWebSocketHandler } from "nitro";

export default defineWebSocketHandler({
  open(peer) {
    console.log("[WS] WebSocket opened:", peer.id);
    peer.send("Welcome! Connection established.");
  },
  message(peer, msg) {
    const message = msg.text();
    console.log("[WS] Received message from", peer.id, ":", message);

    const response = `Echo: ${message}`;
    console.log("[WS] Sending response:", response);
    peer.send(response);

    peer.publish("chat-room", message);
  },
  close(peer, details) {
    console.log("[WS] WebSocket closed:", peer.id, details);
  },
  error(peer, error) {
    console.error("[WS] WebSocket error:", peer.id, error);
  },
});
