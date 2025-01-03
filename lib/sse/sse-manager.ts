import { v4 as uuidv4 } from 'uuid';

type Client = {
  id: string;
  controller: ReadableStreamDefaultController;
};

class SSEManager {
  private static instance: SSEManager;
  private clients: Map<string, Client>;

  private constructor() {
    this.clients = new Map();
  }

  public static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  addClient(controller: ReadableStreamDefaultController): string {
    const clientId = uuidv4();
    this.clients.set(clientId, { id: clientId, controller });
    console.log(`Client connected: ${clientId}. Total clients: ${this.clients.size}`);
    return clientId;
  }

  removeClient(clientId: string) {
    this.clients.delete(clientId);
    console.log(`Client disconnected: ${clientId}. Total clients: ${this.clients.size}`);
  }

  broadcast(data: unknown) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);
    
    console.log('Broadcasting to clients:', {
      totalClients: this.clients.size,
      message: data
    });

    this.clients.forEach((client) => {
      try {
        client.controller.enqueue(encodedMessage);
      } catch (error) {
        console.error(`Failed to send to client ${client.id}:`, error);
        this.removeClient(client.id);
      }
    });
  }
}

export default SSEManager;