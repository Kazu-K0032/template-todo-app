import { prisma } from "@/lib/prisma";
import { Pagination } from "@/components/ui-elements/Pagination";
import { Prisma, Task } from "@prisma/client";

type Params = Promise<{ [key: string]: string | string[] | undefined}>

export default async function ChecksPage(props: {
  searchParams: Params
}) {
  const searchParams = await props.searchParams;
  const page = Number.parseInt(searchParams.page as string, 10) || 1;

  // 1ページあたりの表示数
  const MAX_TASKS_PER_PAGE = 20;
  // スキップ数と取得数
  const skip = (page - 1) * MAX_TASKS_PER_PAGE;

  // where条件を型安全にする
  const whereCondition: Prisma.TaskWhereInput = {
    deletedAt: null,
  }
  const totalTasks = await prisma.task.count({
    where: whereCondition,
  })

  // findManyの引数を型安全にする
  const findManyArgs: Prisma.TaskFindManyArgs = {
    skip,
    take: MAX_TASKS_PER_PAGE,
    where: whereCondition,
    orderBy: {
      createdAt: "desc",
    }
  }

  // ページネーション付きでデータ取得
  const tasks: Task[] = await prisma.task.findMany(findManyArgs)
  // 総ページ数を計算
  const totalPages = Math.ceil(totalTasks / MAX_TASKS_PER_PAGE)

  return (
    <div className="p-8">
      <ul className="list-disc list-inside">
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
      { /** ページネーション */}
      {totalPages > 1 && (
        <Pagination
          className="mt-8"
          baseQueryParams={searchParams as Record<string, string>}
          total={totalTasks}
          current={page}
        />
      )}
    </div>
  );
}
