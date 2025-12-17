import { useState, useMemo, useCallback } from "react";

interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  initialLimit?: number;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirst: () => void;
  goToLast: () => void;
}

export function usePagination({
  totalItems,
  initialPage = 1,
  initialLimit = 10,
}: UsePaginationProps): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const totalPages = useMemo(
    () => Math.ceil(totalItems / limit) || 1,
    [totalItems, limit]
  );

  const startIndex = useMemo(() => (page - 1) * limit, [page, limit]);
  const endIndex = useMemo(
    () => Math.min(startIndex + limit, totalItems),
    [startIndex, limit, totalItems]
  );

  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const handleSetPage = useCallback(
    (newPage: number) => {
      const validPage = Math.max(1, Math.min(newPage, totalPages));
      setPage(validPage);
    },
    [totalPages]
  );

  const handleSetLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  const nextPage = useCallback(() => {
    if (hasNextPage) setPage((p) => p + 1);
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) setPage((p) => p - 1);
  }, [hasPrevPage]);

  const goToFirst = useCallback(() => setPage(1), []);
  const goToLast = useCallback(() => setPage(totalPages), [totalPages]);

  return {
    page,
    limit,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    setPage: handleSetPage,
    setLimit: handleSetLimit,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
  };
}
