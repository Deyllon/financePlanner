import { z } from 'zod';
import { operationSchema } from './create-operation.schema';

export const updateOperationSchema = operationSchema
  .strict()
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'O corpo da requisição deve conter pelo menos um campo',
  });

export type UpdateOperationDto = z.infer<typeof updateOperationSchema>;
