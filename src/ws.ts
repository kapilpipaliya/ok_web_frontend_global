import { eventHandler } from 'vinxi/http';

export default eventHandler({
  handler() {
    console.log('[WS] HTTP handler called');
  },
  websocket: {
    async open(peer: any) {
      console.log('[WS] WebSocket opened:', peer.id, peer.url);
      peer.send('Welcome! Connection established.');
    },
    async message(peer: any, msg: any) {
      const message = msg.text();
      console.log('[WS] Received message from', peer.id, ':', message);

      // Echo back the message
      const response = `Echo: ${message}`;
      console.log('[WS] Sending response:', response);
      peer.send(response);

      // Broadcast to all connected clients in the room
      peer.publish('chat-room', message);
    },
    async close(peer: any, details: any) {
      console.log('[WS] WebSocket closed:', peer.id, details);
    },
    async error(peer: any, error: any) {
      console.error('[WS] WebSocket error:', peer.id, error);
    },
  },
});