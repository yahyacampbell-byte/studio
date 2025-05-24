
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, type CustomCalendarProps } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { CaptionLayout } from "react-day-picker"

interface DatePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  disabled?: (date: Date) => boolean;
  fromYear?: number;
  toYear?: number;
  captionLayout?: CaptionLayout; // Use CaptionLayout from react-day-picker
  showMonthDropdown?: boolean;
}

export function DatePicker({
  value,
  onChange,
  disabled,
  fromYear,
  toYear,
  captionLayout = "dropdown-buttons", // Default captionLayout
  showMonthDropdown = true
}: DatePickerProps) {

  const [displayedMonth, setDisplayedMonth] = React.useState(() => {
    if (value) {
      return new Date(value.getFullYear(), value.getMonth(), 1);
    }
    const relevantYear = toYear || new Date().getFullYear();
    // Ensure the default displayed month is within fromYear/toYear range if provided
    if (fromYear && relevantYear < fromYear) {
      return new Date(fromYear, 0, 1);
    }
    if (toYear && relevantYear > toYear) {
      return new Date(toYear, 11, 1);
    }
    return new Date(relevantYear, 0, 1);
  });

  React.useEffect(() => {
    if (value) {
      const newMonthBasedOnValue = new Date(value.getFullYear(), value.getMonth(), 1);
      if (newMonthBasedOnValue.getTime() !== displayedMonth.getTime()) {
        // Check if newMonthBasedOnValue is within the fromYear/toYear range
        let adjustedMonth = newMonthBasedOnValue;
        if (fromYear && newMonthBasedOnValue.getFullYear() < fromYear) {
          adjustedMonth = new Date(fromYear, 0, 1);
        }
        if (toYear && newMonthBasedOnValue.getFullYear() > toYear) {
          adjustedMonth = new Date(toYear, 11, 1);
        }
        if (displayedMonth.getTime() !== adjustedMonth.getTime()){
             setDisplayedMonth(adjustedMonth);
        }
      }
    } else {
      // If value is cleared, reset displayedMonth to a default based on toYear/fromYear
      const defaultResetYear = toYear || new Date().getFullYear();
      let defaultResetDate = new Date(defaultResetYear, 0, 1);
      if (fromYear && defaultResetYear < fromYear) {
        defaultResetDate = new Date(fromYear, 0, 1);
      }
      if (toYear && defaultResetYear > toYear) {
         defaultResetDate = new Date(toYear, 11, 1);
      }
       if (displayedMonth.getTime() !== defaultResetDate.getTime()) {
         setDisplayedMonth(defaultResetDate);
       }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, fromYear, toYear]); // displayedMonth is intentionally omitted

  const handleMonthNavigation = (newlyNavigatedMonth: Date) => {
    const firstOfNavigatedMonth = new Date(newlyNavigatedMonth.getFullYear(), newlyNavigatedMonth.getMonth(), 1);
     if (displayedMonth.getTime() !== firstOfNavigatedMonth.getTime()) {
        setDisplayedMonth(firstOfNavigatedMonth);
     }
  };

  const handleDateSelection = (selectedDate?: Date) => {
    onChange(selectedDate);
    if (selectedDate) {
      const monthOfSelectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      if (displayedMonth.getTime() !== monthOfSelectedDate.getTime()) {
        setDisplayedMonth(monthOfSelectedDate);
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          // mode="single" // Removed: Calendar component internally sets mode="single" for DayPicker
          selected={value}
          onSelect={handleDateSelection}
          disabled={disabled}
          captionLayout={captionLayout}
          fromYear={fromYear}
          toYear={toYear}
          showMonthDropdown={showMonthDropdown}
          month={displayedMonth}
          onMonthChange={handleMonthNavigation}
        />
      </PopoverContent>
    </Popover>
  )
}
