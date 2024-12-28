import { v4 as uuidv4 } from 'uuid';

type Client = {
  id: string;
  controller: ReadableStreamDefaultController;
};

let clients: Client[] = [];

export function addClient(controller: ReadableStreamDefaultController): string {
  const id = uuidv4();
  clients.push({ id, controller });
  console.log('New client connected:', id);
  return id;
}

export function removeClient(id: string) {
  clients = clients.filter(client => client.id !== id);
  console.log('Client disconnected:', id);
}

export function sendUpdate(data: any) {
  console.log('Sending update:', data);
  const encoder = new TextEncoder();
  const message = `data: ${JSON.stringify(data)}\n\n`;
  const encoded = encoder.encode(message);

  clients.forEach(client => {
    try {
      client.controller.enqueue(encoded);
      console.log('Update sent to client', client.id);
    } catch (err) {
      console.error('Failed to send update to client', client.id, err);
      removeClient(client.id);
    }
  });
}