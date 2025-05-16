
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

export function DatePicker({ value, onChange, disabled, fromYear, toYear, captionLayout = "buttons", showMonthDropdown = true }: DatePickerProps) {
  const currentYear = new Date().getFullYear();

  // State for the displayed month, controlled by DatePicker
  const [displayedMonth, setDisplayedMonth] = React.useState(
    value || new Date(toYear || currentYear, 0, 1) // Default to first day of the month of `toYear` or current year
  );

  // Effect to update displayedMonth if the selected value (prop `value`) changes externally
  React.useEffect(() => {
    if (value) {
      // Check if the new value's month is different from the current displayedMonth
      // This check helps prevent unnecessary updates if the month is already correct
      if (value.getFullYear() !== displayedMonth.getFullYear() || value.getMonth() !== displayedMonth.getMonth()) {
        setDisplayedMonth(new Date(value.getFullYear(), value.getMonth(), 1));
      }
    } else {
      // If value is cleared, reset displayedMonth to a default
      // (e.g., first month of `toYear` or current year)
      // Check if displayedMonth is already the default to prevent loop if toYear/currentYear changes unnecessarily
      const defaultResetDate = new Date(toYear || currentYear, 0, 1);
      if (displayedMonth.getFullYear() !== defaultResetDate.getFullYear() || displayedMonth.getMonth() !== defaultResetDate.getMonth()) {
        setDisplayedMonth(defaultResetDate);
      }
    }
  }, [value, toYear, currentYear]); // Removed displayedMonth from dependencies
  
  const handleDateSelect = (selectedDate?: Date) => {
    onChange(selectedDate); // Propagate to form hook
    // When a date is selected, DayPicker itself usually navigates its view.
    // If `month` prop is controlled, we might need to update `displayedMonth` here too
    // to ensure the calendar view snaps to the selected date's month.
    if (selectedDate) {
        setDisplayedMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
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
          onSelect={handleDateSelect}
          disabled={disabled}
          captionLayout={captionLayout}
          fromYear={fromYear}
          toYear={toYear}
          showMonthDropdown={showMonthDropdown}
          
          // Controlled month view
          month={displayedMonth}
          onMonthChange={setDisplayedMonth}
          // initialFocus is ignored by react-day-picker when `month` is controlled.
        />
      </PopoverContent>
    </Popover>
  )
}
