import { NextResponse } from "next/server";
import type { z } from "zod";
import type {
  InvalidJsonErrorResponse,
  ValidationErrorResponse,
  NotFoundErrorResponse,
  InternalErrorResponse,
} from "./error.schemas";

type ParseResult<T extends z.ZodType> =
  | { success: true; data: z.output<T> }
  | { success: false; response: NextResponse<ValidationErrorResponse | InvalidJsonErrorResponse> };

/**
 * リクエストボディを zod スキーマで検証する。
 * 失敗時は 400 レスポンスを返す形に整形する。
 */
export async function parseJsonBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<ParseResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    const body: InvalidJsonErrorResponse = {
      success: false,
      error: "リクエストボディが不正なJSONです",
      code: "INVALID_JSON",
    };
    return {
      success: false,
      response: NextResponse.json(body, { status: 400 }),
    };
  }

  return runSchema(schema, raw);
}

/**
 * URLSearchParams を zod スキーマで検証する。
 */
export function parseSearchParams<T extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: T
): ParseResult<T> {
  const data = Object.fromEntries(searchParams.entries());
  return runSchema(schema, data);
}

function runSchema<T extends z.ZodType>(
  schema: T,
  data: unknown
): ParseResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const issues = result.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

  const body: ValidationErrorResponse = {
    success: false,
    error: issues[0]?.message ?? "入力値が不正です",
    code: "VALIDATION_ERROR",
    issues,
  };

  return {
    success: false,
    response: NextResponse.json(body, { status: 400 }),
  };
}

/**
 * 404 レスポンスを生成する。
 */
export function notFoundResponse(
  message: string
): NextResponse<NotFoundErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: "NOT_FOUND",
    },
    { status: 404 }
  );
}

/**
 * 500 レスポンスを生成する。
 */
export function internalErrorResponse(
  message: string
): NextResponse<InternalErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}
