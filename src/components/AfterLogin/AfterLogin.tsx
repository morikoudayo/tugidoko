import { useEffect, useState } from 'react'
import { useAuth } from '@/hook/useAuth';
import { Button, Center, Heading, Spinner, Text, VStack } from '@chakra-ui/react';
import { getSchedule, type ClassInfo, type Schedule } from './getSchedule';
import { getNextPeriod } from './getNextPeriod';
import { getAbsenceCount } from './getAbsenceCount';

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
  const [nextPeriod, setNextPeriod] = useState<number>(0)
  const [abcenceCount, setAbcenceCount] = useState<number>(0)

  useEffect(() => {
    async function updateInfo() {
      const currentDate = new Date().toDateString()

      if (refDate !== undefined && currentDate !== refDate) {
        setSchedule(await getSchedule())
        setRefDate(currentDate);
      }

      setNextPeriod(await getNextPeriod(schedule))
      setNextClassInfoObject(schedule.get(nextPeriod))
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
      {nextClassInfoObject ? (<>
        <Heading size={'md'}>次の授業は</Heading>
        <Heading size={'md'}>{nextPeriod}限（{TIMETABLE.get(nextPeriod)}）</Heading>
        <Heading size={'lg'}>「{nextClassInfoObject.className}」</Heading>
        <Heading size={'xl'}>@{nextClassInfoObject.room}</Heading>
        <Heading size={'sm'} color="gray.500">欠席数は{abcenceCount}/4ですよ！</Heading>

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
        {nextPeriod === 0 && (<VStack>
          <Spinner size="xl" />
          <Text>Loading...</Text>
        </VStack>)}
        {nextPeriod === 8 && (<>
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