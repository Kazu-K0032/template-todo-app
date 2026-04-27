import { NextResponse } from "next/server";
import type { z } from "zod";

type ParseResult<T extends z.ZodType> =
  | { success: true; data: z.output<T> }
  | { success: false; response: NextResponse };

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
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "リクエストボディが不正なJSONです",
        },
        { status: 400 }
      ),
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

  return {
    success: false,
    response: NextResponse.json(
      {
        success: false,
        error: issues[0]?.message ?? "入力値が不正です",
        issues,
      },
      { status: 400 }
    ),
  };
}
