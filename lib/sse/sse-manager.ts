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
  private cleanupInterval: NodeJS.Timer | undefined;
  private readonly maxClients: number;
  private readonly inactiveTimeout: number;

  protected constructor() {
    this.clients = new Map();
    this.maxClients = process.env.NODE_ENV === 'production' ? 1000 : 100;
    this.inactiveTimeout = process.env.NODE_ENV === 'production' ? 
      30 * 60 * 1000 :
      2 * 60 * 1000;
    
    this.startCleanup();
  }

  private startCleanup() {
    if (this.cleanupInterval) return;
    
    const interval = process.env.NODE_ENV === 'production' ? 120000 : 60000;
    this.cleanupInterval = setInterval(() => this.cleanupInactiveClients(), interval);
  
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  private async testClient(client: Client): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      client.controller.enqueue(encoder.encode(': ping\n\n'));
      client.lastActivity = Date.now();
      return true;
    } catch (error) {
      return false;
    }
  }

  private cleanupInactiveClients() {
    const now = Date.now();

    this.clients.forEach(async (client, clientId) => {
      if (now - client.lastActivity > this.inactiveTimeout || !client.isActive) {
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
    if (this.clients.size >= this.maxClients) {
      const oldestClient = Array.from(this.clients.entries())
        .sort(([, a], [, b]) => a.lastActivity - b.lastActivity)[0];
      if (oldestClient) {
        this.removeClient(oldestClient[0]);
      }
    }

    const clientId = uuidv4();
    const client: Client = {
      id: clientId,
      controller,
      lastActivity: Date.now(),
      isActive: true
    };
    
    this.clients.set(clientId, client);
    
    this.testClient(client).catch(() => {
      this.removeClient(clientId);
    });

    return clientId;
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

    const broadcastPromises = Array.from(this.clients.entries()).map(async ([clientId, client]) => {
      try {
        if (!client.isActive) {
          this.removeClient(clientId);
          return;
        }

        client.controller.enqueue(encodedMessage);
        client.lastActivity = Date.now();
      } catch  {
        this.removeClient(clientId);
      }
    });
    await Promise.allSettled(broadcastPromises);
  }

  removeClient(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      client.isActive = false;
      this.clients.delete(clientId);
    }
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
}

if (process.env.NODE_ENV !== 'production') {
  if (!global.sseManager) {
    global.sseManager = SSEManager.createInstance();
  }
}

export default SSEManager;