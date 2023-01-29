/* Ismael Celis 2010
Simplified WebSocket events dispatcher
*/
// import IsomorphicWs from 'isomorphic-ws'

// import { decode } from '@msgpack/msgpack';

/*
usage:
for $ prefix use always check if(mounted) first.
*/
/**
 *
 * Ws Event Dispatcher class:
 * 1. keep constant open connection to the backend server.
 * component can bind and unbind function for the events
 * keep event identifier different to not call same event's different binded functions.
 * \todo show internet is connected or not on one place, not at every place.
 * \todo(optional) First ws retry = 0s, second = 2s then 4s..
 */

// same library:
// A WebSocket JavaScript library https://sarus.anephenix.com
// https://github.com/anephenix/sarus
// API: https://www.w3.org/TR/websockets/
type CallBack = (d: unknown) => void;
export type WSEvent = Array<number | string>;
export type WsSingleEvent = [WSEvent, unknown];

export class ServerEventsDispatcher {
  path: string;
  req: {};
  res: {};
  callbacks: Map<string, Array<CallBack>>;
  isFirst: boolean;
  firstCancelTimeout: number;
  firstPayload: WsSingleEvent[];
  conn?: WebSocket;
  lmHandle: number;
  statusChangeCallback: (status: boolean) => void;
  private id = 0;
  // https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine
  private isOnline = window.navigator.onLine;

  constructor(path: string, statusChangeCallback: (status: boolean) => void, isProd = false) {
    this.path = path;

    this.callbacks = new Map<string, Array<CallBack>>();
    this.isFirst = false;
    this.firstCancelTimeout = 0;
    this.firstPayload = [];
    this.lmHandle = 0;
    this.statusChangeCallback = statusChangeCallback;

    this.bind = this.bind.bind(this);
    this.bind$ = this.bind$.bind(this);
    this.bindT = this.bindT.bind(this);
    // this.bind_F = this.bind_F.bind(this)
    this.unbind = this.unbind.bind(this);
    this.unbindEvent = this.unbindEvent.bind(this);
    this.trigger = this.trigger.bind(this);
    // this.triggerFile = this.triggerFile.bind(this)
    this.onmessage = this.onmessage.bind(this);
    this.onclose = this.onclose.bind(this);
    this.onopen = this.onopen.bind(this);
    this.onerror = this.onerror.bind(this);
    this.dispatch = this.dispatch.bind(this);
    this.batchBind = this.batchBind.bind(this);
    this.batchBindT = this.batchBindT.bind(this);
    this.delaySend = this.delaySend.bind(this);
    this.heartbeat = this.heartbeat.bind(this);

    if (isProd) {
      if (window.navigator.onLine) {
        this.conn = this.setupConnection();
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

  get uid() {
    return ++this.id;
  }

  setupConnection() {
    // if (this.conn) {
    //   return;
    // }
    this.conn = new WebSocket(this.path, []);
    // dispatch to the right handlers
    this.conn.onmessage = this.onmessage;
    this.conn.onclose = this.onclose;
    // this.conn.onopen = this.onopen;
    this.conn.addEventListener("open", this.onopen);
    this.conn.onerror = (e) => {
      // console.log(e);
    };
    return this.conn;
  }

  heartbeat() {
    // console.log("heartbeat send");
    // this.trigger(['heartbeat', Date.now()]);
    this.lmHandle = window.setTimeout(this.heartbeat, 30 * 1000);
  }

  destroy() {
    if (this.conn) {
      this.conn.onmessage = null;
      this.conn.onclose = null;
      this.conn.removeEventListener("open", this.onopen);
      this.conn.close();
    }
  }

  bind(event: WSEvent, callback: CallBack, handleMultiple = 0, data = []) {
    this.callbacks[JSON.stringify(event)] = this.callbacks[JSON.stringify(event)] ?? [];
    this.callbacks[JSON.stringify(event)].push([handleMultiple, callback, data]); // 0 means unsubscribe using first time
    return this;
  }

  batchBind(events: Array<[WSEvent, CallBack, any]> = []) {
    const payload = [];
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      this.bind(e[0], e[1]);
      payload.push([e[0], e[2]]);
    }
    return payload;
  }

  batchBindT(events: Array<[WSEvent, CallBack, any]> = []) {
    const payload = this.batchBind(events);
    this.trigger(payload);
    return this;
  }

  bind$(event: WSEvent, callback: CallBack, handleMultiple = 0, data = []) {
    this.unbind(event);
    this.bind(event, callback, handleMultiple, data);
    return () => this.unbind(event);
  }

  bindT(event: WSEvent, callback: CallBack, data, handleMultiple = 0) {
    this.bind$(event, callback, handleMultiple, data);
    this.trigger([[event, data]]);
    return () => this.unbind(event);
  }

  unbind(event: WSEvent) {
    this.callbacks[JSON.stringify(event)] = [];
  }

  unbindEvent(eventNames: Array<WSEvent> = []) {
    eventNames.map((event) => this.unbind(event));
    return this;
  }

  trigger(payload: WsSingleEvent[]) {
    const f = this.trigger;
    if (!this.conn) {
      this.firstPayload.push(...payload);
    } else {
      switch (this.conn.readyState) {
        case WebSocket.CONNECTING:
          // code block
          // This will added to onopen list, take care
          // this.conn.addEventListener('open', () => {
          // f(payload)
          this.firstPayload.push(...payload);
          // })
          return this;
        case WebSocket.OPEN:
          if (this.isFirst) {
            for (let i = 0; i < payload.length; i++) {
              this.firstPayload.push(payload[i]);
            }
            clearTimeout(this.firstCancelTimeout);
            this.firstCancelTimeout = window.setTimeout(this.delaySend, 50);
          } else {
            this.conn.send(JSON.stringify(payload)); // <= send JSON data to socket server
          }
          return this;
        case WebSocket.CLOSING:
        case WebSocket.CLOSED:
          // try to reconnect/logout
          this.setupConnection();
          // this.conn.addEventListener('open', () => {
          this.firstPayload.push(...payload);
          // f(payload)
          // })
          return this;
        default:
          return this;
        // code block
      }
    }
  }

  private delaySend() {
    if (this.firstPayload.length) {
      // VM421 main.aaf1bd3bb…936a.bundle.js:5658 Uncaught DOMException: Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.
      this.conn && this.conn.send(JSON.stringify(this.firstPayload));
      this.firstPayload = [];
    }
    this.isFirst = false;
  }

  private onopen(evt: Event) {
    clearTimeout(this.lmHandle);
    this.statusChangeCallback(true);
    this.isFirst = true;
    this.firstCancelTimeout = window.setTimeout(this.delaySend, 50);
    this.dispatch(["open", "", 0], []);
    this.heartbeat();
  }

  private onclose(ev: CloseEvent) {
    clearTimeout(this.lmHandle);
    this.statusChangeCallback(false); // this.dispatch(['close', '', 0], []);
    const waitMs = 2000;
    // console.log(`close ${ev.code}, trying to reconnect ${new Date().toISOString()}... (waiting ${waitMs}ms)`);
    if (ev.code !== 1006 && ev.code !== 1001) {
      console.log(ev);
    }
    setTimeout(() => {
      if (this.isOnline) {
        this.setupConnection();
      }
    }, waitMs);
    // on reconnection all subscribtion needs to resubscribe.
  }

  private onerror(event: Event) {
    console.warn("WebSocket error:", event);
    // todo depend on error try to reconnect
    this.dispatch(["error", "", 0], []);
  }

  private stringHandle(data: [[[number, number, string], Array<{}>]]) {
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
          this.callbacks[JSON.stringify(event)] = [];
        }
      }
    }
  }
}
