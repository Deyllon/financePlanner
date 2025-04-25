import { z } from 'zod';

export const authSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(7, { message: 'Password must be at least 7 characters long' })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter',
    })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, {
      message: 'Password must contain at least one special character',
    }),
});

export type AuthDto = z.infer<typeof authSchema>;
