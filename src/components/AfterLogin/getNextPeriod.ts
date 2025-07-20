import type { Schedule } from "./getSchedule";

/**
 * 現在時刻とスケジュールから次の授業の時限を取得する。
 */
export async function getNextPeriod(schedule: Schedule): Promise<number> {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  let nextPeriod
  if (minutes >= 0 && minutes < 9 * 60 + 30) {
    nextPeriod = 1;
  } else if (minutes < 11 * 60 + 20) {
    nextPeriod = 2
  } else if (minutes < 14 * 60) {
    nextPeriod = 3
  } else if (minutes < 15 * 60 + 50) {
    nextPeriod = 4
  } else if (minutes < 17 * 60 + 40) {
    nextPeriod = 5
  } else if (minutes < 19 * 60 + 30) {
    nextPeriod = 6
  } else if (minutes < 21 * 60 + 15) {
    nextPeriod = 7
  } else {
    nextPeriod = 8
  }

  for (; nextPeriod < 8; nextPeriod++) {
    if (schedule.has(nextPeriod)) {
      break;
    }
  }

  return nextPeriod
}