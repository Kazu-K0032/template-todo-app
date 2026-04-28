import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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
    const body = await request.json();
    const { accountName, icon } = body;

    if (!accountName || !icon) {
      return NextResponse.json(
        {
          success: false,
          error: "アカウント名とアイコンは必須です",
        },
        { status: 400 }
      );
    }

    const { id } = await params;
    const updatedAccount = await prisma.account.update({
      where: {
        id,
      },
      data: {
        accountName,
        icon,
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
