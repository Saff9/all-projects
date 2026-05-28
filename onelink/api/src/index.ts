import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { clerkAuth } from './lib/clerk';
import { profiles } from './routes/profiles';
import { links } from './routes/links';
import { analytics } from './routes/analytics';

const app = new Hono();

app.use('*', cors());
app.use('*', clerkAuth());

// Routes
app.route('/profiles', profiles);
app.route('/links', links);
app.route('/analytics', analytics);

// Health check
app.get('/health', (c) => c.json({ status: 'OK', timestamp: new Date().toISOString() }));

export default app;

