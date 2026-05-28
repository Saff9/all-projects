import { Hono } from 'hono';
import { db } from '../lib/db';
import { profiles, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const app = new Hono();

app.get('/:userId', async (c) => {
  const userId = c.req.param('userId');
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  
  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404);
  }
  
  return c.json(profile);
});

app.put('/:userId', async (c) => {
  const userId = c.req.param('userId');
  const body = await c.req.json();
  
  const updateData = {
    displayName: body.displayName,
    bio: body.bio,
    themeSettings: body.themeSettings,
    socialLinks: body.socialLinks,
    updatedAt: new Date(),
  };
  
  await db.update(profiles)
    .set(updateData)
    .where(eq(profiles.userId, userId));
  
  const updated = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  
  return c.json(updated);
});

app.post('/:userId/publish', async (c) => {
  const userId = c.req.param('userId');
  await db.update(profiles)
    .set({ 
      isPublished: true,
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, userId));
  
  return c.json({ success: true });
});

export default app;

