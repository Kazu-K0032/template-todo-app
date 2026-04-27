/**
 * タスク用 zod スキーマのテスト
 */
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from "./task.schemas";

describe("createTaskSchema", () => {
  it("正常な入力をパースできる", () => {
    const result = createTaskSchema.safeParse({
      title: "買い物に行く",
      description: "牛乳と卵を買う",
      accountId: "acc_1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("買い物に行く");
    }
  });

  it("title が空文字の場合は拒否する", () => {
    const result = createTaskSchema.safeParse({
      title: "",
      description: "",
      accountId: "acc_1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("タイトルを入力してください");
    }
  });

  it("title が前後空白のみの場合は拒否する", () => {
    const result = createTaskSchema.safeParse({
      title: "   ",
      description: "",
      accountId: "acc_1",
    });
    expect(result.success).toBe(false);
  });

  it("title が101文字以上の場合は拒否する", () => {
    const result = createTaskSchema.safeParse({
      title: "あ".repeat(101),
      description: "",
      accountId: "acc_1",
    });
    expect(result.success).toBe(false);
  });

  it("accountId が欠けている場合は拒否する", () => {
    const result = createTaskSchema.safeParse({
      title: "テスト",
      description: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateTaskSchema", () => {
  it("title だけ更新できる", () => {
    const result = updateTaskSchema.safeParse({ title: "新しいタイトル" });
    expect(result.success).toBe(true);
  });

  it("status だけ更新できる", () => {
    const result = updateTaskSchema.safeParse({ status: "DONE" });
    expect(result.success).toBe(true);
  });

  it("status に未定義の値は拒否する", () => {
    const result = updateTaskSchema.safeParse({ status: "UNKNOWN" });
    expect(result.success).toBe(false);
  });

  it("空オブジェクトは拒否する", () => {
    const result = updateTaskSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "更新する項目を1つ以上指定してください"
      );
    }
  });
});

describe("taskQuerySchema", () => {
  it("文字列のページ番号を数値に変換する", () => {
    const result = taskQuerySchema.safeParse({
      accountId: "acc_1",
      page: "2",
      limit: "10",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("page/limit を省略するとデフォルト値が入る", () => {
    const result = taskQuerySchema.safeParse({ accountId: "acc_1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(8);
    }
  });

  it("accountId が欠けている場合は拒否する", () => {
    const result = taskQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("limit が上限を超える場合は拒否する", () => {
    const result = taskQuerySchema.safeParse({
      accountId: "acc_1",
      limit: "999",
    });
    expect(result.success).toBe(false);
  });
});
