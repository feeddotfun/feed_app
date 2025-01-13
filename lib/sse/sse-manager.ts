import { v4 as uuidv4 } from 'uuid';

declare global {
  var sseManager: SSEManager | undefined;
}

type Client = {
  id: string;
  controller: ReadableStreamDefaultController;
  lastActivity: number;
  isActive: boolean;
};

type ClientStatus = {
  id: string;
  lastActivity: number;
  isActive: boolean;
};

type BroadcastData = Record<string, any>;

class SSEManager {
  private clients: Map<string, Client>;
  private cleanupInterval: NodeJS.Timer;

  protected constructor() {
    this.clients = new Map();
    this.cleanupInterval = setInterval(() => this.cleanupInactiveClients(), 60000);
  }

  public static createInstance(): SSEManager {
    return new SSEManager();
  }

  public static getInstance(): SSEManager {
    if (!global.sseManager) {
      global.sseManager = SSEManager.createInstance();
    }
    return global.sseManager;
  }

  private async testClient(client: Client): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      client.controller.enqueue(encoder.encode(': ping\n\n'));
      client.lastActivity = Date.now();
      return true;
    } catch  {
      return false;
    }
  }

  private cleanupInactiveClients() {
    const now = Date.now();
    const inactiveTimeout = 2 * 60 * 1000; // 2 minutes

    this.clients.forEach(async (client, clientId) => {
      if (now - client.lastActivity > inactiveTimeout || !client.isActive) {
        this.removeClient(clientId);
      } else {
        const isActive = await this.testClient(client);
        if (!isActive) {
          this.removeClient(clientId);
        }
      }
    });
  }

  addClient(controller: ReadableStreamDefaultController): string {
    const clientId = uuidv4();
    const client: Client = {
      id: clientId,
      controller,
      lastActivity: Date.now(),
      isActive: true
    };
    
    this.clients.set(clientId, client);
    
    // Send initial test message
    this.testClient(client).catch(error => {
      this.removeClient(clientId);
    });

    return clientId;
  }

  removeClient(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      client.isActive = false;
      this.clients.delete(clientId);
    }
  }

  async broadcast(type: string, data: BroadcastData) {
    const messageData = {
      type,
      ...data,
      timestamp: Date.now()
    };

    const message = `data: ${JSON.stringify(messageData)}\n\n`;
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);

    const broadcastPromises: Promise<void>[] = [];

    this.clients.forEach((client) => {
      broadcastPromises.push(
        new Promise<void>((resolve) => {
          try {
            if (!client.isActive) {
              this.removeClient(client.id);
              resolve();
              return;
            }

            client.controller.enqueue(encodedMessage);
            client.lastActivity = Date.now();
            resolve();
          } catch  {
            this.removeClient(client.id);
            resolve();
          }
        })
      );
    });

    await Promise.all(broadcastPromises);
  }

  getClientStatus(): { totalClients: number; clients: ClientStatus[] } {
    return {
      totalClients: this.clients.size,
      clients: Array.from(this.clients.values()).map(client => ({
        id: client.id,
        lastActivity: client.lastActivity,
        isActive: client.isActive
      }))
    };
  }
}

// Protect against hot reload in development
if (process.env.NODE_ENV !== 'production') {
  if (!global.sseManager) {
    global.sseManager = SSEManager.createInstance();
  }
}

export default SSEManager;