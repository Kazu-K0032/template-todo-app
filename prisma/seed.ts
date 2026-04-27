import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { PrismaClient } from "../src/generated/prisma/client";

config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 シードデータの作成を開始...");

  // 既存のアカウントを削除（テーブルが存在する場合のみ）
  try {
    await prisma.account.deleteMany();
  } catch (error) {
    console.log("⚠️ アカウントテーブルが存在しないため、スキップします");
  }

  // prisma/seed/フォルダ内のすべてのSQLファイルを読み込み
  const seedDir = join(__dirname, "seed");
  const sqlFiles = readdirSync(seedDir).filter((file) => file.endsWith(".sql"));

  console.log(`📁 ${sqlFiles.length}個のSQLファイルを発見しました:`, sqlFiles);

  for (const sqlFile of sqlFiles) {
    console.log(`📄 ${sqlFile} を実行中...`);
    const sqlPath = join(seedDir, sqlFile);
    const sqlContent = readFileSync(sqlPath, "utf-8");

    try {
      // SQLを個別の文に分割して実行
      const statements = sqlContent
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          await prisma.$executeRawUnsafe(statement);
        }
      }
      console.log(`✅ ${sqlFile} の実行が完了しました`);
    } catch (error) {
      console.log(
        `⚠️ ${sqlFile} の実行をスキップしました:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  console.log("🎉 すべてのシードデータの投入が完了しました");
}

main()
  .catch((e) => {
    console.error("❌ シードデータの作成に失敗:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
