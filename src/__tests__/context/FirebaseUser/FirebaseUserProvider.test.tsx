import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { FirebaseUserContext } from '@/context/FirebaseUser/FirebaseUserContext'
import { useContext, type ReactNode } from 'react'

vi.mock('@chakra-ui/react', () => ({
  Center: ({ children }: { children: ReactNode}) => <div>{children}</div>,
  Progress: {
    Root: () => <div role="progressbar" />,
    Track: () => <div />,
    Range: () => <div />,
  },
}))

vi.mock('@/context/FirebaseUser/firebase', () => ({
  firebaseAuth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  },
}))

const TestComponent = () => {
  const firebaseUser = useContext(FirebaseUserContext)
  return (
    <div>
      {firebaseUser ? (
        <div data-testid="user-logged-in">User: {firebaseUser.uid}</div>
      ) : (
        <div data-testid="user-logged-out">No user</div>
      )}
    </div>
  )
}

describe('FirebaseUserProvider', () => {
  const mockOnAuthStateChanged = vi.fn()

  let FirebaseUserProvider: any

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.doMock('@/context/FirebaseUser/firebase', () => ({
      firebaseAuth: {
        onAuthStateChanged: mockOnAuthStateChanged,
      },
    }));

    ({ FirebaseUserProvider } = await import('@/context/FirebaseUser/FirebaseUserProvider'))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('初期状態でローディング画面を表示する', () => {
    mockOnAuthStateChanged.mockImplementation(() => () => {})

    render(
      <FirebaseUserProvider>
        <TestComponent />
      </FirebaseUserProvider>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('認証状態変更後にユーザーなしの状態を表示する', async () => {
    mockOnAuthStateChanged.mockImplementation((callback) => {
      setTimeout(() => callback(null), 0)
      return () => {}
    })

    render(
      <FirebaseUserProvider>
        <TestComponent />
      </FirebaseUserProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-logged-out')).toBeInTheDocument()
    })

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('認証状態変更後にユーザーありの状態を表示する', async () => {
    const mockUser = {
      uid: 'firebase-uid',
    }

    mockOnAuthStateChanged.mockImplementation((callback) => {
      setTimeout(() => callback(mockUser), 0)
      return () => {}
    })

    render(
      <FirebaseUserProvider>
        <TestComponent />
      </FirebaseUserProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-logged-in')).toBeInTheDocument()
    })

    expect(screen.getByText('User: firebase-uid')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('コンポーネントがアンマウントされた時にsubscriptionが解除される', () => {
    const mockUnsubscribe = vi.fn()
    mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe)

    const { unmount } = render(
      <FirebaseUserProvider>
        <TestComponent />
      </FirebaseUserProvider>
    )

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})