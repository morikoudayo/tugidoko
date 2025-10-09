import { useEffect, useState } from 'react'
import { useAuth } from '@/hook/useAuth'
import { getSchedule, type Schedule } from '../getSchedule'
import { getAbsenceCounts, type AbsenceCounts } from '../getAbsenceCount'
import { activateSession, deactivateSession } from '@/context/Auth/authCookie'

/**
 * スケジュールと欠席データを管理するフック
 */
export function useScheduleData(date: number) {
  const auth = useAuth()
  const [schedule, setSchedule] = useState<Schedule>(new Map())
  const [absenceCounts, setAbsenceCounts] = useState<AbsenceCounts>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!auth.user.id) return

    let sessionActivated = false
    setIsLoading(true)

    async function updateDailyInfo() {
      try {
        sessionActivated = await activateSession(auth.user)
        const [scheduleData, absenceData] = await Promise.all([
          getSchedule(),
          getAbsenceCounts()
        ])
        setSchedule(scheduleData)
        setAbsenceCounts(absenceData)
      } finally {
        setIsLoading(false)
      }
    }

    updateDailyInfo()

    return () => {
      if (sessionActivated) {
        deactivateSession()
      }
    }
  }, [auth.user, date])

  return { schedule, absenceCounts, isLoading }
}