import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider } from '@/context/Auth/AuthProvider'
import { AuthContext } from '@/context/Auth/AuthContext'
import { FirebaseUserContext } from '@/context/FirebaseUser/FirebaseUserContext'
import { useContext, type ReactNode } from 'react'

vi.mock('@/context/Auth/authCookie', () => ({
  activateSession: vi.fn(),
  deactivateSession: vi.fn(),
}))

vi.mock('@/context/Auth/localStorage', () => ({
  loadUserCredentials: vi.fn(),
  saveUserCredentials: vi.fn(),
  clearUserCredentials: vi.fn(),
}))

vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster" />,
  toaster: {
    create: vi.fn(),
  },
}))

const TestComponent = () => {
  const authContext = useContext(AuthContext)
  if (!authContext) {
    return <div>No auth context</div>
  }
  const { user, login, logout } = authContext
  return (
    <div>
      <div data-testid="user-id">{user.id}</div>
      <div data-testid="user-pass">{user.pass}</div>
      <button 
        onClick={() => login({ id: 'test-id', pass: 'test-pass' })}
        data-testid="login-button"
      >
        Login
      </button>
      <button onClick={logout} data-testid="logout-button">
        Logout
      </button>
    </div>
  )
}

const createWrapper = (firebaseUser: any) => 
  ({ children }: { children: ReactNode }) => (
    <FirebaseUserContext.Provider value={firebaseUser}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </FirebaseUserContext.Provider>
  )

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('初期状態で空のユーザー情報を持つ', async () => {
    const { loadUserCredentials } = await import('@/context/Auth/localStorage')
    vi.mocked(loadUserCredentials).mockResolvedValue({ id: '', pass: '' })

    render(<TestComponent />, { wrapper: createWrapper(null) })

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('')
      expect(screen.getByTestId('user-pass')).toHaveTextContent('')
    })
  })

  it('Firebaseユーザーがいる場合、そのユーザーで認証情報を読み込む', async () => {
    const { loadUserCredentials } = await import('@/context/Auth/localStorage')
    const mockFirebaseUser = { uid: 'firebase-uid' }
    const mockCredentials = { id: 'loaded-id', pass: 'loaded-pass' }

    vi.mocked(loadUserCredentials).mockResolvedValue(mockCredentials)

    render(<TestComponent />, { wrapper: createWrapper(mockFirebaseUser) })

    await waitFor(() => {
      expect(loadUserCredentials).toHaveBeenCalledWith(mockFirebaseUser)
    })
  })

  it('ログインが成功した場合、ユーザー情報を更新する', async () => {
    const { activateSession, deactivateSession } = await import('@/context/Auth/authCookie')
    const { loadUserCredentials } = await import('@/context/Auth/localStorage')

    vi.mocked(loadUserCredentials).mockResolvedValue({ id: '', pass: '' })
    vi.mocked(activateSession).mockResolvedValue(true)
    vi.mocked(deactivateSession).mockResolvedValue(true)

    render(<TestComponent />, { wrapper: createWrapper(null) })

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('')
    })

    const loginButton = screen.getByTestId('login-button')
    loginButton.click()

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('test-id')
      expect(screen.getByTestId('user-pass')).toHaveTextContent('test-pass')
    })

    expect(activateSession).toHaveBeenCalledWith({ id: 'test-id', pass: 'test-pass' })
    expect(deactivateSession).toHaveBeenCalled()
  })

  it('ログインが失敗した場合、エラートーストを表示する', async () => {
    const { activateSession } = await import('@/context/Auth/authCookie')
    const { loadUserCredentials } = await import('@/context/Auth/localStorage')
    const { toaster } = await import('@/components/ui/toaster')

    vi.mocked(loadUserCredentials).mockResolvedValue({ id: '', pass: '' })
    vi.mocked(activateSession).mockResolvedValue(false)

    render(<TestComponent />, { wrapper: createWrapper(null) })

    const loginButton = screen.getByTestId('login-button')
    loginButton.click()

    await waitFor(() => {
      expect(toaster.create).toHaveBeenCalledWith({
        description: "ログインに失敗しました。",
        type: "error",
      })
    })
  })

  it('ログアウト時にユーザー情報をクリアする', async () => {
    const { clearUserCredentials, loadUserCredentials } = await import('@/context/Auth/localStorage')
    
    vi.mocked(loadUserCredentials).mockResolvedValue({ id: 'test-id', pass: 'test-pass' })

    render(<TestComponent />, { wrapper: createWrapper(null) })

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('test-id')
    })

    const logoutButton = screen.getByTestId('logout-button')
    
    act(() => {
      logoutButton.click()
    })

    expect(clearUserCredentials).toHaveBeenCalled()
    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('')
      expect(screen.getByTestId('user-pass')).toHaveTextContent('')
    })
  })
})