import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "8 caractères minimum").max(100),
});

export const statusSchema = z.enum(["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"]);

export const applicationCreateSchema = z.object({
  company: z.string().trim().min(1).max(120),
  position: z.string().trim().min(1).max(120),
  status: statusSchema.default("APPLIED"),
  url: z.string().trim().url().optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
});

export const applicationUpdateSchema = applicationCreateSchema.partial();

export const listQuerySchema = z.object({
  status: statusSchema.optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
