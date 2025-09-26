import { useEffect, useState } from 'react'
import { useAuth } from '@/hook/useAuth';
import { Button, Center, Heading, Spinner, Text, VStack } from '@chakra-ui/react';
import { getSchedule, type ClassData, type Schedule } from './getSchedule';
import { getNextPeriod, NO_MORE_CLASSES } from './getNextPeriod';
import { activateSession, deactivateSession } from '@/context/Auth/authCookie';
import { getAbsenceCounts, type AbsenceCounts } from './getAbsenceCount';

/**
* 神奈川大学の時間割。
*/
const TIMETABLE = new Map([
  [1, "09:00 ~ 10:40"],
  [2, "10:50 ~ 12:30"],
  [3, "13:30 ~ 15:10"],
  [4, "15:20 ~ 17:00"],
  [5, "17:10 ~ 18:50"],
  [6, "19:00 ~ 20:40"],
  [7, "20:45 ~ 22:25"],
]);

export function AfterLogin() {
  const auth = useAuth()

  const [date, setDate] = useState<number>(new Date().getDate())
  const [nextPeriod, setNextPeriod] = useState<number | undefined>(undefined)

  const [schedule, setSchedule] = useState<Schedule>(new Map())
  const [absenceCounts, setAbsenceCounts] = useState<AbsenceCounts>(new Map())

  const [nextClassData, setNextClassData] = useState<ClassData>()
  const [absenceCount, setAbsenceCount] = useState<number | undefined>(undefined)
  const [noMoreClasses, setNoMoreClasses] = useState<boolean>(false)

  /**
  * テスト用ステート
  */
  const [testMode, setTestMode] = useState(false);
  const [testPeriod, setTestPeriod] = useState(0);
  (window as Window & { setTestMode?: typeof setTestMode }).setTestMode = setTestMode;
  (window as Window & { setTestPeriod?: typeof setTestPeriod }).setTestPeriod = setTestPeriod;

  /**
  * 日付と時限を60秒ごとに取得。
  */
  useEffect(() => {
    async function updateInfo(): Promise<void> {
      setDate(new Date().getDate())
      setNextPeriod(getNextPeriod())
    }

    if (!testMode) {
      updateInfo();
      const interval = setInterval(() => {
        updateInfo();
      }, 60 * 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [testMode])

  /**
  * 日によって変わる情報（開講情報、欠席回数のテーブル）を取得。
  */
  useEffect(() => {
    if (!auth.user.id) return;

    console.info('date updated');

    async function updateDailyInfo() {
      if (!testMode) await activateSession(auth.user);
      setSchedule(await getSchedule(testMode));
      setAbsenceCounts(await getAbsenceCounts(testMode));
    }

    updateDailyInfo();

    return () => {
      if (!testMode) deactivateSession();
    };
  }, [auth.user, date, testMode])

  /**
  * 次の授業の情報を取得。
  */
  useEffect(() => {
    if (testMode && testPeriod === undefined) return;
    if (!testMode && nextPeriod === undefined) return;
    if (schedule.size === 0) return;

    console.info('next period or schedule updated')

    let nextScheduledPeriod = testMode ? testPeriod : nextPeriod!
    for (; ; nextScheduledPeriod++) {
      if (schedule.has(nextScheduledPeriod)) {
        break;
      }
    }

    if (nextScheduledPeriod == NO_MORE_CLASSES) {
      setNoMoreClasses(true)
      return
    } else {
      setNoMoreClasses(false)
    }

    setNextClassData(schedule.get(nextScheduledPeriod))
  }, [nextPeriod, schedule, testMode, testPeriod])

  /**
  * 次の授業の欠席回数を取得。
  */
  useEffect(() => {
    if (nextClassData === undefined) return;
    console.info('absence counts updated')

    setAbsenceCount(absenceCounts.get(nextClassData.className))
  }, [nextClassData, absenceCounts])

  return (
    <Center h='100vh' flexDirection="column" alignItems="center" mx={4}>
      {nextClassData ? (<>
        <Heading size={'md'}>次の授業は</Heading>
        <Heading size={'md'}>{nextClassData.period}限（{TIMETABLE.get(nextClassData.period)}）</Heading>
        <Heading size={'lg'}>「{nextClassData.className}」</Heading>
        <Heading size={'xl'}>@{nextClassData.room}</Heading>
        { /**
          * 神奈川大学では、4欠席で落単となるため、3.5欠席が上限である。
          */ }
        <Heading size={'sm'} color="gray.500">欠席数は{absenceCount ? absenceCount : '不明'}/3.5ですよ！</Heading>


        {nextClassData.isMakeupClass && <Heading size={'md'}>補講ですか。。。大変ですね。。。</Heading>}
        {nextClassData.isClassOpen
          ? <Heading size={'md'}>いつもお疲れ様です！</Heading>
          : (<>
            <Heading size={'md'}>のはずだったんですが、</Heading>
            <Heading size={'md'}>休講らしいですよ！ラッキーですね！</Heading>
          </>)
        }
        {nextClassData.isRoomChanged && (<>
          <Heading size={'md'}>教室が変更されているみたいです！</Heading>
          <Heading size={'md'}>気をつけてください！</Heading>
        </>)}

      </>) : (<>
        {noMoreClasses
          ? (<>
            <Heading size={'md'}>今日の授業はこれで終わりです！</Heading>
            <Heading size={'md'}>お疲れ様でした！</Heading>
          </>)
          : (<VStack>
            <Spinner size="xl" />
            <Text>Loading...</Text>
          </VStack>)
        }
      </>)}
      <Button variant='solid' mt={4} onClick={() => {
        auth.logout()
      }}>ログアウト</Button>
    </Center>
  )
}