import { WebSocket } from "isows";
import {atom} from "~/lib/dom_utils";

export class WSBase {
  socket?: WebSocket | null;
  state = atom<number>(WebSocket.CLOSED);
  private id_ = 0;
  private readonly path: string;
  // https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine
  // private isOnline = window.navigator.onLine;
  private onOpen_: (() => void) | undefined;
  private onClose_: (() => void) | undefined;
  private onMessage_: ((message: MessageEvent) => void) | undefined;

  constructor(path: string) {
    this.path = path;
    this.start = this.start.bind(this);
    this.onopen = this.onopen.bind(this);
    // this.onOpen_ = this.onOpen_.bind(this);
    this.onclose = this.onclose.bind(this);
    // this.onClose_ = this.onClose_.bind(this);
    this.onerror = this.onerror.bind(this);
    this.setOnMessage = this.setOnMessage.bind(this);
    this.destroy = this.destroy.bind(this);
    // this.onMessage_ = this.onMessage_.bind(this);
  }

  get uid() {
    return ++this.id_;
  }

  start() {
    // if (IS_PRODUCTION) {
    //   if (window.navigator.onLine) {
    //     this.socket = this.setupConnection();
    //   }
    //   window.addEventListener("online", () => {
    //     this.isOnline = true;
    //     this.setupConnection();
    //   });
    //   window.addEventListener("offline", () => {
    //     this.isOnline = false;
    //   });
    // } else {
    this.setupConnection();
    // }
  }

  setupConnection() {
    if (this.socket) {
      return;
    }
    if (!this.onMessage_) {
      console.warn("please setup onMessage handler");
      return;
    }
    // Temporary we dont use websocket.
    /* this.socket = new WebSocket(this.path, []);
            // this.socket.onopen = this.onopen;
            this.socket.addEventListener("open", this.onopen);
            this.socket.onmessage = this.onMessage_;
            this.socket.onclose = this.onclose;
            this.socket.onerror = (e) => {
              console.log(e);
            };*/
    return this.socket;
  }

  setOnMessage(onMessage: (message: MessageEvent) => void) {
    this.onMessage_ = onMessage;
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

  setOnOpen(onOpen: () => void) {
    this.onOpen_ = onOpen;
  }

  setOnClose(onClose: () => void) {
    this.onClose_ = onClose;
  }

  private onopen(evt: Event) {
    this.state(WebSocket.OPEN);
    this.onOpen_?.();
  }

  private onclose(ev: CloseEvent) {
    this.state(WebSocket.CLOSED);
    const waitMs = 2000;
    if (ev.code !== 1006 && ev.code !== 1001) {
      console.log("WS Reconnect", ev);
    }
    this.onClose_?.();
    this.socket = null;
    setTimeout(() => {
      if (this.isOnline) {
        this.setupConnection();
      }
    }, waitMs);
  }

  private onerror(event: Event) {
    console.warn("WebSocket error:", event);
    this.setupConnection();
  }
}
