import { NextRequest, NextResponse } from "next/server";
import { setSelectedAccountId, clearSelectedAccountId } from "@/lib/cookies";
import {
  parseJsonBody,
  internalErrorResponse,
} from "@/lib/validations/api-helper";
import { selectAccountSchema } from "@/lib/validations/account.schemas";

/**
 * アカウントを選択
 * @description Cookie に選択中アカウントIDを保存する。
 * @body selectAccountSchema
 * @response accountSelectResponseSchema:選択完了メッセージ
 * @responseSet common
 * @tag Accounts
 * @openapi
 */
export async function POST(request: NextRequest) {
  try {
    const parsed = await parseJsonBody(request, selectAccountSchema);
    if (!parsed.success) return parsed.response;

    await setSelectedAccountId(parsed.data.accountId);

    return NextResponse.json({
      success: true,
      message: "アカウントが選択されました",
    });
  } catch (error) {
    console.error("アカウント選択エラー:", error);
    return internalErrorResponse("アカウントの選択に失敗しました");
  }
}

/**
 * アカウント選択を解除
 * @description Cookie の選択中アカウントIDを削除する。
 * @response accountSelectResponseSchema:解除完了メッセージ
 * @responseSet common
 * @tag Accounts
 * @openapi
 */
export async function DELETE() {
  try {
    await clearSelectedAccountId();

    return NextResponse.json({
      success: true,
      message: "アカウント選択が解除されました",
    });
  } catch (error) {
    console.error("アカウント選択解除エラー:", error);
    return internalErrorResponse("アカウント選択の解除に失敗しました");
  }
}
