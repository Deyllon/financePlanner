import { userSchema } from './create.user.schema';
import { z } from 'zod';

export const updateUserSchema = userSchema
  .strict()
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'O corpo da requisição deve conter pelo menos um campo',
  });

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
