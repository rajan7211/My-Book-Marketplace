import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  /** Current OTP value (controlled). */
  value: string;
  /** Called with the new full OTP string whenever it changes. */
  onChange: (otp: string) => void;
  /** Number of digit boxes. Defaults to 6 (matches the backend). */
  length?: number;
  /** Disables all inputs (e.g. while verifying). */
  disabled?: boolean;
  /** Shows the error styling. */
  error?: boolean;
  /** Accessible label for the group. */
  ariaLabel?: string;
}

/**
 * Accessible 6-digit OTP input.
 * - Auto-advances focus as you type and moves back on Backspace.
 * - Supports pasting the full code into any box.
 * - Numeric only.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  error = false,
  ariaLabel = "One-time password",
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusIndex = (index: number) => {
    const el = inputs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join("").slice(0, length));
  };

  const handleChange = (index: number, raw: string) => {
    const onlyDigits = raw.replace(/\D/g, "");
    if (!onlyDigits) {
      setDigit(index, "");
      return;
    }
    // If the user typed/auto-filled multiple chars, spread them across boxes.
    if (onlyDigits.length > 1) {
      const chars = onlyDigits.slice(0, length - index).split("");
      const next = digits.slice();
      chars.forEach((c, i) => {
        next[index + i] = c;
      });
      onChange(next.join("").slice(0, length));
      focusIndex(Math.min(index + chars.length, length - 1));
      return;
    }
    setDigit(index, onlyDigits);
    if (index < length - 1) focusIndex(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        focusIndex(index - 1);
        setDigit(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    onChange(pasted.slice(0, length));
    focusIndex(Math.min(pasted.length, length - 1));
  };

  return (
    <div
      className="flex justify-center gap-2 sm:gap-3"
      role="group"
      aria-label={ariaLabel}
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-12 w-10 rounded-lg border border-input bg-white text-center text-lg font-semibold text-brand-dark sm:h-14 sm:w-12 sm:text-xl",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow/60 focus-visible:border-brand-yellow",
            "disabled:cursor-not-allowed disabled:opacity-50 transition-shadow",
            error && "border-red-500 focus-visible:ring-red-500/40"
          )}
        />
      ))}
    </div>
  );
}
