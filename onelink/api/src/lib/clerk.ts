import { clerkMiddleware, createClerkClient } from '@clerk/backend';
import { HonoRequest } from 'hono';

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export const clerkAuth = clerkMiddleware({
  publicRoutes: ['/health'],
});

export async function getAuthUser(c: HonoRequest) {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    const claims = await clerkClient.verifyToken(token);
    return claims.sub;
  } catch {
    return null;
  }
}

