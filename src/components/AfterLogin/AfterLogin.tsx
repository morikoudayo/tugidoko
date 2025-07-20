import { useEffect, useState } from 'react'
import { useAuth } from '@/hook/useAuth';
import { Button, Center, Heading, Spinner, Text, VStack } from '@chakra-ui/react';
import { getSchedule, type ClassInfo, type Schedule } from './getSchedule';
import { getNextPeriod, NO_CLASS_ANYMORE } from './getNextPeriod';
import { getAbsenceCount } from './getAbsenceCount';

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

  const [schedule, setSchedule] = useState<Schedule>(new Map())
  const [refDate, setRefDate] = useState<string | undefined>(undefined)

  const [nextClassInfoObject, setNextClassInfoObject] = useState<ClassInfo>()
  const [nextPeriod, setNextPeriod] = useState<number | undefined>(undefined)
  const [abcenceCount, setAbcenceCount] = useState<number>(0)

  /**
  * 1分ごとにupdateInfo関数が実行される。
  * getScheduleおよびsetScheduleは日付が変更された場合のみ実行される。
  * また、updateInfo関数では、現在時刻から次の授業の時限の取得、次の授業の各情報の取得、次の授業の欠席回数の取得を行う。
  */
  useEffect(() => {
    async function updateInfo(): Promise<void> {
      const currentDate = new Date().toDateString()

      if (refDate !== undefined && currentDate !== refDate) {
        setSchedule(await getSchedule())
        setRefDate(currentDate);
      }

      setNextPeriod(await getNextPeriod(schedule))
      setNextClassInfoObject(schedule.get(nextPeriod!))
      setAbcenceCount(await getAbsenceCount(nextClassInfoObject))
    }

    updateInfo();
    const interval = setInterval(() => {
      updateInfo();
    }, 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [])

  return (
    <Center h='100vh' flexDirection="column" alignItems="center" mx={4}>
      {nextPeriod && nextClassInfoObject ? (<>
        <Heading size={'md'}>次の授業は</Heading>
        <Heading size={'md'}>{nextPeriod}限（{TIMETABLE.get(nextPeriod)}）</Heading>
        <Heading size={'lg'}>「{nextClassInfoObject.className}」</Heading>
        <Heading size={'xl'}>@{nextClassInfoObject.room}</Heading>
        { /**
          * 神奈川大学では、4欠席で落単となるため、3.5欠席が上限である。
          */ }
        <Heading size={'sm'} color="gray.500">欠席数は{abcenceCount}/3.5ですよ！</Heading>

        {nextClassInfoObject.isMakeupClass && <Heading size={'md'}>補講ですか。。。大変ですね。。。</Heading>}
        {nextClassInfoObject.isClassOpen
          ? <Heading size={'md'}>いつもお疲れ様です！</Heading>
          : (<>
            <Heading size={'md'}>のはずだったんですが、</Heading>
            <Heading size={'md'}>休講らしいですよ！ラッキーですね！</Heading>
          </>)
        }
        {nextClassInfoObject.isRoomChanged && (<>
          <Heading size={'md'}>教室が変更されているみたいです！</Heading>
          <Heading size={'md'}>気をつけてください！</Heading>
        </>)}

      </>) : (<>
        {nextPeriod === undefined && (<VStack>
          <Spinner size="xl" />
          <Text>Loading...</Text>
        </VStack>)}
        {nextPeriod === NO_CLASS_ANYMORE && (<>
          <Heading size={'md'}>今日の授業はこれで終わりです！</Heading>
          <Heading size={'md'}>お疲れ様でした！</Heading>
        </>)}
      </>)}
      <Button variant='solid' mt={4} onClick={() => {
        auth.logout()
      }}>ログアウト</Button>
    </Center>
  )
}