
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

interface DatePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  disabled?: (date: Date) => boolean;
  fromYear?: number;
  toYear?: number;
  captionLayout?: CustomCalendarProps['captionLayout'];
  showMonthDropdown?: boolean;
}

export function DatePicker({ 
  value, 
  onChange, 
  disabled, 
  fromYear, 
  toYear, 
  captionLayout = "buttons", 
  showMonthDropdown = true 
}: DatePickerProps) {
  
  // Initialize displayedMonth ensuring it's the first of the month
  const [displayedMonth, setDisplayedMonth] = React.useState(() => {
    if (value) {
      return new Date(value.getFullYear(), value.getMonth(), 1);
    }
    // Default to January of the `toYear` or current year if `toYear` is not provided
    return new Date(toYear || new Date().getFullYear(), 0, 1); 
  });

  // Effect to sync displayedMonth if the EXTERNAL `value` prop changes
  React.useEffect(() => {
    if (value) {
      const newMonthBasedOnValue = new Date(value.getFullYear(), value.getMonth(), 1);
      if (newMonthBasedOnValue.getTime() !== displayedMonth.getTime()) {
        setDisplayedMonth(newMonthBasedOnValue);
      }
    } else {
      // If value is cleared (becomes undefined), reset displayedMonth to a sensible default.
      // This ensures the calendar doesn't get stuck on a month if the date is cleared externally.
      const defaultResetDate = new Date(toYear || new Date().getFullYear(), 0, 1);
       if (displayedMonth.getTime() !== defaultResetDate.getTime()) {
         setDisplayedMonth(defaultResetDate);
       }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, toYear]); // displayedMonth is intentionally omitted to prevent loops with internal navigation

  const handleMonthNavigation = (newlyNavigatedMonth: Date) => {
    // This function is called by DayPicker's onMonthChange (triggered by arrows or our custom dropdown)
    const firstOfNavigatedMonth = new Date(newlyNavigatedMonth.getFullYear(), newlyNavigatedMonth.getMonth(), 1);
    if (displayedMonth.getTime() !== firstOfNavigatedMonth.getTime()) {
      setDisplayedMonth(firstOfNavigatedMonth);
    }
  };

  const handleDateSelection = (selectedDate?: Date) => {
    onChange(selectedDate); // Call the prop from react-hook-form (or parent component)
    if (selectedDate) {
      // When a date is selected, update displayedMonth to the month of the selected date
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
          mode="single"
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
