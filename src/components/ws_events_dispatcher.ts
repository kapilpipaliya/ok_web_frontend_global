/* Ismael Celis 2010
Simplified WebSocket events dispatcher
*/
// import IsomorphicWs from 'isomorphic-ws'

// import { decode } from '@msgpack/msgpack';

import { createSignal } from "solid-js";
import { atom } from "solid-use";

export const IS_PRODUCTION = process.env.NODE_ENV == "production";

const http_proto = location.protocol;
const domain = window.location.hostname;

const port = location.protocol == "http:" ? (IS_PRODUCTION ? "" : ":8500") : IS_PRODUCTION ? "" : ":8504";
// const port = ''; // ':8500';
const ws_proto = http_proto == "http:" ? "ws" : "wss";

// const BACKEND = process.env.b ? process.env.b : `${domain}${port}`;
const BACKEND = `${domain}${port}`;
export const WS_PATH = `${ws_proto}://${BACKEND}/ws`;
export const SERVER_PATH = `${http_proto}://${BACKEND}`;

export enum BindType {
 Once = 0,
 Permanent = 1
}

/**
 *
 * \todo show internet is connected or not on one place, not at every place.
 * \todo(optional) First ws retry = 0s, second = 2s then 4s..
 */

// same library:
// A WebSocket JavaScript library https://sarus.anephenix.com
// https://github.com/anephenix/sarus
// API: https://www.w3.org/TR/websockets/

// TODO: see https://github.com/titoBouzout/angelia.io
type callBack = (d: any) => void;
export type WSEvent = [string, string, number];

class WSBase {
 private id_ = 0;
 private readonly path: string;
 socket?: WebSocket;
 state = atom(WebSocket.CLOSED);
 // https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine
 private isOnline = window.navigator.onLine;
 private onOpen_: () => void;
 private onClose_: () => void;

 constructor(path: string) {
  this.path = path;
  this.start = this.start.bind(this);
  this.onopen = this.onopen.bind(this);
  this.onOpen_ = this.onOpen_.bind(this);
  this.onclose = this.onclose.bind(this);
  this.onClose_ = this.onClose_.bind(this);
  this.onerror = this.onerror.bind(this);
  this.setOnMessage = this.setOnMessage.bind(this);
  this.destroy = this.destroy.bind(this);
 }

 get uid() {
  return ++this.id_;
 }

 start() {
  if (IS_PRODUCTION) {
   if (window.navigator.onLine) {
    this.socket = this.setupConnection();
   }
   window.addEventListener("online", () => {
    this.isOnline = true;
    this.setupConnection();
   });
   window.addEventListener("offline", () => {
    this.isOnline = false;
   });
  } else {
   this.setupConnection();
  }
 }

 setupConnection() {
  if (this.socket) {
   return;
  }
  this.socket = new WebSocket(this.path, []);
  this.socket.onopen = this.onopen;
  this.socket.addEventListener("open", this.onopen);
  this.socket.onclose = this.onclose;
  this.socket.onerror = e => {
   console.log(e);
  };
  return this.socket;
 }

 setOnMessage(onMessage: (message: MessageEvent) => void) {
  this.socket.onmessage = onMessage;
 }

 destroy() {
  if (this.socket) {
   this.socket.onmessage = null;
   this.socket.onclose = null;
   this.socket.removeEventListener("open", this.onopen);
   this.socket.close();
   this.socket = null;
  }
 }

 private onopen(evt: Event) {
  this.state(WebSocket.OPEN);
  this.onOpen_?.();
 }

 setOnOpen(onOpen: () => void) {
  this.onOpen_ = onOpen;
 }

 private onclose(ev: CloseEvent) {
  this.state(WebSocket.CLOSED);
  const waitMs = 2000;
  if (ev.code !== 1006 && ev.code !== 1001) {
   console.log(ev);
  }
  this.onClose_?.();
  setTimeout(() => {
   if (this.isOnline) {
    this.setupConnection();
   }
  }, waitMs);
 }

 setOnClose(onClose: () => void) {
  this.onClose_ = onClose;
 }

 private onerror(event: Event) {
  console.warn("WebSocket error:", event);
  this.setupConnection();
 }
}

export class ServerEventsDispatcher extends WSBase {
 callbacks: Record<string, any> = { open: [], close: [], error: [] };
 lm_handle: ReturnType<typeof window.setTimeout>;
 isFirstTriggers: boolean;
 firstPayload: Array<[WSEvent, any]>;
 firstCancelTimeout: number;
 constructor(path: string) {
  super(path);
  this.callbacks = {};
  this.firstCancelTimeout = 0;
  this.onmessage = this.onmessage.bind(this);
  this.setOnMessage(this.onmessage);
  this.isFirstTriggers = false;
  this.firstPayload = [];
  this.lm_handle = setTimeout(_ => 0, 0);
  this.setOnOpen(this.onOpen.bind(this));
  this.setOnClose(this.onClose.bind(this));

  this.bind = this.bind.bind(this);
  this.unbind = this.unbind.bind(this);
  this.trigger = this.trigger.bind(this);
  this.dispatch = this.dispatch.bind(this);
  this.delay_send = this.delay_send.bind(this);
  this.heartbeat = this.heartbeat.bind(this);
  this.start();
 }

 onOpen() {
  clearTimeout(this.lm_handle);
  this.isFirstTriggers = true;
  this.heartbeat();
  this.firstCancelTimeout = window.setTimeout(this.delay_send, 50);
  // if (token) {
  //   this.sendMessage('authentication_challenge', {token});
  // }
  this.dispatch(["open", "", 0], []);
 }

 onClose() {
  clearTimeout(this.lm_handle);
  // this.dispatch(['close', '', 0], []);
 }

 heartbeat() {
  // this.trigger(['heartbeat', Date.now()]);
  this.lm_handle = setTimeout(this.heartbeat, 30 * 1000);
 }

 bind(event: WSEvent, callback: callBack, handleMultiple = BindType.Permanent) {
  this.callbacks[JSON.stringify(event)] = this.callbacks[JSON.stringify(event)] ?? [];
  this.callbacks[JSON.stringify(event)].push([handleMultiple, callback]);
  return this;
 }

 unbind(event: WSEvent) {
  this.callbacks[JSON.stringify(event)] = undefined;
  return this;
 }

 private delay_send() {
  if (this.firstPayload.length) {
   if (this.socket) {
    this.socket.send(JSON.stringify(this.firstPayload));
    this.firstPayload = [];
   } else {
    return;
   }
  }
  this.isFirstTriggers = false;
 }

 trigger(payload: Array<[WSEvent, any]>) {
  if (!this.socket) {
   this.firstPayload.push(...payload);
  } else {
   switch (this.socket.readyState) {
    case WebSocket.CONNECTING:
     this.firstPayload.push(...payload);
     return;
    case WebSocket.OPEN:
     if (this.isFirstTriggers) {
      for (let i = 0; i < payload.length; i++) {
       this.firstPayload.push(payload[i]);
      }
      clearTimeout(this.firstCancelTimeout);
      this.firstCancelTimeout = window.setTimeout(this.delay_send, 50);
     } else {
      this.socket.send(JSON.stringify(payload)); // <= send JSON data to socket server
     }
     return;
    case WebSocket.CLOSING:
    case WebSocket.CLOSED:
     this.firstPayload.push(...payload);
     return;
    default:
     return;
   }
  }
 }

 private stringHandle(data: [[WSEvent, Array<any>]]) {
  if (!Array.isArray(data)) {
   console.warn("return data must be an array.", data);
  } else {
   try {
    for (let i = 0; i < data.length; i++) {
     const e = data[i];
     if (!Array.isArray(e) || e.length < 2) {
      console.warn("event array should have >= 2 elements, got: ", e);
     }
     const event = e[0];
     const message = e.splice(1);
     this.dispatch(event, message);
    }
   } catch (error) {
    console.warn("error: ", error);
    console.warn(data);
   }
  }
 }

 private async onmessage(evt: MessageEvent) {
  if (typeof evt.data === "string") {
   const data = JSON.parse(evt.data);
   this.stringHandle(data);
  }
  // if(evt.data instanceof ArrayBuffer ){
  else {
   const blob = evt.data;
   const buffer = await blob.arrayBuffer();
   /// /const data = decode(buffer);
   /// /this.stringHandle(data);
   // console.log('Received arraybuffer')
   // this.dispatch(this.event, buffer) // uncomment
  }
  // if(evt.data instanceof Blob ){
  //   const buffer = event.data;
  //   console.log("Received arraybuffer");
  //   this.dispatch(this.event_name, buffer)
  // }
 }

 private dispatch(event: WSEvent, message: Array<{}>) {
  const chain = this.callbacks[JSON.stringify(event)];
  if (typeof chain === "undefined") {
   console.warn("no callbacks for this event: ", event);
  } else {
   const { length } = chain;
   for (let i = 0; i < length; i++) {
    chain[i][1](...message);
    if (chain[i][0] == 0) {
     this.callbacks[JSON.stringify(event)] = undefined;
    }
   }
  }
 }
}

export const Ws = new ServerEventsDispatcher(WS_PATH);

// read more: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
export function saveCookie(name: string, value: string, max_age: number) {
 document.cookie = `${name}=${value}; path=/; max-age=${max_age}`;
}

export function clearCookie(d) {
 document.cookie = `time=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

// Ws.bind$([ET[ET.get], "cookie_event", 0], saveCookies, 1);
//
// function saveCookies(data: { max_age: number; cookie: { jwt: string } }) {
//  Object.keys(data.cookie).forEach(key => {
//   saveCookie(key, data.cookie[key] as string, data.max_age);
//  });
// }

// export const [getIsLoggedIn, setIsLoggedIn] = createSignal(null);
// Ws.bind$([ET[ET.get], "is_logged_in", 0], isLoggedIn, 1);
