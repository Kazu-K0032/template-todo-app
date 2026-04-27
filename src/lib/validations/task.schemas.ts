import { z } from "zod";
import { TaskStatus } from "@/generated/prisma/enums";

export const taskStatusSchema = z
  .enum(Object.values(TaskStatus) as [TaskStatus, ...TaskStatus[]])
  .describe("タスクの状態");

/* ===== リクエスト ===== */

export const createTaskSchema = z.object({
  title: z
    .string({ message: "タイトルは必須です" })
    .trim()
    .min(1, "タイトルを入力してください")
    .max(100, "タイトルは100文字以内で入力してください")
    .describe("タスクのタイトル（1〜100文字）"),
  description: z
    .string({ message: "説明は必須です" })
    .trim()
    .max(1000, "説明は1000文字以内で入力してください")
    .describe("タスクの説明（最大1000文字、空文字可）"),
  accountId: z
    .string({ message: "アカウントIDは必須です" })
    .min(1, "アカウントIDを指定してください")
    .describe("所属するアカウントのID"),
});

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "タイトルを入力してください")
      .max(100, "タイトルは100文字以内で入力してください")
      .optional()
      .describe("タスクのタイトル（1〜100文字）"),
    description: z
      .string()
      .trim()
      .max(1000, "説明は1000文字以内で入力してください")
      .optional()
      .describe("タスクの説明（最大1000文字）"),
    status: taskStatusSchema.optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "更新する項目を1つ以上指定してください"
  );

export const taskQuerySchema = z.object({
  accountId: z
    .string({ message: "accountIdが必要です" })
    .min(1, "accountIdが必要です")
    .describe("対象アカウントのID"),
  page: z.coerce
    .number()
    .int("pageは整数で指定してください")
    .min(1, "pageは1以上で指定してください")
    .default(1)
    .describe("ページ番号（1始まり）"),
  limit: z.coerce
    .number()
    .int("limitは整数で指定してください")
    .min(1, "limitは1以上で指定してください")
    .max(100, "limitは100以下で指定してください")
    .default(8)
    .describe("1ページあたりの件数（1〜100）"),
});

export const taskIdParamsSchema = z.object({
  id: z.string().describe("タスクID"),
});

/* ===== レスポンス ===== */

export const taskSchema = z.object({
  id: z.string().describe("タスクID"),
  accountId: z.string().describe("所属アカウントID"),
  title: z.string().describe("タイトル"),
  description: z.string().describe("説明"),
  status: taskStatusSchema,
  createdAt: z.date().describe("作成日時"),
  updatedAt: z.date().describe("更新日時"),
  deletedAt: z.date().nullable().describe("論理削除日時（未削除なら null）"),
});

export const paginationSchema = z.object({
  page: z.number().int().describe("現在のページ"),
  limit: z.number().int().describe("1ページあたりの件数"),
  total: z.number().int().describe("総件数"),
  totalPages: z.number().int().describe("総ページ数"),
});

export const tasksListResponseSchema = z.object({
  success: z.literal(true),
  tasks: z.array(taskSchema),
  pagination: paginationSchema,
});

export const taskResponseSchema = z.object({
  success: z.literal(true),
  task: taskSchema,
});

export const taskDeleteResponseSchema = z.object({
  success: z.literal(true),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type TaskResponse = z.infer<typeof taskResponseSchema>;
export type TasksListResponse = z.infer<typeof tasksListResponseSchema>;
