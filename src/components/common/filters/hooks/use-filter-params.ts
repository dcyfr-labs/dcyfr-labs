"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface UseFilterParamsOptions {
  basePath: string;
  resetPagination?: boolean;
}

export function useFilterParams({ basePath, resetPagination = true }: UseFilterParamsOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback((key: string, value: string | null, defaultValue?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== defaultValue) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (resetPagination) {
      params.delete("page");
    }

    router.push(`${basePath}?${params.toString()}`);
  }, [searchParams, router, basePath, resetPagination]);

  const toggleMultiParam = useCallback((key: string, value: string, selected: string[]) => {
    const params = new URLSearchParams(searchParams.toString());

    let newValues: string[];
    if (selected.includes(value)) {
      newValues = selected.filter((v) => v !== value);
    } else {
      newValues = [...selected, value];
    }

    if (newValues.length > 0) {
      params.set(key, newValues.join(","));
    } else {
      params.delete(key);
    }

    if (resetPagination) {
      params.delete("page");
    }

    router.push(`${basePath}?${params.toString()}`);
  }, [searchParams, router, basePath, resetPagination]);

  const clearAll = useCallback(() => {
    router.push(basePath);
  }, [router, basePath]);

  const getParam = useCallback((key: string): string | null => {
    return searchParams.get(key);
  }, [searchParams]);

  return { updateParam, toggleMultiParam, clearAll, getParam };
}
