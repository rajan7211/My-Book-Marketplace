import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Simple countdown timer for OTP "resend" cooldowns.
 *
 * @param initialSeconds how long the cooldown lasts (default 60s — matches the
 *        backend's resend cooldown).
 * @param autoStart      whether to begin counting down immediately on mount.
 *
 * @returns `seconds` remaining, an `isActive` flag, and a `restart` fn to
 *          re-arm the timer (call this after a successful resend).
 */
export function useCountdown(initialSeconds = 60, autoStart = true) {
  const [seconds, setSeconds] = useState(autoStart ? initialSeconds : 0);
  // Bumping this token re-triggers the interval effect to (re)start the timer.
  const [runToken, setRunToken] = useState(autoStart ? 1 : 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Re-arm the timer: reset the remaining seconds and bump the run token so the
  // effect below sets up a fresh interval.
  const restart = useCallback(() => {
    setSeconds(initialSeconds);
    setRunToken((t) => t + 1);
  }, [initialSeconds]);

  useEffect(() => {
    if (runToken === 0) return;

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clear();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clear;
  }, [runToken, clear]);

  return {
    seconds,
    isActive: seconds > 0,
    restart,
  };
}
