/**
 * Webhook Authentication Utility
 * Verifies bot/user password for API endpoints
 */

export function verifyWebhookPassword(request: Request, bodyData?: any): boolean {
  const secretPassword = process.env.WEBHOOK_PASSWORD || (typeof import.meta !== 'undefined' && (import.meta as any).env?.WEBHOOK_PASSWORD);

  if (!secretPassword) {
    console.warn('[Webhook Auth] WEBHOOK_PASSWORD environment variable is not configured in .env. Rejecting request for security.');
    return false;
  }

  // Check Authorization Header (Bearer token)
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token === secretPassword) return true;
  }

  // Check Custom API Key Headers
  const apiKey = request.headers.get('X-API-KEY') || request.headers.get('x-api-key') || request.headers.get('X-Webhook-Password');
  if (apiKey && apiKey.trim() === secretPassword) return true;

  // Check Query String
  const url = new URL(request.url);
  const queryPass = url.searchParams.get('password') || url.searchParams.get('api_key');
  if (queryPass && queryPass.trim() === secretPassword) return true;

  // Check Request Body
  if (bodyData && typeof bodyData === 'object') {
    const bodyPass = bodyData.password || bodyData.api_key || bodyData.secret;
    if (bodyPass && bodyPass.toString().trim() === secretPassword) return true;
  }

  return false;
}
