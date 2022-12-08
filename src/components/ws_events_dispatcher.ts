/* Ismael Celis 2010
Simplified WebSocket events dispatcher
*/
// import IsomorphicWs from 'isomorphic-ws'

// import { decode } from '@msgpack/msgpack';
import { map } from 'ramda';
import { createSignal } from 'solid-js';
import { ET, FailOrSuccessResult, IS_PRODUCTION } from './enums';
// import { NavigateWsBind } from './components/UI/Navigate';

const http_proto = location.protocol;
const domain = window.location.hostname;

const port = location.protocol == 'http:' ? (IS_PRODUCTION ? '' : ':8500') : IS_PRODUCTION ? '' : ':8504';
// const port = ''; // ':8500';
const ws_proto = http_proto == 'http:' ? 'ws' : 'wss';

// const BACKEND = process.env.b ? process.env.b : `${domain}${port}`;
const BACKEND = `${domain}${port}`;
export const WS_PATH = `${ws_proto}://${BACKEND}/ws`;
export const SERVER_PATH = `${http_proto}://${BACKEND}`;

const [getWsConnected, setWsConnected] = createSignal(IS_PRODUCTION);
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

// TODO: see https://github.com/titoBouzout/angelia.io
type callBack = (d: any) => void;
export type WSEvent = Array<number | string>;
export class ServerEventsDispatcher {
  private id_ = 0;

  // https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine
  private isOnline = window.navigator.onLine;

  path: string;

  req: {};

  res: {};

  callbacks: Record<string, any>;

  isFirst: boolean;

  firstCancelTimeout: number;

  firstPayload: Array<[]>;

  conn?: WebSocket;

  lm_handle: ReturnType<typeof window.setTimeout>;

  constructor(path: string, req: {}, res: {}) {
    this.path = path;
    this.req = req;
    this.res = res;
    this.callbacks = {};
    this.isFirst = false;
    this.firstCancelTimeout = 0;
    this.firstPayload = [];
    this.lm_handle = setTimeout(_ => 0, 0);

    this.bind = this.bind.bind(this);
    this.bind$ = this.bind$.bind(this);
    this.bindT = this.bindT.bind(this);
    // this.bind_F = this.bind_F.bind(this)
    this.unbind = this.unbind.bind(this);
    this.unbind_ = this.unbind_.bind(this);
    this.trigger = this.trigger.bind(this);
    // this.triggerFile = this.triggerFile.bind(this)
    this.onmessage = this.onmessage.bind(this);
    this.onclose = this.onclose.bind(this);
    this.onopen = this.onopen.bind(this);
    this.onerror = this.onerror.bind(this);
    this.dispatch = this.dispatch.bind(this);
    this.batchBind = this.batchBind.bind(this);
    this.batchBindT = this.batchBindT.bind(this);
    this.delay_send = this.delay_send.bind(this);
    this.heartbeat = this.heartbeat.bind(this);

    if (IS_PRODUCTION) {
      if (window.navigator.onLine) {
        this.conn = this.setupConnection();
      }
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.setupConnection();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    } else {
      this.setupConnection();
    }
  }

  get uid() {
    return ++this.id_;
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
    this.conn.addEventListener('open', this.onopen);
    this.conn.onerror = e => {
      // console.log(e);
    };
    return this.conn;
  }

  heartbeat() {
    // console.log("heartbeat send");
    // this.trigger(['heartbeat', Date.now()]);
    this.lm_handle = setTimeout(this.heartbeat, 30 * 1000);
  }

  destroy() {
    if (this.conn) {
      this.conn.onmessage = null;
      this.conn.onclose = null;
      this.conn.removeEventListener('open', this.onopen);
      this.conn.close();
    }
  }

  bind(event: WSEvent, callback: callBack, handleMultiple = 0, data = []) {
    this.callbacks[JSON.stringify(event)] = this.callbacks[JSON.stringify(event)] ?? [];
    this.callbacks[JSON.stringify(event)].push([handleMultiple, callback, data]); // 0 means unsubscribe using first time
    return this;
  }

  batchBind(events: Array<[WSEvent, callBack, any]> = []) {
    const payload = [];
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      this.bind(e[0], e[1]);
      payload.push([e[0], e[2]]);
    }
    return payload;
  }

  batchBindT(events: Array<[WSEvent, callBack, any]> = []) {
    const payload = this.batchBind(events);
    this.trigger(payload);
    return this;
  }

  bind$(event: WSEvent, callback: callBack, handleMultiple = 0, data = []) {
    this.unbind(event);
    this.bind(event, callback, handleMultiple, data);
    return () => this.unbind(event);
  }

  bindT(event: WSEvent, callback: callBack, data, handleMultiple = 0) {
    this.bind$(event, callback, handleMultiple, data);
    this.trigger([[event, data]]);
    return () => this.unbind(event);
  }

  unbind(event: WSEvent) {
    this.callbacks[JSON.stringify(event)] = [];
  }

  unbind_(event_names: Array<WSEvent> = []) {
    map((event: WSEvent) => {
      this.unbind(event);
    }, event_names);
    return this;
  }

  private delay_send() {
    if (this.firstPayload.length) {
      // VM421 main.aaf1bd3bb…936a.bundle.js:5658 Uncaught DOMException: Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.
      this.conn && this.conn.send(JSON.stringify(this.firstPayload));
      this.firstPayload = [];
    }
    this.isFirst = false;
  }

  private onopen(evt: Event) {
    clearTimeout(this.lm_handle);
    setWsConnected(true);
    this.isFirst = true;
    // console.log(this.conn.extensions);
    // console.log("Server Opened")
    this.firstCancelTimeout = window.setTimeout(this.delay_send, 50);
    // if (token) {
    //   this.sendMessage('authentication_challenge', {token});
    // }
    this.dispatch(['open', '', 0], []);
    // const length = this.callbacks.length;
    //   for (let i = 0; i < length; i++) {
    //     chain[i][1](...message)
    //     if (chain[i][0] == 0) {
    //       this.callbacks[JSON.stringify(event)] = []
    //     }
    //   }
    this.heartbeat();
  }

  private onclose(ev: CloseEvent) {
    clearTimeout(this.lm_handle);
    setWsConnected(false); // this.dispatch(['close', '', 0], []);
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
    console.warn('WebSocket error:', event);
    // todo depend on error try to reconnect
    this.dispatch(['error', '', 0], []);
  }

  trigger(payload: Array<any[]>) {
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
            this.firstCancelTimeout = window.setTimeout(this.delay_send, 50);
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

  private stringHandle(data: [[[number, number, string], Array<{}>]]) {
    if (!Array.isArray(data)) {
      console.warn('return data must be an array.', data);
    } else {
      try {
        for (let i = 0; i < data.length; i++) {
          const e = data[i];
          if (!Array.isArray(e) || e.length < 2) {
            console.warn('event array should have >= 2 elements, got: ', e);
          }
          const event = e[0];
          const message = e.splice(1);
          this.dispatch(event, message);
        }
      } catch (error) {
        console.warn('error: ', error);
        console.warn(data);
      }
    }
  }

  private async onmessage(evt: MessageEvent) {
    if (typeof evt.data === 'string') {
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
    if (typeof chain === 'undefined') {
      console.warn('no callbacks for this event: ', event);
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

export const Ws = new ServerEventsDispatcher(WS_PATH, {}, {});

// read more: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
export function saveCookie(name: string, value: string, max_age: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${max_age}`;
}
export function clearCookie(d) {
  document.cookie = `time=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

Ws.bind$([ET[ET.get], 'cookie_event', 0], saveCookies, 1);
function saveCookies(data: { max_age: number; cookie: { jwt: string } }) {
  Object.keys(data.cookie).forEach(key => {
    saveCookie(key, data.cookie[key] as string, data.max_age);
  });
}
export const [getIsLoggedIn, setIsLoggedIn] = createSignal(null);
Ws.bind$([ET[ET.get], 'is_logged_in', 0], isLoggedIn, 1);
function isLoggedIn(data: FailOrSuccessResult) {
  setIsLoggedIn(!data.error);
}
export const [getMember, setMember] = createSignal({ email: '' });
Ws.bind$(
  [ET[ET.get], 'current_member_event', 0],
  function (data: { _key: string; email: string; first_name?: string; last_name?: string }) {
    setMember(data);
  },
  1,
);
export const [getMemberSeting, setMemberSeting] = createSignal({});
/* todo: when logout every pages should be redirect to login page. */
/*
export function titleChange() {
  const [title, setTitle] = createSignal('');

  createEffect(() => {
    // Update the document title using the browser API
    document.title = `${title} | O-K.tech`;
  });

  return setTitle;
}
*/
// NavigateWsBind(); // As a component
Ws.bind$(
  [ET[ET.get], 'maintenance_event', 0],
  function (data: boolean) {
    // maintenance = data; // fix this server is going down for sheduled maintenance
  },
  1,
);
export { getWsConnected, setWsConnected };
