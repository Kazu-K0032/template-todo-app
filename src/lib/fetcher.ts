import useSWR, { mutate } from "swr";
import type { SWRConfiguration } from "swr";

export { mutate };

/**
 * アプリ全体のデータ取得ルールを決める設定箱
 */
interface UseApiOptions extends SWRConfiguration {
  // 特定の条件が満たされたらデータを取得するかどうか(true: 取得する, false: 取得しない)
  enabled?: boolean;
}

/**
 * SWRを使ったAPI通信用のカスタムフック
 * @param key データのキー
 * @param fetcher
 * @param options
 * @returns {data: T | undefined, error: Error | null, isLoading: boolean}
 * @returns {data: T | undefined} data データ
 * @returns {error: Error | null} error エラー
 * @returns {isLoading: boolean} isLoading ローディング中かどうか(true: ローディング中, false: ローディング完了)
 */
export const useApi = <T>(key: string | null, fetcher: (url: string) => Promise<T>, options?: UseApiOptions) => {
  const { enabled = true, ...swrOptions } = options || {}
  const { data, error, isLoading } = useSWR(
    enabled ? key : null,
    fetcher,
    {
      revalidateOnFocus: false, // タブ切り替えでは再取得しない
      revalidateOnReconnect: false, // 再接続時にデータを取得しない(ネットワークエラーなどで再接続した場合に再取得しない)
      deduupingInterval: 2000, // 2秒ごとにデータを同じキーで取得しない
      ...swrOptions,
    }
  )
  return { data, error, isLoading }
}

/**
 * API通信用のフェッチ関数
 * @param url
 * @returns
 */
export const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * SWRキャッシュを更新する関数
 * @param key 更新するキャッシュのキー
 * @returns Promise<void>
 */
export const updateCache = async (key: string) => {
  await mutate(key);
};

/**
 * 楽観的更新用のヘルパー関数
 * @param key キャッシュのキー
 * @param updateFn データを更新する関数
 * @param revalidate 再検証するかどうか
 */
export const optimisticUpdate = async <T>(
  key: string,
  updateFn: (data: T | undefined) => T,
  revalidate = true
) => {
  await mutate(key, updateFn, { revalidate, populateCache: true });
};
