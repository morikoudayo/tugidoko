import { useMemo } from 'react'
import { type Schedule, type ClassData } from '../getSchedule'
import { type AbsenceCounts } from '../getAbsenceCount'
import { NO_MORE_CLASSES } from '../getNextPeriod'

export interface NextClassInfo extends ClassData {
  absenceCount?: number
}

export interface UseNextClassResult {
  nextClass: NextClassInfo | null
  isEndOfDay: boolean
  isLoading: boolean
}

/**
 * 次の授業情報を計算するフック
 */
export function useNextClass(
  nextPeriod: number | undefined,
  schedule: Schedule,
  absenceCounts: AbsenceCounts,
  isScheduleLoading: boolean
): UseNextClassResult {
  const result = useMemo(() => {
    // 初期状態またはローディング中
    if (nextPeriod === undefined || isScheduleLoading) {
      return { nextClass: null, isEndOfDay: false, isLoading: true }
    }

    // スケジュールが空の場合
    if (schedule.size === 0) {
      return { nextClass: null, isEndOfDay: false, isLoading: true }
    }

    // 次の授業を検索
    let nextScheduledPeriod = nextPeriod
    while (nextScheduledPeriod < NO_MORE_CLASSES) {
      if (schedule.has(nextScheduledPeriod)) {
        break
      }
      nextScheduledPeriod++
    }

    // 今日の授業が終了
    if (nextScheduledPeriod >= NO_MORE_CLASSES) {
      return { nextClass: null, isEndOfDay: true, isLoading: false }
    }

    // 次の授業情報を取得
    const classData = schedule.get(nextScheduledPeriod)
    if (!classData) {
      return { nextClass: null, isEndOfDay: false, isLoading: false }
    }

    const nextClass: NextClassInfo = {
      ...classData,
      absenceCount: absenceCounts.get(classData.className)
    }

    return { nextClass, isEndOfDay: false, isLoading: false }
  }, [nextPeriod, schedule, absenceCounts, isScheduleLoading])

  return result
}