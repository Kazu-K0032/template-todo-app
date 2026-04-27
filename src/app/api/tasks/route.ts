import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  parseJsonBody,
  parseSearchParams,
  internalErrorResponse,
} from "@/lib/validations/api-helper";
import {
  createTaskSchema,
  taskQuerySchema,
} from "@/lib/validations/task.schemas";

/**
 * タスク一覧を取得
 * @description 指定アカウントのタスクをページング付きで取得する
 * @params taskQuerySchema
 * @response tasksListResponseSchema:タスク一覧とページング情報
 * @responseSet common
 * @tag Tasks
 * @openapi
 */
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
    return internalErrorResponse("タスクの取得に失敗しました");
  }
}

/**
 * タスクを作成
 * @description タスクを新規作成する。ステータスは TODO で初期化される。
 * @body createTaskSchema
 * @response 201:taskResponseSchema:作成されたタスク
 * @responseSet common
 * @tag Tasks
 * @openapi
 */
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

    return NextResponse.json(
      {
        success: true,
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("タスク作成エラー:", error);
    return internalErrorResponse("タスクの作成に失敗しました");
  }
}
