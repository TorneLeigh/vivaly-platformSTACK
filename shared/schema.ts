import { z } from "zod";

// You can replace this later with your DB table schema if needed
export const insertUserSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/^[^\s]+$/, { message: "Password must not contain spaces" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  phone: z.string().min(6, { message: "Phone is required" }),
  isNanny: z.boolean().optional(),
  isCaregiver: z.boolean().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
