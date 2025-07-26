import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hook/useAuth';
import { Button, Center, Heading, Spinner, Text, VStack } from '@chakra-ui/react';
import { getSchedule, type ClassData, type Schedule } from './getSchedule';
import { getNextPeriodNumber, NO_MORE_CLASSES } from './getNextPeriodNumber';
import { activateSession, deactivateSession } from '@/context/Auth/authCookie';

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

  const lastFetchedDate = useRef<string | undefined>(undefined)
  const schedule = useRef<Schedule>(new Map())
  const periodNumber = useRef<number | undefined>(undefined)

  const [classData, setClassData] = useState<ClassData>()
  const [noMoreClasses, setNoMoreClasses] = useState<boolean>(false)

  /**
  * テスト用
  */
  const [test, setTest] = useState(false);
  const [testPeriod, setTestPeriod] = useState(0);
  (window as Window & { setTest?: typeof setTest }).setTest = setTest;
  (window as Window & { setTestPeriod?: typeof setTestPeriod }).setTestPeriod = setTestPeriod;

  useEffect(() => {
    async function updateInfo(): Promise<void> {
      await activateSession(auth.user);
      schedule.current = await getSchedule(test);
      await deactivateSession();
      console.info('schedule updated');

      if (testPeriod == NO_MORE_CLASSES) {
        setNoMoreClasses(true)
      } else {
        setClassData(schedule.current.get(testPeriod))
      }
      console.info('period updated')
    }

    updateInfo();
  }, [test])

  /**
  * 1分ごとにupdateInfo関数が実行される。
  * getScheduleおよびsetScheduleは日付が変更された場合のみ実行される。
  * また、updateInfo関数では、現在時刻から次の授業の時限の取得、次の授業の各情報の取得、次の授業の欠席回数の取得を行う。
  */
  useEffect(() => {
    async function updateInfo(): Promise<void> {
      const currentDate = new Date().toDateString()
      if (lastFetchedDate.current == undefined || lastFetchedDate.current !== currentDate) {
        lastFetchedDate.current = currentDate;

        await activateSession(auth.user);
        schedule.current = await getSchedule();
        await deactivateSession();
        console.info('schedule updated');
      }

      const nextPeriodNumber = await getNextPeriodNumber(schedule.current)
      if (periodNumber.current !== nextPeriodNumber) {
        periodNumber.current = nextPeriodNumber

        if (periodNumber.current == NO_MORE_CLASSES) {
          setNoMoreClasses(true)
        } else {
          setClassData(schedule.current.get(periodNumber.current))
        }

        console.info('period updated')
      }
    }

    if (!test) {
      updateInfo();
      const interval = setInterval(() => {

        updateInfo();
      }, 60 * 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [test])

  return (
    <Center h='100vh' flexDirection="column" alignItems="center" mx={4}>
      {classData ? (<>
        <Heading size={'md'}>次の授業は</Heading>
        <Heading size={'md'}>{classData.period}限（{TIMETABLE.get(classData.period)}）</Heading>
        <Heading size={'lg'}>「{classData.className}」</Heading>
        <Heading size={'xl'}>@{classData.room}</Heading>
        { /**
          * 神奈川大学では、4欠席で落単となるため、3.5欠席が上限である。
          */ }
        <Heading size={'sm'} color="gray.500">欠席数は{classData.absenceCount}/3.5ですよ！</Heading>

        {classData.isMakeupClass && <Heading size={'md'}>補講ですか。。。大変ですね。。。</Heading>}
        {classData.isClassOpen
          ? <Heading size={'md'}>いつもお疲れ様です！</Heading>
          : (<>
            <Heading size={'md'}>のはずだったんですが、</Heading>
            <Heading size={'md'}>休講らしいですよ！ラッキーですね！</Heading>
          </>)
        }
        {classData.isRoomChanged && (<>
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