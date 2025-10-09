import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AfterLogin } from '@/components/AfterLogin/AfterLogin'
import { useAuth } from '@/hook/useAuth'
import * as usePeriodicUpdateModule from '@/components/AfterLogin/hooks/usePeriodicUpdate'
import * as useScheduleDataModule from '@/components/AfterLogin/hooks/useScheduleData'
import * as useNextClassModule from '@/components/AfterLogin/hooks/useNextClass'

// Mock all dependencies
vi.mock('@/hook/useAuth')
vi.mock('@/components/AfterLogin/hooks/usePeriodicUpdate')
vi.mock('@/components/AfterLogin/hooks/useScheduleData')
vi.mock('@/components/AfterLogin/hooks/useNextClass')


// Mock Chakra UI components
vi.mock('@chakra-ui/react', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  Center: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Heading: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Spinner: () => <div data-testid="spinner">Loading...</div>,
  Text: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  VStack: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))


describe('AfterLogin', () => {
  const mockAuth = {
    user: { id: 'test-user', pass: 'test-pass' },
    login: vi.fn(),
    logout: vi.fn(),
  }

  const mockNextClass = {
    period: 1,
    className: 'プログラミング基礎',
    room: 'A101',
    isClassOpen: true,
    isRoomChanged: false,
    isMakeupClass: false,
    absenceCount: 1.5,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    vi.mocked(useAuth).mockReturnValue(mockAuth)
    
    vi.mocked(usePeriodicUpdateModule.usePeriodicUpdate).mockReturnValue({
      date: 15,
      nextPeriod: 1,
    })
    
    vi.mocked(useScheduleDataModule.useScheduleData).mockReturnValue({
      schedule: new Map(),
      absenceCounts: new Map(),
      isLoading: false,
    })
    
    vi.mocked(useNextClassModule.useNextClass).mockReturnValue({
      nextClass: mockNextClass,
      isEndOfDay: false,
      isLoading: false,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Structure', () => {
    it('calls auth.logout when logout button is clicked', async () => {
      render(<AfterLogin />)
      
      const logoutButton = screen.getByText('ログアウト')
      await userEvent.click(logoutButton)
      
      expect(mockAuth.logout).toHaveBeenCalledOnce()
    })
  })

  describe('ClassDisplay Integration', () => {
    it('passes correct props to ClassDisplay component', () => {
      render(<AfterLogin />)
      
      // Verify ClassDisplay renders with expected props
      expect(screen.getByText('次の授業は')).toBeInTheDocument()
      expect(screen.getByText('1限（09:00 ~ 10:40）')).toBeInTheDocument()
      expect(screen.getByText('「プログラミング基礎」')).toBeInTheDocument()
    })

    it('shows loading state when isLoading is true', () => {
      vi.mocked(useNextClassModule.useNextClass).mockReturnValue({
        nextClass: null,
        isEndOfDay: false,
        isLoading: true,
      })
      
      render(<AfterLogin />)
      
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
      expect(screen.getAllByText('Loading...')).toHaveLength(2)
    })

    it('displays end of day message when isEndOfDay is true', () => {
      vi.mocked(useNextClassModule.useNextClass).mockReturnValue({
        nextClass: null,
        isEndOfDay: true,
        isLoading: false,
      })
      
      render(<AfterLogin />)
      
      expect(screen.getByText('今日の授業はこれで終わりです！')).toBeInTheDocument()
      expect(screen.getByText('お疲れ様でした！')).toBeInTheDocument()
    })
  })

  describe('Hook Integration', () => {
    it('integrates hooks data flow correctly', () => {
      const customDate = 20
      const customNextPeriod = 3
      const customSchedule = new Map([[1, { 
        period: 1,
        className: 'テスト授業', 
        room: 'A101',
        isClassOpen: true,
        isRoomChanged: false,
        isMakeupClass: false
      }]])
      const customAbsenceCounts = new Map([['テスト授業', 1]])
      
      vi.mocked(usePeriodicUpdateModule.usePeriodicUpdate).mockReturnValue({
        date: customDate,
        nextPeriod: customNextPeriod,
      })
      
      vi.mocked(useScheduleDataModule.useScheduleData).mockReturnValue({
        schedule: customSchedule,
        absenceCounts: customAbsenceCounts,
        isLoading: true,
      })
      
      render(<AfterLogin />)
      
      expect(useScheduleDataModule.useScheduleData).toHaveBeenCalledWith(customDate)
      expect(useNextClassModule.useNextClass).toHaveBeenCalledWith(
        customNextPeriod,
        customSchedule,
        customAbsenceCounts,
        true
      )
    })
  })
})