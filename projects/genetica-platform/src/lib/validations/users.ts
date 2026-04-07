import { z } from "zod";

export const RoleSchema = z.enum(["admin", "ingeniero_ia"]);

export const CreateUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  full_name: z.string().min(2, "Nombre muy corto"),
  role: RoleSchema,
});

export const UpdateUserSchema = z.object({
  full_name: z.string().min(2).optional(),
  role: RoleSchema.optional(),
  is_active: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
