# API エラー定義書

すべての API エラーレスポンスは共通の形式に従います。
スキーマは `src/lib/validations/error.schemas.ts` で zod により定義されています。

---

## 共通レスポンス形状

```ts
{
  success: false;          // 常に false
  error: string;           // 人間向けメッセージ
  code: ApiErrorCode;      // 機械判定用コード
  issues?: ValidationIssue[]; // VALIDATION_ERROR のときのみ
}
```

`ApiErrorCode` は以下のいずれか：

- `VALIDATION_ERROR`
- `INVALID_JSON`
- `NOT_FOUND`
- `INTERNAL_ERROR`
- `BAD_REQUEST` / `UNAUTHORIZED` / `FORBIDDEN` / `CONFLICT`（将来用に予約）

---

## HTTP ステータスコード一覧

| Status | code | 発生条件 | 例 |
|--------|------|---------|----|
| 400 | `VALIDATION_ERROR` | zod スキーマでのバリデーション失敗 | `title` が空 |
| 400 | `INVALID_JSON` | リクエストボディが JSON としてパース不可 | 不正な JSON |
| 404 | `NOT_FOUND` | 対象リソースが存在しない／論理削除済み | `GET /api/tasks/[id]` で未存在 ID |
| 500 | `INTERNAL_ERROR` | サーバー内部の例外 | DB 接続失敗等 |

---

## 400 VALIDATION_ERROR

zod のバリデーションに失敗したとき。

**スキーマ**: `validationErrorResponseSchema`

```json
{
  "success": false,
  "error": "タイトルを入力してください",
  "code": "VALIDATION_ERROR",
  "issues": [
    { "path": "title", "message": "タイトルを入力してください" },
    { "path": "accountId", "message": "アカウントIDを指定してください" }
  ]
}
```

| フィールド | 説明 |
|---|---|
| `error` | `issues[0].message`（先頭エラーを代表値として採用）|
| `issues[].path` | 不正だったフィールドのパス（ネストはドット区切り）|
| `issues[].message` | 各フィールドに対応するエラーメッセージ |

---

## 400 INVALID_JSON

リクエストボディが JSON としてパースできなかったとき。

**スキーマ**: `invalidJsonErrorResponseSchema`

```json
{
  "success": false,
  "error": "リクエストボディが不正なJSONです",
  "code": "INVALID_JSON"
}
```

`issues` は含まれません。

---

## 404 NOT_FOUND

ID 指定のリソースが存在しないか論理削除済み（`deletedAt != null`）の場合。

**スキーマ**: `notFoundErrorResponseSchema`

```json
{
  "success": false,
  "error": "タスクが見つかりません",
  "code": "NOT_FOUND"
}
```

**発生エンドポイント**

- `GET /api/tasks/[id]`
- `GET /api/accounts/[id]`

---

## 500 INTERNAL_ERROR

サーバー内部で予期しない例外が発生したとき。

**スキーマ**: `internalErrorResponseSchema`

```json
{
  "success": false,
  "error": "タスクの取得に失敗しました",
  "code": "INTERNAL_ERROR"
}
```

すべての API ルートで `try/catch` 配下で捕捉し、`internalErrorResponse(message)` ヘルパー経由で返します。
詳細なスタックはサーバーログにのみ出力し、レスポンスボディには含めません。

---

## エンドポイント別 発生しうるエラー

| エンドポイント | 400 V_E | 400 I_J | 404 | 500 |
|---|:--:|:--:|:--:|:--:|
| GET /api/tasks | ✓ | — | — | ✓ |
| POST /api/tasks | ✓ | ✓ | — | ✓ |
| GET /api/tasks/[id] | — | — | ✓ | ✓ |
| PUT /api/tasks/[id] | ✓ | ✓ | — | ✓ |
| DELETE /api/tasks/[id] | — | — | — | ✓ |
| GET /api/accounts | — | — | — | ✓ |
| POST /api/accounts | ✓ | ✓ | — | ✓ |
| GET /api/accounts/[id] | — | — | ✓ | ✓ |
| PUT /api/accounts/[id] | ✓ | ✓ | — | ✓ |
| POST /api/accounts/select | ✓ | ✓ | — | ✓ |
| DELETE /api/accounts/select | — | — | — | ✓ |

凡例: V_E = `VALIDATION_ERROR`, I_J = `INVALID_JSON`

---

## クライアント側の取り扱い指針

```ts
type ApiError = {
  success: false;
  error: string;
  code: "VALIDATION_ERROR" | "INVALID_JSON" | "NOT_FOUND" | "INTERNAL_ERROR";
  issues?: { path: string; message: string }[];
};

// 例: フォームでのフィールド単位エラー表示
if (res.code === "VALIDATION_ERROR") {
  for (const { path, message } of res.issues ?? []) {
    setFieldError(path, message);
  }
}
```

ユーザー向けに表示する文字列は `error` フィールドをそのまま採用すれば日本語で取得できます。
