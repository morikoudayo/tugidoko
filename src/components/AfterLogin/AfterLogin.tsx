import { Button, Center } from '@chakra-ui/react'
import { useAuth } from '@/hook/useAuth'
import { usePeriodicUpdate } from './hooks/usePeriodicUpdate'
import { useScheduleData } from './hooks/useScheduleData'
import { useNextClass } from './hooks/useNextClass'
import { ClassDisplay } from './components/ClassDisplay'

export function AfterLogin() {
  const auth = useAuth()
  const { date, nextPeriod } = usePeriodicUpdate()
  const { schedule, absenceCounts, isLoading } = useScheduleData(date)
  const { nextClass, isEndOfDay, isLoading: isNextClassLoading } = useNextClass(
    nextPeriod,
    schedule,
    absenceCounts,
    isLoading
  )

  return (
    <Center h='100vh' flexDirection="column" alignItems="center" mx={4}>
      <ClassDisplay
        nextClass={nextClass}
        isEndOfDay={isEndOfDay}
        isLoading={isNextClassLoading}
      />
      <Button variant='solid' mt={4} onClick={() => auth.logout()}>
        ログアウト
      </Button>
    </Center>
  )
}