import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonBody } from "@/lib/validations/api-helper";
import { createAccountSchema } from "@/lib/validations/account.schemas";

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
    return NextResponse.json(
      {
        success: false,
        error: "アカウントの取得に失敗しました",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseJsonBody(request, createAccountSchema);
    if (!parsed.success) return parsed.response;

    const account = await prisma.account.create({
      data: parsed.data,
    });

    return NextResponse.json({
      success: true,
      account,
    });
  } catch (error) {
    console.error("アカウント作成エラー:", error);
    return NextResponse.json(
      {
        success: false,
        error: "アカウントの作成に失敗しました",
      },
      { status: 500 }
    );
  }
}
