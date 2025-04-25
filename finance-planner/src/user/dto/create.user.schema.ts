import { z } from 'zod';

export const userSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters long' }),
  email: z.string().email(),
  profile: z.enum(['EQUILIBRIO', 'AMBICIOSO', 'DETERMINADO']),
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

export type CreateUserDto = z.infer<typeof userSchema>;
