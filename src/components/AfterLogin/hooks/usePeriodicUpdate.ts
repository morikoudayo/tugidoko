import { useEffect, useState } from 'react'
import { getNextPeriod } from '../getNextPeriod'

/**
 * 日付と次の時限を定期的に更新するフック
 */
export function usePeriodicUpdate(intervalMs: number = 60000) {
  const [date, setDate] = useState<number>(new Date().getDate())
  const [nextPeriod, setNextPeriod] = useState<number | undefined>(undefined)

  useEffect(() => {
    function updateInfo(): void {
      setDate(new Date().getDate())
      setNextPeriod(getNextPeriod())
    }

    updateInfo()
    const interval = setInterval(updateInfo, intervalMs)

    return () => {
      clearInterval(interval)
    }
  }, [intervalMs])

  return { date, nextPeriod }
}