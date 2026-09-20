import { z } from "zod";

export const UpdateProfileSchema = z.object({
  username: z.string().min(3).optional(),
  profile_img: z.string().url().optional().or(z.literal("")),
});

export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;
