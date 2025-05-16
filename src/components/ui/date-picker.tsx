
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, type CalendarProps } from "@/components/ui/calendar" // Ensure CalendarProps is imported
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
  captionLayout?: CalendarProps['captionLayout'];
}

export function DatePicker({ value, onChange, disabled, fromYear, toYear, captionLayout = "buttons" }: DatePickerProps) {
  const currentYear = new Date().getFullYear();
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
          onSelect={onChange}
          disabled={disabled}
          captionLayout={captionLayout}
          fromYear={fromYear}
          toYear={toYear}
          defaultMonth={value || new Date(currentYear - 25, 0)} // Default to ~25 years ago if no value
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
