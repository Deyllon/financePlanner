import { z } from 'zod';

export const goalSchema = z.object({
  name: z.string(),
  value: z.number(),
  deadline: z.string().default(new Date().toISOString()),
  user_id: z.number(),
});

export type CreateGoalDto = z.infer<typeof goalSchema>;
