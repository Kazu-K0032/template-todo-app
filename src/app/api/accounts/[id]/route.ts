import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonBody } from "@/lib/validations/api-helper";
import { updateAccountSchema } from "@/lib/validations/account.schemas";

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const account = await prisma.account.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
    });

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          error: "アカウントが見つかりません",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      account,
    });
  } catch (error) {
    console.error("アカウント取得エラー:", error);
    return NextResponse.json(
      {
        success: false,
        error: "アカウントの取得に失敗しました",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const parsed = await parseJsonBody(request, updateAccountSchema);
    if (!parsed.success) return parsed.response;

    const updatedAccount = await prisma.account.update({
      where: {
        id: params.id,
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
    return NextResponse.json(
      {
        success: false,
        error: "アカウントの更新に失敗しました",
      },
      { status: 500 }
    );
  }
}
