"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TOUCH_TARGET } from "@/lib/design-tokens";
import type { FilterSelectProps } from "../types";

export function FilterSelect({
  value,
  onChange,
  options,
  icon: Icon,
  placeholder,
  className = "flex-1 min-w-[130px]",
  defaultValue = "all",
}: FilterSelectProps) {
  return (
    <div className={className}>
      <Select value={value || defaultValue} onValueChange={onChange}>
        <SelectTrigger className={`${TOUCH_TARGET.textMobile} md:h-10 w-full`}>
          {Icon && <Icon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
