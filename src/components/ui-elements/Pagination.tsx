"use client";

import Link from "next/link";
import { Pagination as AntdPagination } from "antd";

interface PaginationProps {
  /** クラス名 */
  className?: string;
  /** ベースクエリパラメータ */
  baseQueryParams: Record<string, string>;
  /** 総件数 */
  total: number;
  /** 現在のページ */
  current: number;
}

export function Pagination({
  className,
  baseQueryParams,
  total,
  current,
}: PaginationProps) {
  /**
   * ページURLを生成する
   * @param page ページ番号
   * @returns
   * @example
   * generateURL(1) => "?page=1"
   * generateURL(10) => "?page=10"
   */
  const generateURL = (page: number) => {
    const url = new URLSearchParams(baseQueryParams);
    url.set("page", page.toString());
    return `?${url.toString()}`;
  };

  /**
   * 表示範囲を表示する
   * @param total 総件数
   * @param range 表示範囲
   * @returns
   */
  const showTotal = (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} / ${total} 件`;

  return (
    <div className={className}>
      <AntdPagination
        current={current}
        total={total}
        pageSize={20}
        showSizeChanger={false}
        showQuickJumper={false}
        showTotal={showTotal}
        simple={false}
        itemRender={(page, type, originalElement) => {
          if (type === "page") {
            return (
              <Link href={generateURL(page)} scroll={false}>
                {page}
              </Link>
            );
          }
          if (type === "prev") {
            const prevPage = current > 1 ? current - 1 : 1;
            return (
              <Link href={generateURL(prevPage)} scroll={false}>
                {originalElement}
              </Link>
            );
          }
          if (type === "next") {
            const nextPage = current < total ? current + 1 : total;
            return (
              <Link href={generateURL(nextPage)} scroll={false}>
                {originalElement}
              </Link>
            );
          }
          return originalElement;
        }}
      />
    </div>
  );
}

