const http = require('http');
const WebSocket = require('/Users/nihalkumar/Downloads/Magicmeat app/node_modules/ws');

const PORT = 8082;

// Shared in-memory state with persistence to memory
let orders = [
  {
    id: 'MM-849201',
    placedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    status: 'placed',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98234 11200',
    deliveryAddress: 'Flat 402, Royal Palms, Sector 24, Atal Nagar, Raipur',
    totalAmount: 848,
    paymentMethod: 'UPI',
    items: [
      {
        cartItemId: 'item-1',
        product: { id: 'c1', name: 'Farm Fresh Chicken (Curry Cut)', basePrice: 179 },
        selectedCut: { id: 'curry-cut', name: 'Curry Cut (Medium)' },
        quantity: 2,
        netWeight: '500g',
        itemTotal: 358,
      },
      {
        cartItemId: 'item-2',
        product: { id: 'c2', name: 'Prime Boneless Chicken Breast', basePrice: 239 },
        selectedCut: { id: 'fillet', name: 'Whole Clean Fillets' },
        quantity: 1,
        netWeight: '500g',
        itemTotal: 475,
      },
    ],
    coldChainVerified: true,
    sensorTemp: '2.1°C',
    assignedRider: 'Vikram Singh (+91 98765 43210)',
    estimatedDeliveryMinutes: 22,
  },
  {
    id: 'MM-849195',
    placedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    status: 'butcher_prepping',
    customerName: 'Pooja Verma',
    customerPhone: '+91 94060 22345',
    deliveryAddress: 'B-14, Green Valley, Naya Raipur, Chhattisgarh',
    totalAmount: 229,
    paymentMethod: 'Cash on Delivery',
    items: [
      {
        cartItemId: 'item-3',
        product: { id: 'c5', name: 'Smoky Peri-Peri Chicken Wings (Marinated)', basePrice: 229 },
        selectedCut: { id: 'curry-cut', name: 'Curry Cut (Medium)' },
        quantity: 1,
        netWeight: '500g',
        itemTotal: 229,
      },
    ],
    coldChainVerified: true,
    sensorTemp: '1.9°C',
    assignedRider: 'Amit Sahu (+91 91234 56789)',
    estimatedDeliveryMinutes: 15,
  },
];

let inventory = {
  c1: { productId: 'c1', inStock: true, stockKg: 45, basePrice: 179 },
  c2: { productId: 'c2', inStock: true, stockKg: 18, basePrice: 239 },
  m1: { productId: 'm1', inStock: true, stockKg: 35, basePrice: 489 },
  c3: { productId: 'c3', inStock: true, stockKg: 20, basePrice: 229 },
  m2: { productId: 'm2', inStock: true, stockKg: 14, basePrice: 499 },
  s1: { productId: 's1', inStock: false, stockKg: 0, basePrice: 349 },
  c4: { productId: 'c4', inStock: true, stockKg: 12, basePrice: 199 },
  e1: { productId: 'e1', inStock: true, stockKg: 80, basePrice: 89 },
  c5: { productId: 'c5', inStock: true, stockKg: 22, basePrice: 229 },
  cb1: { productId: 'cb1', inStock: true, stockKg: 15, basePrice: 499 },
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: 'MagicMeat Sync Bridge', timestamp: Date.now() }));
    return;
  }

  if (url.pathname === '/api/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ orders, inventory }));
    return;
  }

  if (url.pathname === '/api/orders' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const order = JSON.parse(body);
        if (!order.id) order.id = 'MM-' + Math.floor(100000 + Math.random() * 900000);
        order.placedAt = new Date().toISOString();
        orders.unshift(order);

        broadcast({ type: 'ORDER_PLACED', order });
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, order }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (url.pathname.startsWith('/api/orders/') && req.method === 'PATCH') {
    const orderId = url.pathname.replace('/api/orders/', '').replace('/status', '');
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { status, assignedRider } = JSON.parse(body);
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
          if (status) orders[idx].status = status;
          if (assignedRider) orders[idx].assignedRider = assignedRider;
          broadcast({ type: 'ORDER_STATUS_CHANGED', orderId, status: orders[idx].status, order: orders[idx] });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, order: orders[idx] }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Order not found' }));
        }
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (url.pathname.startsWith('/api/inventory/') && req.method === 'PATCH') {
    const productId = url.pathname.replace('/api/inventory/', '');
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const patch = JSON.parse(body);
        if (!inventory[productId]) {
          inventory[productId] = { productId, inStock: true, stockKg: 20, ...patch };
        } else {
          inventory[productId] = { ...inventory[productId], ...patch };
        }
        broadcast({ type: 'INVENTORY_CHANGED', productId, item: inventory[productId] });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, item: inventory[productId] }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// WebSocket Server for live push notifications between Customer & Admin
const wss = new WebSocket.Server({ server });

function broadcast(msg) {
  const data = JSON.stringify(msg);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', ws => {
  console.log('[Sync Bridge] App connected. Total clients:', wss.clients.size);
  // Send initial snapshot
  ws.send(JSON.stringify({ type: 'INIT_STATE', orders, inventory }));

  ws.on('message', message => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'PLACE_ORDER') {
        const order = data.order;
        if (!order.id) order.id = 'MM-' + Math.floor(100000 + Math.random() * 900000);
        order.placedAt = new Date().toISOString();
        orders.unshift(order);
        broadcast({ type: 'ORDER_PLACED', order });
      } else if (data.type === 'UPDATE_ORDER_STATUS') {
        const idx = orders.findIndex(o => o.id === data.orderId);
        if (idx !== -1) {
          orders[idx].status = data.status;
          broadcast({ type: 'ORDER_STATUS_CHANGED', orderId: data.orderId, status: data.status, order: orders[idx] });
        }
      } else if (data.type === 'TOGGLE_STOCK') {
        const pId = data.productId;
        if (inventory[pId]) {
          inventory[pId].inStock = !inventory[pId].inStock;
          broadcast({ type: 'INVENTORY_CHANGED', productId: pId, item: inventory[pId] });
        }
      } else if (data.type === 'UPDATE_STOCK_KG') {
        const pId = data.productId;
        if (inventory[pId]) {
          inventory[pId].stockKg = Math.max(0, data.stockKg);
          inventory[pId].inStock = inventory[pId].stockKg > 0;
          broadcast({ type: 'INVENTORY_CHANGED', productId: pId, item: inventory[pId] });
        }
      }
    } catch (e) {
      console.error('[Sync Bridge] Message parsing error:', e);
    }
  });

  ws.on('close', () => {
    console.log('[Sync Bridge] App disconnected. Remaining clients:', wss.clients.size);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Sync Bridge] Running on http://0.0.0.0:${PORT} and ws://0.0.0.0:${PORT}`);
  console.log(`  - Local:    http://localhost:${PORT}`);
  console.log(`  - Android:  http://10.0.2.2:${PORT}`);
});
