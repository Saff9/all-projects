import { Hono } from 'hono';
import { db } from '../lib/db';
import { links, profiles } from '../db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

app.get('/:profileId', async (c) => {
  const profileId = c.req.param('profileId');
  const allLinks = await db.query.links.findMany({
    where: eq(links.profileId, profileId),
    orderBy: [links.order],
  });
  return c.json(allLinks);
});

app.post('/:profileId', async (c) => {
  const profileId = c.req.param('profileId');
  const body = await c.req.json();
  
  const [newLink] = await db.insert(links).values({
    profileId,
    url: body.url,
    title: body.title,
    order: body.order || 0,
  }).returning();
  
  return c.json(newLink);
});

app.put('/:linkId', async (c) => {
  const linkId = c.req.param('linkId');
  const body = await c.req.json();
  
  await db.update(links)
    .set(body)
    .where(eq(links.id, parseInt(linkId)));
  
  const updated = await db.query.links.findFirst({
    where: eq(links.id, parseInt(linkId)),
  });
  
  return c.json(updated);
});

app.delete('/:linkId', async (c) => {
  const linkId = c.req.param('linkId');
  await db.delete(links).where(eq(links.id, parseInt(linkId)));
  return c.json({ success: true });
});

export default app;

