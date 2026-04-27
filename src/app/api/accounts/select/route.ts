import { NextRequest, NextResponse } from "next/server";
import { setSelectedAccountId, clearSelectedAccountId } from "@/lib/cookies";
import { parseJsonBody } from "@/lib/validations/api-helper";
import { selectAccountSchema } from "@/lib/validations/account.schemas";

/**
 * アカウント選択API
 * POST: アカウントを選択
 * DELETE: アカウント選択を解除
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
    return NextResponse.json(
      {
        success: false,
        error: "アカウントの選択に失敗しました",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await clearSelectedAccountId();

    return NextResponse.json({
      success: true,
      message: "アカウント選択が解除されました",
    });
  } catch (error) {
    console.error("アカウント選択解除エラー:", error);
    return NextResponse.json(
      {
        success: false,
        error: "アカウント選択の解除に失敗しました",
      },
      { status: 500 }
    );
  }
}
