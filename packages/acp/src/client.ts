// ============================================================
// ACPClient — 浏览器端 WebSocket 客户端
// 自动重连 + 指数退避
// ============================================================

import type {
  ACPServerMessage,
  ACPClientMessage,
  ACPConnectionState,
} from "./types.js";

export interface ACPClientOptions {
  url: string;
  /** 最大重连次数，默认 5 */
  maxRetries?: number;
  /** 初始重连延迟 ms，默认 1000 */
  baseDelay?: number;
  onMessage?: (msg: ACPServerMessage) => void;
  onStateChange?: (state: ACPConnectionState) => void;
}

export class ACPClient {
  private ws: WebSocket | null = null;
  private retryCount = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;

  private readonly url: string;
  private readonly maxRetries: number;
  private readonly baseDelay: number;

  public onMessage: ((msg: ACPServerMessage) => void) | null;
  public onStateChange: ((state: ACPConnectionState) => void) | null;

  constructor(options: ACPClientOptions) {
    this.url = options.url;
    this.maxRetries = options.maxRetries ?? 5;
    this.baseDelay = options.baseDelay ?? 1000;
    this.onMessage = options.onMessage ?? null;
    this.onStateChange = options.onStateChange ?? null;
  }

  connect(): void {
    this.intentionalClose = false;
    this.onStateChange?.("connecting");

    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.onStateChange?.("error");
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.retryCount = 0;
      this.onStateChange?.("connected");
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as ACPServerMessage;
        this.onMessage?.(msg);
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      if (!this.intentionalClose) {
        this.onStateChange?.("disconnected");
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror
    };
  }

  send(msg: ACPClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    this.onStateChange?.("disconnected");
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  private scheduleReconnect(): void {
    if (this.retryCount >= this.maxRetries) {
      this.onStateChange?.("error");
      return;
    }
    const delay = this.baseDelay * Math.pow(2, this.retryCount);
    this.retryCount++;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.connect();
    }, delay);
  }
}
