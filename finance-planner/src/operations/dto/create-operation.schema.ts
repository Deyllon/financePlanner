import { z } from 'zod';

export const operationSchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT']),
  value: z.number(),
  date: z.string().default(new Date().toISOString()),
  user_id: z.number(),
  category: z.string(),
  operationId: z.string(),
});

export type CreateOperationDto = z.infer<typeof operationSchema>;
