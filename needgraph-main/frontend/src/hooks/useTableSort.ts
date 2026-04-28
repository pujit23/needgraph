import { useState, useMemo } from 'react';

export type SortDir = 'asc' | 'desc';

export interface UseTableSortReturn<T> {
  sorted: T[];
  sortKey: keyof T;
  sortDir: SortDir;
  toggleSort: (key: keyof T) => void;
}

/**
 * Generic hook for client-side table sorting.
 * Clicking the same column twice toggles direction; a new column defaults to 'desc'.
 */
export function useTableSort<T>(
  data: T[],
  defaultKey: keyof T,
  defaultDir: SortDir = 'desc',
): UseTableSortReturn<T> {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir);

  const toggleSort = (key: keyof T) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      const gt = av > bv ? 1 : -1;
      return sortDir === 'asc' ? gt : -gt;
    });
  }, [data, sortKey, sortDir]);

  return { sorted, sortKey, sortDir, toggleSort };
}
