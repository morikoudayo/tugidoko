import { useEffect, useState } from 'react'
import { useAuth } from '@/hook/useAuth';
import { Button, Center, Heading, Spinner, Text, VStack } from '@chakra-ui/react';
import { getSchedule, type ClassData, type Schedule } from './getSchedule';
import { getNextPeriodNumber, NO_MORE_CLASSES_TODAY } from './getNextPeriodNumber';
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

  const [classData, setClassData] = useState<ClassData>()
  const [periodNumber, setPeriodNumber] = useState<number | undefined>(undefined)
  const [absenceCount, setAbsenceCount] = useState<number>(0)

  /**
  * 1分ごとにupdateInfo関数が実行される。
  * getScheduleおよびsetScheduleは日付が変更された場合のみ実行される。
  * また、updateInfo関数では、現在時刻から次の授業の時限の取得、次の授業の各情報の取得、次の授業の欠席回数の取得を行う。
  */
  useEffect(() => {
    async function updateInfo(): Promise<void> {
      const currentDate = new Date().toDateString()

      let latestSchedule = schedule 
      if (refDate == undefined || currentDate !== refDate) {
        latestSchedule = await getSchedule()

        setSchedule(latestSchedule)
        setRefDate(currentDate);
      }

      const nextPeriodNumber = await getNextPeriodNumber(latestSchedule)
      const nextClassData = latestSchedule.get(nextPeriodNumber)
      const absenceCountForNextClass = await getAbsenceCount(nextClassData)

      setPeriodNumber(nextPeriodNumber)
      setClassData(nextClassData)
      setAbsenceCount(absenceCountForNextClass)
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
      {periodNumber && classData ? (<>
        <Heading size={'md'}>次の授業は</Heading>
        <Heading size={'md'}>{periodNumber}限（{TIMETABLE.get(periodNumber)}）</Heading>
        <Heading size={'lg'}>「{classData.className}」</Heading>
        <Heading size={'xl'}>@{classData.room}</Heading>
        { /**
          * 神奈川大学では、4欠席で落単となるため、3.5欠席が上限である。
          */ }
        <Heading size={'sm'} color="gray.500">欠席数は{absenceCount}/3.5ですよ！</Heading>

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
        {periodNumber === undefined && (<VStack>
          <Spinner size="xl" />
          <Text>Loading...</Text>
        </VStack>)}
        {periodNumber === NO_MORE_CLASSES_TODAY && (<>
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