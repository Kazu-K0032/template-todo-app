import { z } from "zod";

export const createAccountSchema = z.object({
  accountName: z
    .string({ message: "アカウント名は必須です" })
    .trim()
    .min(1, "アカウント名を入力してください")
    .max(50, "アカウント名は50文字以内で入力してください"),
  icon: z
    .string({ message: "アイコンは必須です" })
    .trim()
    .min(1, "アイコンを指定してください"),
});

export const updateAccountSchema = createAccountSchema;

export const selectAccountSchema = z.object({
  accountId: z
    .string({ message: "アカウントIDは必須です" })
    .min(1, "アカウントIDを指定してください"),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type SelectAccountInput = z.infer<typeof selectAccountSchema>;
