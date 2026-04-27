import { z } from "zod";

/* ===== リクエスト ===== */

export const createAccountSchema = z.object({
  accountName: z
    .string({ message: "アカウント名は必須です" })
    .trim()
    .min(1, "アカウント名を入力してください")
    .max(50, "アカウント名は50文字以内で入力してください")
    .describe("アカウント名（1〜50文字）"),
  icon: z
    .string({ message: "アイコンは必須です" })
    .trim()
    .min(1, "アイコンを指定してください")
    .describe("アイコン識別子または URL"),
});

export const updateAccountSchema = createAccountSchema;

export const selectAccountSchema = z.object({
  accountId: z
    .string({ message: "アカウントIDは必須です" })
    .min(1, "アカウントIDを指定してください")
    .describe("選択するアカウントのID"),
});

export const accountIdParamsSchema = z.object({
  id: z.string().describe("アカウントID"),
});

/* ===== レスポンス ===== */

export const accountSchema = z.object({
  id: z.string().describe("アカウントID"),
  accountName: z.string().describe("アカウント名"),
  icon: z.string().describe("アイコン"),
  createdAt: z.date().describe("作成日時"),
  updatedAt: z.date().describe("更新日時"),
  deletedAt: z.date().nullable().describe("論理削除日時（未削除なら null）"),
});

export const accountResponseSchema = z.object({
  success: z.literal(true),
  account: accountSchema,
});

export const accountsListResponseSchema = z.object({
  success: z.literal(true),
  accounts: z.array(accountSchema),
});

export const accountSelectResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().describe("操作結果メッセージ"),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type SelectAccountInput = z.infer<typeof selectAccountSchema>;
export type AccountResponse = z.infer<typeof accountResponseSchema>;
export type AccountsListResponse = z.infer<typeof accountsListResponseSchema>;
