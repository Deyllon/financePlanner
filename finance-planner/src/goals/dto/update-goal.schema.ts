import { z } from 'zod';
import { goalSchema } from './create-goal.schema';
export const updateGoalSchema = goalSchema
  .strict()
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'O corpo da requisição deve conter pelo menos um campo',
  });

export type UpdateGoalDto = z.infer<typeof updateGoalSchema>;
