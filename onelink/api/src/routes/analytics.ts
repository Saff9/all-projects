import { Hono } from 'hono';
import { db } from '../lib/db';
import { analytics } from '../db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

app.get('/:profileId', async (c) => {
  const profileId = c.req.param('profileId');
  const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 100;
  
  const events = await db.query.analytics.findMany({
    where: eq(analytics.profileId, profileId),
    orderBy: [analytics.createdAt],
    limit,
  });
  
  return c.json(events);
});

app.post('/:profileId/track', async (c) => {
  const profileId = c.req.param('profileId');
  const body = await c.req.json();
  
  const [event] = await db.insert(analytics).values({
    profileId,
    type: body.type,
    linkId: body.linkId,
    visitorData: body.visitorData,
    date: body.date,
    hour: body.hour,
  }).returning();
  
  return c.json(event);
});

export default app;

