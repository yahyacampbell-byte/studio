
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DropdownProps as DayPickerDropdownProps } from "react-day-picker"
import type { Locale } from "date-fns"


import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export interface CustomCalendarProps extends Omit<React.ComponentProps<typeof DayPicker>, 'month' | 'onMonthChange'> {
  showMonthDropdown?: boolean;
  month?: Date; // Make month prop explicit for controlled component
  onMonthChange?: (date: Date) => void; // Make onMonthChange prop explicit
}


const InternalDropdownOverride: React.FC<DayPickerDropdownProps & { showMonthDropdown?: boolean }> = ({ name, showMonthDropdown, children, ...props }) => {
  if (name === 'months' && showMonthDropdown === false) {
    return null; 
  }

  const selectClassName = cn(
    "rdp-dropdown", 
    "mx-1",
    "h-7", 
    "px-1", 
    "py-0", 
    "text-xs", 
    "rounded-md",
    "border",
    "border-input", 
    "bg-background", 
    "focus:outline-none focus:ring-1 focus:ring-ring", 
    name === 'months' ? "rdp-dropdown_month" : "rdp-dropdown_year"
  );

  return (
    <select
      name={name}
      aria-label={props['aria-label']}
      className={selectClassName}
      value={props.value}
      onChange={(e) => {
        props.onChange?.(Number(e.target.value)) 
      }}
      disabled={props.disabled}
    >
      {children}
    </select>
  );
};


function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showMonthDropdown = true, 
  month: controlledMonth, // Use the controlled month prop
  onMonthChange: controlledOnMonthChange, // Use the controlled onMonthChange prop
  ...props
}: CustomCalendarProps) { 

  const componentsConfig: React.ComponentProps<typeof DayPicker>['components'] = {
    IconLeft: ({ ...rest } : React.HTMLAttributes<SVGElement>) => <ChevronLeft className="h-4 w-4" {...rest} />,
    IconRight: ({ ...rest }: React.HTMLAttributes<SVGElement>) => <ChevronRight className="h-4 w-4" {...rest} />,
    Dropdown: undefined
  };

  if ((props.captionLayout === 'dropdown' || props.captionLayout === 'dropdown-buttons')) {
    componentsConfig.Dropdown = (dropdownProps: DayPickerDropdownProps) => (
      <InternalDropdownOverride {...dropdownProps} showMonthDropdown={showMonthDropdown} />
    );
  }
  
  // If month is controlled, defaultMonth and initialFocus are ignored by DayPicker.
  // If not controlled, DayPicker manages its own state.
  const dayPickerProps = {
    ...props,
    month: controlledMonth,
    onMonthChange: controlledOnMonthChange,
  };


  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium", 
        caption_dropdowns: "flex gap-1", 
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={componentsConfig}
      {...dayPickerProps} // Spread all props, including controlled month/onMonthChange
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

