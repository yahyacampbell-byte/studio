
"use client"

import * as React from "react"
import type { ChangeEventHandler, CSSProperties, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DropdownProps as DayPickerDropdownProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export interface CustomCalendarProps extends Omit<React.ComponentProps<typeof DayPicker>, 'month' | 'onMonthChange'> {
  showMonthDropdown?: boolean;
  month?: Date;
  onMonthChange?: (date: Date) => void;
}

const InternalDropdownOverride: React.FC<
  DayPickerDropdownProps & {
    showMonthDropdown?: boolean;
    topLevelOnMonthChange?: (date: Date) => void;
    currentDisplayMonth?: Date;
    // children is implicitly part of DayPickerDropdownProps or React.FC if needed
  }
> = (props) => {
  const {
    name,
    value,
    "aria-label": ariaLabel,
    // Custom props
    showMonthDropdown,
    topLevelOnMonthChange,
    currentDisplayMonth,
    children, // These are the <option> elements from react-day-picker
  } = props;

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

  if (name === 'months') {
    if (showMonthDropdown === false) { // Explicitly check for false
      return null; // Hide month dropdown
    }
    return (
      <select
        name={name}
        aria-label={ariaLabel}
        className={selectClassName}
        value={value}
        onChange={(e) => {
          const newMonth = Number(e.target.value);
          if (topLevelOnMonthChange && currentDisplayMonth) {
            if (!isNaN(newMonth)) {
              const currentYear = currentDisplayMonth.getFullYear();
              topLevelOnMonthChange(new Date(currentYear, newMonth, 1));
            } else {
              console.warn('Calendar: Invalid month selected:', e.target.value);
            }
          } else {
            console.warn('Calendar: Missing topLevelOnMonthChange or currentDisplayMonth in month dropdown.');
          }
        }}
        // react-day-picker handles disabling options based on from/toMonth etc.
      >
        {children}
      </select>
    );
  }

  if (name === 'years') {
    return (
      <select
        name={name}
        aria-label={ariaLabel}
        className={selectClassName}
        value={value}
        onChange={(e) => {
          const newYear = Number(e.target.value);
          if (topLevelOnMonthChange && currentDisplayMonth) {
            if (!isNaN(newYear)) {
              const currentMonth = currentDisplayMonth.getMonth();
              topLevelOnMonthChange(new Date(newYear, currentMonth, 1));
            } else {
              console.warn('Calendar: Invalid year selected:', e.target.value);
            }
          } else {
            console.warn('Calendar: Missing topLevelOnMonthChange or currentDisplayMonth in year dropdown.');
          }
        }}
        // react-day-picker handles disabling options based on from/toYear etc.
      >
        {children}
      </select>
    );
  }

  console.warn(`[Calendar] InternalDropdownOverride rendered for unexpected name: ${name}`);
  return (
    <select
      name={name}
      aria-label={ariaLabel}
      className={selectClassName}
      value={value}
      onChange={(e) => {
        const newValue = Number(e.target.value);
        if (topLevelOnMonthChange && currentDisplayMonth && !isNaN(newValue)) {
          console.warn(`Calendar: Fallback dropdown "${name}" changed to ${newValue}. Consider specific handling.`);
          if (name === 'years') topLevelOnMonthChange(new Date(newValue, currentDisplayMonth.getMonth(), 1));
          else if (name === 'months') topLevelOnMonthChange(new Date(currentDisplayMonth.getFullYear(), newValue, 1));
        } else if (isNaN(newValue)) {
          console.warn(`Calendar: Invalid value in fallback dropdown "${name}":`, e.target.value);
        }
      }}
    >
      {children}
    </select>
  );
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showMonthDropdown = true, // Prop to control month dropdown visibility
  month: controlledMonth,
  onMonthChange: controlledOnMonthChange,
  ...props
}: CustomCalendarProps) {

  const componentsConfig: React.ComponentProps<typeof DayPicker>['components'] = {
    IconLeft: ({ ...rest }: React.HTMLAttributes<SVGElement>) => <ChevronLeft className="h-4 w-4" {...rest} />,
    IconRight: ({ ...rest }: React.HTMLAttributes<SVGElement>) => <ChevronRight className="h-4 w-4" {...rest} />,
    Dropdown: undefined
  };

  if ((props.captionLayout === 'dropdown' || props.captionLayout === 'dropdown-buttons')) {
    componentsConfig.Dropdown = (dropdownProps: DayPickerDropdownProps) => ( // children is part of dropdownProps
      <InternalDropdownOverride
        {...dropdownProps}
        showMonthDropdown={showMonthDropdown}
        topLevelOnMonthChange={controlledOnMonthChange}
        currentDisplayMonth={controlledMonth}
      />
    );
  }

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
      {...dayPickerProps}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
