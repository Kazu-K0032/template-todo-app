import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonBody, parseSearchParams } from "@/lib/validations/api-helper";
import {
  createTaskSchema,
  taskQuerySchema,
} from "@/lib/validations/task.schemas";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = parseSearchParams(searchParams, taskQuerySchema);
    if (!parsed.success) return parsed.response;

    const { accountId, page, limit } = parsed.data;

    const tasks = await prisma.task.findMany({
      where: {
        accountId,
        deletedAt: null,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.task.count({
      where: {
        accountId,
        deletedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("タスク取得エラー:", error);
    return NextResponse.json(
      {
        success: false,
        error: "タスクの取得に失敗しました",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseJsonBody(request, createTaskSchema);
    if (!parsed.success) return parsed.response;

    const task = await prisma.task.create({
      data: {
        ...parsed.data,
        status: "TODO",
      },
    });

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("タスク作成エラー:", error);
    return NextResponse.json(
      {
        success: false,
        error: "タスクの作成に失敗しました",
      },
      { status: 500 }
    );
  }
}
