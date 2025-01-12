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
  private static instance: SSEManager;
  private clients: Map<string, Client>;

  protected constructor() {
    this.clients = new Map();
    const intervalFunc = typeof self !== 'undefined' ? self.setInterval : setInterval;
    intervalFunc(() => this.cleanupInactiveClients(), 60000);
  }

  public static getInstance(): SSEManager {
    if (process.env.NODE_ENV === 'development') {
      if (!global.sseManager) {
        global.sseManager = new SSEManager();
      }
      return global.sseManager;
    }

    // Production mode (Edge)
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  private async testClient(client: Client): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      client.controller.enqueue(encoder.encode(': ping\n\n'));
      client.lastActivity = Date.now();
      return true;
    } catch {
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
    

    const promises = Array.from(this.clients.values()).map(client => 
      new Promise<void>(resolve => {
        try {
          if (!client.isActive) {
            this.removeClient(client.id);
            resolve();
            return;
          }
          client.controller.enqueue(encodedMessage);
          client.lastActivity = Date.now();
          resolve();
        } catch {
          this.removeClient(client.id);
          resolve();
        }
      })
    );

    await Promise.all(promises);
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
export default SSEManager;