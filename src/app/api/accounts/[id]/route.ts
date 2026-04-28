import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  parseJsonBody,
  notFoundResponse,
  internalErrorResponse,
} from "@/lib/validations/api-helper";
import { updateAccountSchema } from "@/lib/validations/account.schemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * アカウント詳細を取得
 * @description ID 指定でアカウントを取得する。論理削除済みは除外される。
 * @pathParams accountIdParamsSchema
 * @response accountResponseSchema:対象アカウント
 * @responseSet crud
 * @tag Accounts
 * @openapi
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const account = await prisma.account.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!account) {
      return notFoundResponse("アカウントが見つかりません");
    }

    return NextResponse.json({
      success: true,
      account,
    });
  } catch (error) {
    console.error("アカウント取得エラー:", error);
    return internalErrorResponse("アカウントの取得に失敗しました");
  }
}

/**
 * アカウントを更新
 * @description アカウント名とアイコンを更新する。
 * @pathParams accountIdParamsSchema
 * @body updateAccountSchema
 * @response accountResponseSchema:更新後のアカウント
 * @responseSet crud
 * @tag Accounts
 * @openapi
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const parsed = await parseJsonBody(request, updateAccountSchema);
    if (!parsed.success) return parsed.response;

    const { id } = await params;
    const updatedAccount = await prisma.account.update({
      where: {
        id,
      },
      data: {
        ...parsed.data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      account: updatedAccount,
    });
  } catch (error) {
    console.error("アカウント更新エラー:", error);
    return internalErrorResponse("アカウントの更新に失敗しました");
  }
}
