import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Noto'g'ri email format"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, "Ism kamida 2 ta harf").max(50),
  lastName: z.string().min(2, "Familiya kamida 2 ta harf").max(50),
  email: z.email("Noto'g'ri email format"),
  phone: z.string().optional(),
  password: z.string().min(6, "Parol kamida 6 ta belgi").max(100),
  universityId: z.string().min(1, "Universitetni tanlang"),
  facultyId: z.string().min(1, "Fakultetni tanlang"),
  yearLevel: z.number().int().min(1).max(6),
  groupName: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
