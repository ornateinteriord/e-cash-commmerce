import * as React from "react";
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import moment from "moment";

interface DateFilterComponentProps {
  onSelect: (date: Date) => void;
  mode?: "single" | "range" | "multiple";
  width?: string;
  needCurrent?: boolean;
  disabled?: boolean;
  selectedDate?: Date;
}

const DateFilterComponent = ({
  onSelect,
  mode = "single",
  width = "240px",
  needCurrent = false,
  disabled = false,
  selectedDate
}: DateFilterComponentProps) => {
  const [date, setDate] = React.useState<Date | DateRange | Date[] | undefined>(
    selectedDate ?? (needCurrent ? new Date() : undefined)
  );
  const [open, setOpen] = React.useState(false);


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          style={{ border: "1px solid black", width }}
          className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon />
          {date ? format(date as Date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent className="w-auto p-0" align="start" style={{ zIndex: 9999 }}>
          <Calendar
            mode={mode as "single"}
            selected={date as Date}
            onSelect={(selectedDate: Date | DateRange | undefined) => {
              setDate(selectedDate);
              onSelect(selectedDate as Date);
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      )}
    </Popover>
  );
};

export default DateFilterComponent;

interface Props {
  date: string | null;
  setDate: (value: string) => void;
  label: string
}

export const parseAnyDate = (dateVal: any): Date | null => {
  if (!dateVal) return null;
  if (dateVal instanceof Date) {
    return isNaN(dateVal.getTime()) ? null : dateVal;
  }
  if (typeof dateVal === 'number') {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    if (!trimmed || trimmed === '-' || trimmed === 'N/A' || trimmed === 'null' || trimmed === 'undefined') {
      return null;
    }
    // Check if numeric timestamp as string
    if (/^\d{10,13}$/.test(trimmed)) {
      const d = new Date(Number(trimmed));
      if (!isNaN(d.getTime())) return d;
    }
    // Check if DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
    // Standard ISO or YYYY-MM-DD parse
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

export const isWithinDateRange = (
  itemDateRaw: any,
  fromDateStr: string | null | undefined,
  toDateStr: string | null | undefined
): boolean => {
  if (!fromDateStr && !toDateStr) return true;

  const itemDate = parseAnyDate(itemDateRaw);
  if (!itemDate) return false;

  if (fromDateStr) {
    const fromDate = parseAnyDate(fromDateStr);
    if (fromDate) {
      fromDate.setHours(0, 0, 0, 0);
      if (itemDate < fromDate) return false;
    }
  }

  if (toDateStr) {
    const toDate = parseAnyDate(toDateStr);
    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
      if (itemDate > toDate) return false;
    }
  }

  return true;
};

export const getItemDateValue = (item: any): any => {
  if (!item || typeof item !== 'object') return null;
  return (
    item.Date_of_joining ||
    item.transaction_date ||
    item.created_at ||
    item.createdAt ||
    item.date ||
    item.payout_date ||
    item.dateOfOpening ||
    item.roi_start_date ||
    item.updatedAt ||
    item.updated_at
  );
};

export const filterByDateRange = <T,>(
  items: T[],
  fromDate: string | null | undefined,
  toDate: string | null | undefined,
  getDateFn?: (item: T) => any
): T[] => {
  if (!items || !Array.isArray(items)) return [];
  if (!fromDate && !toDate) return items;

  return items.filter((item: any) => {
    const dateVal = getDateFn ? getDateFn(item) : getItemDateValue(item);
    return isWithinDateRange(dateVal, fromDate, toDate);
  });
};

export const MuiDatePicker: React.FC<Props> = ({ date, setDate, label }) => {
  const handleChange = (newDate: Date | null) => {
    if (newDate && !isNaN(newDate.getTime())) {
      const formatted = moment(newDate).format('YYYY-MM-DD'); // yyyy-mm-dd
      setDate(formatted);
    } else {
      setDate('');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={date && !isNaN(new Date(date).getTime()) ? new Date(date) : null}
        onChange={handleChange}
        slotProps={{
          textField: {
            fullWidth: true,
            size: "small",
            sx: {
              "& label": {
                color: "#0a2558",
              },
              "& label.Mui-focused": {
                color: "#0a2558",
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};
