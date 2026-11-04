import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server.ts';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const rawUrl = req.url || '/api';
    const forwardedUri = req.headers['x-forwarded-uri'] as string;
    const matchedPath = req.headers['x-matched-path'] as string;

    if ((rawUrl === '/api' || rawUrl === '/api/' || rawUrl === '/') && forwardedUri) {
      req.url = forwardedUri;
    } else if ((rawUrl === '/api' || rawUrl === '/api/' || rawUrl === '/') && matchedPath) {
      req.url = matchedPath;
    }

    return (app as any)(req, res);
  } catch (error: any) {
    console.error('Fatal unhandled error in API catch-all handler:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        message: 'حدث خطأ غير متوقع في الخادم: ' + (error?.message || 'Serverless Invocation Failed')
      }));
    }
  }
}
