"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

const LENGTH = 6;

/**
 * A six-digit code as six boxes. Typing moves to the next box, Backspace to the previous,
 * and pasting (or the browser's one-time-code autofill) fills them all at once.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  id,
  label,
  autoFocus,
  disabled,
}: {
  value: string;
  onChange: (code: string) => void;
  /** Called with the code once all six digits are in. */
  onComplete?: (code: string) => void;
  id?: string;
  label: string;
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, index) => value[index] ?? "");

  const focus = (index: number) => boxes.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus();

  function set(next: string, focusAt?: number) {
    const code = next.replace(/\D/g, "").slice(0, LENGTH);
    onChange(code);
    if (focusAt != null) focus(focusAt);
    if (code.length === LENGTH && code !== value) onComplete?.(code);
  }

  function type(index: number, typed: string) {
    const clean = typed.replace(/\D/g, "");
    if (!clean) return;
    // Autofill and fast typing can put several digits in one box: spread them from here.
    const next = value.slice(0, index) + clean + value.slice(index + clean.length);
    set(next, index + clean.length);
  }

  function key(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) set(value.slice(0, index) + value.slice(index + 1), index);
      else if (index > 0) set(value.slice(0, index - 1) + value.slice(index), index - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focus(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focus(index + 1);
    }
  }

  function paste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    set(pasted, pasted.length);
  }

  return (
    <div className="otp-input" role="group" aria-label={label}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            boxes.current[index] = element;
          }}
          id={index === 0 ? id : undefined}
          className="otp-box"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of ${LENGTH}`}
          maxLength={index === 0 ? LENGTH : 1}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onFocus={(event) => {
            // Keep the code contiguous: an empty box sends focus to the first gap.
            if (!digit && index > value.length) focus(value.length);
            else event.target.select();
          }}
          onChange={(event) => type(index, event.target.value.replace(digit, "") || event.target.value)}
          onKeyDown={(event) => key(index, event)}
          onPaste={paste}
        />
      ))}
    </div>
  );
}
