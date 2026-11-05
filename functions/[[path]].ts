import worker from '../src/worker.ts';

export const onRequest: any = async (context: any) => {
  const url = new URL(context.request.url);
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/admin') || url.pathname === '/login' || url.pathname === '/verify') {
    return worker.fetch(context.request, context.env, context);
  }
  return context.next();
};
