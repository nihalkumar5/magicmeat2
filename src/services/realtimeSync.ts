import { Platform } from 'react-native';
import { Order, OrderStatus } from '../types';

const REALTIME_SYNC_ENABLED = process.env.EXPO_PUBLIC_ENABLE_REALTIME_SYNC === 'true';

// Android emulator maps 10.0.2.2 to host machine's localhost
const SYNC_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const WS_URL = `ws://${SYNC_HOST}:8082`;
const HTTP_URL = `http://${SYNC_HOST}:8082`;

export type SyncMessage =
  | { type: 'INIT_STATE'; orders: Order[]; inventory: Record<string, any> }
  | { type: 'ORDER_PLACED'; order: Order }
  | { type: 'ORDER_STATUS_CHANGED'; orderId: string; status: OrderStatus; order?: Order }
  | { type: 'INVENTORY_CHANGED'; productId: string; item: any };

type Listener = (msg: SyncMessage) => void;
const listeners = new Set<Listener>();

export function registerSyncListener(cb: Listener) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function notifyListeners(data: SyncMessage) {
  listeners.forEach((cb) => {
    try {
      cb(data);
    } catch (e) {
      console.warn('[RealtimeSync] Listener error', e);
    }
  });
}

let ws: WebSocket | null = null;
let reconnectTimer: any = null;
let broadcastChannel: any = null;

// Browser tab cross-talk
if (REALTIME_SYNC_ENABLED && Platform.OS === 'web' && typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new (window as any).BroadcastChannel('magicmeat_sync_channel');
    broadcastChannel.onmessage = (event: MessageEvent) => {
      if (event.data) {
        notifyListeners(event.data);
      }
    };
  } catch {
    // ignore
  }
}

export function initRealtimeSync() {
  if (!REALTIME_SYNC_ENABLED) return;

  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('[RealtimeSync] Connected to MagicMeat Sync Bridge on', WS_URL);
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type) {
          notifyListeners(data);
        }
      } catch (err) {
        console.warn('[RealtimeSync] Failed to parse message', err);
      }
    };

    ws.onerror = () => {
      // Offline fallback
    };

    ws.onclose = () => {
      ws = null;
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          initRealtimeSync();
        }, 5000);
      }
    };
  } catch {
    // fallback gracefully
  }
}

// Outgoing actions
export function syncPlaceOrder(order: Order) {
  if (!REALTIME_SYNC_ENABLED) return;

  const msg: SyncMessage = { type: 'ORDER_PLACED', order };
  notifyListeners(msg);
  broadcastChannel?.postMessage(msg);

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'PLACE_ORDER', order }));
    return;
  }

  fetch(`${HTTP_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  }).catch(() => {});
}

export function syncUpdateOrderStatus(orderId: string, status: OrderStatus) {
  if (!REALTIME_SYNC_ENABLED) return;

  const msg: SyncMessage = { type: 'ORDER_STATUS_CHANGED', orderId, status };
  notifyListeners(msg);
  broadcastChannel?.postMessage(msg);

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'UPDATE_ORDER_STATUS', orderId, status }));
    return;
  }

  fetch(`${HTTP_URL}/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }).catch(() => {});
}

export function syncToggleStock(productId: string) {
  if (!REALTIME_SYNC_ENABLED) return;

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'TOGGLE_STOCK', productId }));
    return;
  }

  fetch(`${HTTP_URL}/api/inventory/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toggle: true }),
  }).catch(() => {});
}

export function syncUpdateStockKg(productId: string, stockKg: number) {
  if (!REALTIME_SYNC_ENABLED) return;

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'UPDATE_STOCK_KG', productId, stockKg }));
    return;
  }

  fetch(`${HTTP_URL}/api/inventory/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stockKg, inStock: stockKg > 0 }),
  }).catch(() => {});
}
