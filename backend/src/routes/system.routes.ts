import { Router, Request, Response } from 'express';

const router = Router();

// Store active SSE clients
const clients: { id: string; res: Response }[] = [];

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // flush the headers to establish SSE

  const clientId = Date.now().toString();
  const newClient = {
    id: clientId,
    res
  };
  clients.push(newClient);

  // Send an initial heartbeat
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    const index = clients.findIndex(c => c.id === clientId);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
});

export const broadcastEvent = (type: string, entityId: string) => {
  const payload = JSON.stringify({ type, entityId, timestamp: new Date().toISOString() });
  clients.forEach(client => {
    client.res.write(`data: ${payload}\n\n`);
  });
};

export default router;
