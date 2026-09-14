import { useEffect, useState } from 'react'

/** Current time, refreshed every `intervalMs` (default: once a minute, aligned to the minute). */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    // First tick at the next whole minute so the indicator stays in sync with the clock.
    const delay = intervalMs - (Date.now() % intervalMs)
    const timeout = setTimeout(() => {
      setNow(new Date())
      interval = setInterval(() => setNow(new Date()), intervalMs)
    }, delay)
    return () => {
      clearTimeout(timeout)
      if (interval) clearInterval(interval)
    }
  }, [intervalMs])

  return now
}
