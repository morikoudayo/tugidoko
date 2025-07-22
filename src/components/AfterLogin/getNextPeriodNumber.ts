import type { Schedule } from "./getSchedule";

export const NO_MORE_CLASSES = 8;

/**
 * 現在時刻とスケジュールから次の授業の時限を取得する。
 * 次の授業が存在しない場合、NO_MORE_CLASSES (8)を返す。
 */
export async function getNextPeriodNumber(schedule: Schedule): Promise<number> {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  let nextPeriodNumber
  if (minutes >= 0 && minutes < 9 * 60 + 30) {
    nextPeriodNumber = 1;
  } else if (minutes < 11 * 60 + 20) {
    nextPeriodNumber = 2
  } else if (minutes < 14 * 60) {
    nextPeriodNumber = 3
  } else if (minutes < 15 * 60 + 50) {
    nextPeriodNumber = 4
  } else if (minutes < 17 * 60 + 40) {
    nextPeriodNumber = 5
  } else if (minutes < 19 * 60 + 30) {
    nextPeriodNumber = 6
  } else if (minutes < 21 * 60 + 15) {
    nextPeriodNumber = 7
  } else {
    nextPeriodNumber = NO_MORE_CLASSES
  }

  for (; nextPeriodNumber < 8; nextPeriodNumber++) {
    if (schedule.has(nextPeriodNumber)) {
      break;
    }
  }

  return nextPeriodNumber
}