import { Heading, Spinner, Text, VStack } from '@chakra-ui/react'
import { type NextClassInfo } from '../hooks/useNextClass'

/**
 * 神奈川大学の時間割
 */
const TIMETABLE = new Map([
  [1, "09:00 ~ 10:40"],
  [2, "10:50 ~ 12:30"],
  [3, "13:30 ~ 15:10"],
  [4, "15:20 ~ 17:00"],
  [5, "17:10 ~ 18:50"],
  [6, "19:00 ~ 20:40"],
  [7, "20:45 ~ 22:25"],
])

interface ClassDisplayProps {
  nextClass: NextClassInfo | null
  isEndOfDay: boolean
  isLoading: boolean
}

export function ClassDisplay({ nextClass, isEndOfDay, isLoading }: ClassDisplayProps) {
  if (isLoading) {
    return (
      <VStack>
        <Spinner size="xl" />
        <Text>Loading...</Text>
      </VStack>
    )
  }

  if (isEndOfDay) {
    return (
      <>
        <Heading size={'md'}>今日の授業はこれで終わりです！</Heading>
        <Heading size={'md'}>お疲れ様でした！</Heading>
      </>
    )
  }

  if (!nextClass) {
    return (
      <VStack>
        <Spinner size="xl" />
        <Text>Loading...</Text>
      </VStack>
    )
  }

  return (
    <>
      <Heading size={'md'}>次の授業は</Heading>
      <Heading size={'md'}>
        {nextClass.period}限（{TIMETABLE.get(nextClass.period)}）
      </Heading>
      <Heading size={'lg'}>「{nextClass.className}」</Heading>
      <Heading size={'xl'}>@{nextClass.room}</Heading>
      <Heading size={'sm'} color="gray.500">
        欠席数は{nextClass.absenceCount ?? '不明'}/3.5ですよ！
      </Heading>

      {nextClass.isMakeupClass && (
        <Heading size={'md'}>補講ですか。。。大変ですね。。。</Heading>
      )}

      {nextClass.isClassOpen ? (
        <Heading size={'md'}>いつもお疲れ様です！</Heading>
      ) : (
        <>
          <Heading size={'md'}>のはずだったんですが、</Heading>
          <Heading size={'md'}>休講らしいですよ！ラッキーですね！</Heading>
        </>
      )}

      {nextClass.isRoomChanged && (
        <>
          <Heading size={'md'}>教室が変更されているみたいです！</Heading>
          <Heading size={'md'}>気をつけてください！</Heading>
        </>
      )}
    </>
  )
}