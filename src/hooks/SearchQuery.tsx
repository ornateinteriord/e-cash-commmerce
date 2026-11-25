import { useState, useMemo, useEffect } from 'react';
import { isWithinDateRange, getItemDateValue } from '../components/common/DateFilterComponent';

export interface UseSearchOptions<T> {
  getDateFn?: (item: T) => any;
}

const useSearch = <T extends Record<string, any>>(data: T[], options?: UseSearchOptions<T>) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [appliedDates, setAppliedDates] = useState<{ from: string | null; to: string | null }>({
    from: null,
    to: null,
  });

  // When both fromDate and toDate are empty/cleared, automatically reset the applied filter
  useEffect(() => {
    if (!fromDate && !toDate && (appliedDates.from || appliedDates.to)) {
      setAppliedDates({ from: null, to: null });
    }
  }, [fromDate, toDate, appliedDates.from, appliedDates.to]);

  const searchKeys = useMemo(() => 
    data?.length > 0 ? (Object.keys(data[0]) as (keyof T)[]) : [], 
    [data]
  );

  const handleDateSearch = () => {
    setAppliedDates({ from: fromDate || null, to: toDate || null });
  };

  const handleDateReset = () => {
    setFromDate(null);
    setToDate(null);
    setAppliedDates({ from: null, to: null });
  };

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const activeFrom = appliedDates.from;
    const activeTo = appliedDates.to;
    const hasDateFilter = Boolean(activeFrom || activeTo);

    return data.filter((item) => {
      // 1. Text search
      if (normalizedQuery) {
        const matchesQuery = searchKeys.some((key) => {
          const value = item[key];
          return value && String(value).toLowerCase().includes(normalizedQuery);
        });
        if (!matchesQuery) return false;
      }

      // 2. Date range filter
      if (hasDateFilter) {
        const dateVal = options?.getDateFn ? options.getDateFn(item) : getItemDateValue(item);
        if (!isWithinDateRange(dateVal, activeFrom, activeTo)) {
          return false;
        }
      }

      return true;
    });
  }, [data, searchKeys, searchQuery, appliedDates.from, appliedDates.to, options]);

  return {
    searchQuery,
    setSearchQuery,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    appliedDates,
    handleDateSearch,
    handleDateReset,
    filteredData,
  };
};

export default useSearch;
