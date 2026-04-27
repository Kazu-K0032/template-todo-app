import { z } from "zod";
import { TaskStatus } from "@/generated/prisma/enums";

export const taskStatusSchema = z.enum(
  Object.values(TaskStatus) as [TaskStatus, ...TaskStatus[]]
);

export const createTaskSchema = z.object({
  title: z
    .string({ message: "タイトルは必須です" })
    .trim()
    .min(1, "タイトルを入力してください")
    .max(100, "タイトルは100文字以内で入力してください"),
  description: z
    .string({ message: "説明は必須です" })
    .trim()
    .max(1000, "説明は1000文字以内で入力してください"),
  accountId: z
    .string({ message: "アカウントIDは必須です" })
    .min(1, "アカウントIDを指定してください"),
});

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "タイトルを入力してください")
      .max(100, "タイトルは100文字以内で入力してください")
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, "説明は1000文字以内で入力してください")
      .optional(),
    status: taskStatusSchema.optional(),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "更新する項目を1つ以上指定してください"
  );

export const taskQuerySchema = z.object({
  accountId: z
    .string({ message: "accountIdが必要です" })
    .min(1, "accountIdが必要です"),
  page: z.coerce
    .number()
    .int("pageは整数で指定してください")
    .min(1, "pageは1以上で指定してください")
    .default(1),
  limit: z.coerce
    .number()
    .int("limitは整数で指定してください")
    .min(1, "limitは1以上で指定してください")
    .max(100, "limitは100以下で指定してください")
    .default(8),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
