/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
type SSEEventType = 'inventory.updated' | 'invoice.updated' | 'prescription.created' | 'customer.updated';

export interface SSEEventPayload {
  type: SSEEventType;
  entityId: string;
  timestamp: string;
}

export class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private lastHeartbeat: number = Date.now();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: ((payload: SSEEventPayload) => void)[] = [];

  constructor(private getToken: () => string) {}

  public connect() {
    this.disconnect();
    const token = this.getToken();
    this.eventSource = new EventSource(`/api/events?token=${token}`);

    this.eventSource.onmessage = (e) => {
      this.lastHeartbeat = Date.now();
      try {
        const payload = JSON.parse(e.data) as SSEEventPayload;
        this.listeners.forEach((listener) => listener(payload));
      } catch (err) {
        // ignore invalid payload
      }
    };

    this.eventSource.onerror = () => {
      this.scheduleReconnect();
    };

    this.startHeartbeatCheck();
  }

  public disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
  }

  public onMessage(listener: (payload: SSEEventPayload) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private scheduleReconnect() {
    this.disconnect();
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  private startHeartbeatCheck() {
    this.lastHeartbeat = Date.now();
    this.heartbeatTimer = setInterval(() => {
      if (Date.now() - this.lastHeartbeat > 30000) {
        this.scheduleReconnect();
      }
    }, 10000);
  }
}

export const sseClient = new SSEClient(() => localStorage.getItem('access_token') || '');
