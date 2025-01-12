import { v4 as uuidv4 } from 'uuid';

interface Client {
  id: string;
  controller: ReadableStreamDefaultController;
  lastEventId: string;
  lastActiveAt: number;
}

interface EventMessage {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

// Use Map for better performance with frequent lookups and deletions
const clients = new Map<string, Client>();

// Keep track of recent events for missed message recovery
const recentEvents = new Map<string, EventMessage>();
const MAX_EVENTS = 100; // Limit stored events
const EVENT_TTL = 5 * 60 * 1000; // 5 minutes retention

export function addClient(controller: ReadableStreamDefaultController): string {
  const id = uuidv4();
  
  clients.set(id, {
    id,
    controller,
    lastEventId: '',
    lastActiveAt: Date.now()
  });

  
  // Send initial connection confirmation
  sendEventToClient(id, {
    type: 'connection-established',
    data: { clientId: id }
  });

  return id;
}

export function removeClient(id: string) {
  clients.delete(id);
}

function sendEventToClient(clientId: string, eventData: any) {
  const client = clients.get(clientId);
  if (!client) return;

  const event: EventMessage = {
    id: uuidv4(),
    type: eventData.type,
    data: eventData,
    timestamp: Date.now()
  };

  const encoder = new TextEncoder();
  const message = `id: ${event.id}\ntype: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;

  try {
    client.controller.enqueue(encoder.encode(message));
    client.lastEventId = event.id;
    client.lastActiveAt = Date.now();
    
  } catch  {
    removeClient(clientId);
  }
}

export function sendUpdate(data: any) {
  const eventId = uuidv4();
  const event: EventMessage = {
    id: eventId,
    type: data.type,
    data,
    timestamp: Date.now()
  };

  // Store event for potential replay
  storeEvent(event);

  // Broadcast to all clients
  clients.forEach((_, clientId) => {
    sendEventToClient(clientId, data);
  });
}

function storeEvent(event: EventMessage) {
  recentEvents.set(event.id, event);
  cleanOldEvents();
}

function cleanOldEvents() {
  const now = Date.now();

  // Remove old events
  for (const [id, event] of recentEvents) {
    if (now - event.timestamp > EVENT_TTL) {
      recentEvents.delete(id);
    }
  }

  // If still too many events, remove oldest ones
  if (recentEvents.size > MAX_EVENTS) {
    const sortedEvents = Array.from(recentEvents.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    for (let i = 0; i < sortedEvents.length - MAX_EVENTS; i++) {
      recentEvents.delete(sortedEvents[i][0]);
    }
  }
}

export function getRecentEvents(since: number): EventMessage[] {
  return Array.from(recentEvents.values())
    .filter(event => event.timestamp > since)
    .sort((a, b) => a.timestamp - b.timestamp);
}

// Periodic maintenance
setInterval(() => {
  const now = Date.now();
  
  // Check client health and cleanup inactive ones
  for (const [clientId, client] of clients) {
    if (now - client.lastActiveAt > 60000) { // 1 minute inactive
      sendEventToClient(clientId, { type: 'ping' });
    }
  }
  
  // Clean old events
  cleanOldEvents();
}, 30000); // Run every 30 seconds