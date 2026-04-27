# API バリデーション定義書

すべての API リクエストに対する入力バリデーションを zod スキーマで定義します。
スキーマは `src/lib/validations/` 配下にあり、API ルートと OpenAPI ドキュメントの双方で同一スキーマを参照します。

正規の機械可読仕様書は `public/openapi.json`（`pnpm openapi:generate` で再生成）。
この文書は人間向けの要約です。

---

## 共通仕様

| 項目 | 内容 |
|------|------|
| リクエスト形式 | `application/json`（ボディがあるエンドポイント）|
| レスポンス形式 | `application/json` |
| 文字数カウント | `String.prototype.length`（UTF-16 コードユニット）|
| 文字列の前後空白 | `trim()` で除去された後にバリデーション |
| 失敗時 | HTTP 400 + [VALIDATION_ERROR](errors.md#400-validation_error) |

---

## Tasks

### `POST /api/tasks` — タスク作成

**Body**: `createTaskSchema`

| フィールド | 型 | 制約 | 説明 |
|---|---|---|---|
| `title` | string | 必須 / trim 後 1〜100 文字 | タスクタイトル |
| `description` | string | 必須 / trim 後 0〜1000 文字 | タスク説明（空文字可）|
| `accountId` | string | 必須 / 1 文字以上 | 所属アカウント ID |

**エラーメッセージ例**

- `タイトルを入力してください`（空または空白のみ）
- `タイトルは100文字以内で入力してください`
- `説明は1000文字以内で入力してください`
- `アカウントIDを指定してください`

---

### `GET /api/tasks` — タスク一覧取得

**Query**: `taskQuerySchema`

| パラメータ | 型 | 制約 | デフォルト | 説明 |
|---|---|---|---|---|
| `accountId` | string | 必須 | — | 対象アカウント ID |
| `page` | number | 整数 / 1 以上 | `1` | ページ番号 |
| `limit` | number | 整数 / 1〜100 | `8` | 1 ページあたり件数 |

`page` / `limit` は文字列で受け取り、`z.coerce.number()` で数値化されます。

---

### `PUT /api/tasks/[id]` — タスク更新

**Path Params**: `taskIdParamsSchema` — `id: string`

**Body**: `updateTaskSchema`（部分更新）

| フィールド | 型 | 制約 | 説明 |
|---|---|---|---|
| `title` | string? | 1〜100 文字 | タイトル |
| `description` | string? | 0〜1000 文字 | 説明 |
| `status` | enum? | `TODO` \| `IN_PROGRESS` \| `DONE` | ステータス |

**追加ルール**: 全フィールド省略不可（少なくとも 1 項目を含める）

**エラーメッセージ例**

- `更新する項目を1つ以上指定してください`

---

### `GET /api/tasks/[id]` / `DELETE /api/tasks/[id]`

**Path Params**: `taskIdParamsSchema` — `id: string`（ボディ・クエリなし）

---

## Accounts

### `POST /api/accounts` — アカウント作成

**Body**: `createAccountSchema`

| フィールド | 型 | 制約 | 説明 |
|---|---|---|---|
| `accountName` | string | 必須 / trim 後 1〜50 文字 | アカウント名 |
| `icon` | string | 必須 / 1 文字以上 | アイコン識別子または URL |

---

### `PUT /api/accounts/[id]` — アカウント更新

**Path Params**: `accountIdParamsSchema` — `id: string`

**Body**: `updateAccountSchema`（`createAccountSchema` と同一形式）

---

### `POST /api/accounts/select` — アカウント選択

**Body**: `selectAccountSchema`

| フィールド | 型 | 制約 | 説明 |
|---|---|---|---|
| `accountId` | string | 必須 / 1 文字以上 | 選択するアカウント ID |

---

### `DELETE /api/accounts/select` — アカウント選択解除

ボディ・クエリなし

---

### `GET /api/accounts` / `GET /api/accounts/[id]`

入力バリデーションなし（パスパラメータの `id: string` のみ）

---

## スキーマ参照

| スキーマ | 定義ファイル | 用途 |
|---|---|---|
| `createTaskSchema` | `src/lib/validations/task.schemas.ts` | POST /api/tasks ボディ |
| `updateTaskSchema` | 同上 | PUT /api/tasks/[id] ボディ |
| `taskQuerySchema` | 同上 | GET /api/tasks クエリ |
| `taskIdParamsSchema` | 同上 | パスパラメータ |
| `taskStatusSchema` | 同上 | 共通 enum |
| `createAccountSchema` | `src/lib/validations/account.schemas.ts` | POST /api/accounts ボディ |
| `updateAccountSchema` | 同上 | PUT /api/accounts/[id] ボディ |
| `selectAccountSchema` | 同上 | POST /api/accounts/select ボディ |
| `accountIdParamsSchema` | 同上 | パスパラメータ |

スキーマから TypeScript 型を取得する場合は `z.infer<typeof xxxSchema>` を利用してください。
各スキーマの末尾で `Input` 型がエクスポート済みです（例: `CreateTaskInput`）。
