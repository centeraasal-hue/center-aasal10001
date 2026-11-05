import worker from '../../../src/worker.ts';

export const onRequest: any = async (context: any) => {
  return worker.fetch(context.request, context.env, context);
};
