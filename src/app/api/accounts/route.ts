import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  parseJsonBody,
  internalErrorResponse,
} from "@/lib/validations/api-helper";
import { createAccountSchema } from "@/lib/validations/account.schemas";

/**
 * アカウント一覧を取得
 * @description 削除されていないアカウントを作成日時の昇順で返す。
 * @response accountsListResponseSchema:アカウント一覧
 * @responseSet public
 * @tag Accounts
 * @openapi
 */
export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      accounts,
    });
  } catch (error) {
    console.error("アカウント取得エラー:", error);
    return internalErrorResponse("アカウントの取得に失敗しました");
  }
}

/**
 * アカウントを作成
 * @description アカウントを新規作成する。
 * @body createAccountSchema
 * @response 201:accountResponseSchema:作成されたアカウント
 * @responseSet common
 * @tag Accounts
 * @openapi
 */
export async function POST(request: NextRequest) {
  try {
    const parsed = await parseJsonBody(request, createAccountSchema);
    if (!parsed.success) return parsed.response;

    const account = await prisma.account.create({
      data: parsed.data,
    });

    return NextResponse.json(
      {
        success: true,
        account,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("アカウント作成エラー:", error);
    return internalErrorResponse("アカウントの作成に失敗しました");
  }
}
