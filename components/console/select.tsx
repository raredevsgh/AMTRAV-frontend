"use client";

// The console's select, in place of the browser's own: a field-shaped button that opens a
// floating list of options, styled like the rest of the console in both themes.
import type { ReactNode, Ref } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Select } from "radix-ui";

export interface SelectOption {
  value: string;
  label: ReactNode;
}

export function ConsoleSelect({
  id,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  options,
  placeholder,
  disabled,
  compact,
  invalid,
  label,
  ref,
}: {
  id?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
  options: SelectOption[];
  /** Shown while nothing is chosen (value ""). */
  placeholder?: string;
  disabled?: boolean;
  /** A shorter trigger for card headings and table rows. */
  compact?: boolean;
  invalid?: boolean;
  /** The accessible name, when no <label htmlFor={id}> names it. */
  label?: string;
  /** For react-hook-form, to focus the select when it has an error. */
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <Select.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <Select.Trigger
        ref={ref}
        id={id}
        aria-label={label}
        aria-invalid={invalid || undefined}
        onBlur={onBlur}
        className={`console-select${compact ? " compact" : ""}`}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon asChild>
          <ChevronDown size={16} aria-hidden="true" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="console-select-content"
          position="popper"
          sideOffset={6}
          collisionPadding={12}
        >
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value} className="console-select-item">
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="console-select-check">
                  <Check size={14} aria-hidden="true" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
