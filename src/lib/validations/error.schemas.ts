import { z } from "zod";

/**
 * API エラーコード（アプリケーション固有）
 */
export const apiErrorCodeSchema = z.enum([
  "BAD_REQUEST",
  "VALIDATION_ERROR",
  "INVALID_JSON",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL_ERROR",
]);

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

/**
 * バリデーション失敗時に各フィールドの詳細を返すための形式
 */
export const validationIssueSchema = z.object({
  path: z.string().describe("不正だったフィールドのパス（例: title）"),
  message: z.string().describe("そのフィールドに対するエラーメッセージ"),
});

export type ValidationIssue = z.infer<typeof validationIssueSchema>;

/**
 * 400 Bad Request - バリデーションエラー時のレスポンス
 */
export const validationErrorResponseSchema = z.object({
  success: z.literal(false).describe("常に false"),
  error: z.string().describe("代表的なエラーメッセージ（先頭の issue を採用）"),
  code: z.literal("VALIDATION_ERROR").describe("エラーコード"),
  issues: z
    .array(validationIssueSchema)
    .describe("各フィールドのバリデーションエラー一覧"),
});

export type ValidationErrorResponse = z.infer<
  typeof validationErrorResponseSchema
>;

/**
 * 400 Bad Request - JSON パース失敗時のレスポンス
 */
export const invalidJsonErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string().describe("リクエストボディが不正なJSONです"),
  code: z.literal("INVALID_JSON"),
});

export type InvalidJsonErrorResponse = z.infer<
  typeof invalidJsonErrorResponseSchema
>;

/**
 * 404 Not Found - リソースが見つからない場合のレスポンス
 */
export const notFoundErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string().describe("リソースが見つかりません"),
  code: z.literal("NOT_FOUND"),
});

export type NotFoundErrorResponse = z.infer<typeof notFoundErrorResponseSchema>;

/**
 * 500 Internal Server Error - 予期しないエラー時のレスポンス
 */
export const internalErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string().describe("サーバー内部エラー"),
  code: z.literal("INTERNAL_ERROR"),
});

export type InternalErrorResponse = z.infer<typeof internalErrorResponseSchema>;

/**
 * すべてのエラーレスポンスの和集合
 */
export const apiErrorResponseSchema = z.union([
  validationErrorResponseSchema,
  invalidJsonErrorResponseSchema,
  notFoundErrorResponseSchema,
  internalErrorResponseSchema,
]);

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;

/**
 * 成功レスポンスの最小骨格（個別 API はこれを拡張する）
 */
export const successEnvelopeSchema = z.object({
  success: z.literal(true),
});

export type SuccessEnvelope = z.infer<typeof successEnvelopeSchema>;
