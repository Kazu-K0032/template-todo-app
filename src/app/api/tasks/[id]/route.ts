import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  parseJsonBody,
  notFoundResponse,
  internalErrorResponse,
} from "@/lib/validations/api-helper";
import { updateTaskSchema } from "@/lib/validations/task.schemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * タスク詳細を取得
 * @description ID 指定でタスクを取得する。論理削除済みは除外される。
 * @pathParams taskIdParamsSchema
 * @response taskResponseSchema:対象タスク
 * @responseSet crud
 * @tag Tasks
 * @openapi
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const task = await prisma.task.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!task) {
      return notFoundResponse("タスクが見つかりません");
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("タスク取得エラー:", error);
    return internalErrorResponse("タスクの取得に失敗しました");
  }
}

/**
 * タスクを更新
 * @description タイトル・説明・ステータスを部分更新する。
 * @pathParams taskIdParamsSchema
 * @body updateTaskSchema
 * @response taskResponseSchema:更新後のタスク
 * @responseSet crud
 * @tag Tasks
 * @openapi
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const parsed = await parseJsonBody(request, updateTaskSchema);
    if (!parsed.success) return parsed.response;

    const { id } = await params;
    const task = await prisma.task.update({
      where: {
        id,
      },
      data: parsed.data,
    });

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("タスク更新エラー:", error);
    return internalErrorResponse("タスクの更新に失敗しました");
  }
}

/**
 * タスクを削除
 * @description deletedAt を設定する論理削除。
 * @pathParams taskIdParamsSchema
 * @response taskDeleteResponseSchema:削除完了
 * @responseSet crud
 * @tag Tasks
 * @openapi
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.task.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("タスク削除エラー:", error);
    return internalErrorResponse("タスクの削除に失敗しました");
  }
}
