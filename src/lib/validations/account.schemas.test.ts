/**
 * アカウント用 zod スキーマのテスト
 */
import {
  createAccountSchema,
  selectAccountSchema,
} from "./account.schemas";

describe("createAccountSchema", () => {
  it("正常な入力をパースできる", () => {
    const result = createAccountSchema.safeParse({
      accountName: "山田太郎",
      icon: "user",
    });
    expect(result.success).toBe(true);
  });

  it("accountName が空の場合は拒否する", () => {
    const result = createAccountSchema.safeParse({
      accountName: "",
      icon: "user",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "アカウント名を入力してください"
      );
    }
  });

  it("accountName が51文字以上の場合は拒否する", () => {
    const result = createAccountSchema.safeParse({
      accountName: "あ".repeat(51),
      icon: "user",
    });
    expect(result.success).toBe(false);
  });

  it("icon が欠けている場合は拒否する", () => {
    const result = createAccountSchema.safeParse({
      accountName: "山田太郎",
    });
    expect(result.success).toBe(false);
  });

  it("前後の空白を除去する", () => {
    const result = createAccountSchema.safeParse({
      accountName: "  山田太郎  ",
      icon: "user",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accountName).toBe("山田太郎");
    }
  });
});

describe("selectAccountSchema", () => {
  it("正常な accountId を受け付ける", () => {
    const result = selectAccountSchema.safeParse({ accountId: "acc_1" });
    expect(result.success).toBe(true);
  });

  it("accountId が空の場合は拒否する", () => {
    const result = selectAccountSchema.safeParse({ accountId: "" });
    expect(result.success).toBe(false);
  });
});
