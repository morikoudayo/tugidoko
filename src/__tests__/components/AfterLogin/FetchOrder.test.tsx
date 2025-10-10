import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { AfterLogin } from '@/components/AfterLogin/AfterLogin'
import { AuthContext } from '@/context/Auth/AuthContext'
import { FirebaseUserContext } from '@/context/FirebaseUser/FirebaseUserContext'
import type { ReactNode } from 'react'
import React from 'react'

let fetchCallOrder: Array<{ url: string; timestamp: number }> = []

// @ts-expect-error options parameter required for fetch signature compatibility but not used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockFetch = vi.fn().mockImplementation(async (url: string, options?: RequestInit) => {
  try {
    if (url.includes('/amserver/UI/Login')) {
      return {
        text: () => Promise.resolve('<title>Please Wait While Redirecting to console</title>'),
        ok: true
      }
    }
    
    if (url.includes('/campusweb/portal.do?page=main')) {
      const stack = new Error().stack || ''
      const isFromAuthCookie = stack.includes('activateSession')
      
      if (isFromAuthCookie) {
        await new Promise(r => setTimeout(r, 50));
      }
      
      return {
        text: () => Promise.resolve('<ul class="mysch-portlet-list"><li class="normal">1限:テスト授業@A101</li></ul>'),
        ok: true
      }
    }
    
    if (url.includes('/campusweb/campussquare.do')) {
      return {
        text: () => Promise.resolve(`
          <table><tbody><tr><td></td><td></td><td></td><td>プログラミング基礎</td>14/12/0/1</tr></tbody></table>
          <table><tbody></tbody></table>
        `),
        ok: true
      }
    }
    
    if (url.includes('/amserver/identity/logout')) {
      return {
        ok: true
      }
    }
    
    return {
      text: () => Promise.resolve('<html></html>'),
      ok: true
    }
  } finally {
    fetchCallOrder.push({ 
      url: url.toString(), 
      timestamp: Date.now() 
    })
  }
})

global.fetch = mockFetch

vi.mock('@chakra-ui/react', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => <button onClick={onClick}>{children}</button>,
  Center: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/AfterLogin/hooks/usePeriodicUpdate', () => ({
  usePeriodicUpdate: () => ({
    date: 1,
    nextPeriod: 1
  })
}))

vi.mock('@/components/AfterLogin/hooks/useNextClass', () => ({
  useNextClass: () => ({
    nextClass: null,
    isEndOfDay: false,
    isLoading: false
  })
}))

vi.mock('@/components/AfterLogin/components/ClassDisplay', () => ({
  ClassDisplay: () => <div>ClassDisplay</div>
}))

describe('fetch実行順序テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchCallOrder = []
    mockFetch.mockClear()
  })

  const createWrapper = (user = { id: 'test-id', pass: 'test-pass' }) => 
    ({ children }: { children: ReactNode }) => {
      const authContextValue = {
        user,
        login: vi.fn(),
        logout: vi.fn(),
      }
      return (
        <FirebaseUserContext.Provider value={null}>
          <AuthContext.Provider value={authContextValue}>
            {children}
          </AuthContext.Provider>
        </FirebaseUserContext.Provider>
      )
    }

  it('fetch実行順序が自動的に正しいことを確認', async () => {
    render(<AfterLogin />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(fetchCallOrder.length).toBeGreaterThan(2)
    }, { timeout: 5000 })

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(fetchCallOrder.length).toBeGreaterThanOrEqual(3)
    expect(fetchCallOrder[0].url).toContain('/amserver/UI/Login')
    expect(fetchCallOrder[1].url).toContain('/campusweb/portal.do?page=main')

    const portalTimestamp = fetchCallOrder[1].timestamp
    for (let i = 2; i < fetchCallOrder.length; i++) {
      const call = fetchCallOrder[i]
      
      if (call.url.includes('/campusweb/') && !call.url.includes('portal.do?page=main')) {
        expect(call.timestamp).toBeGreaterThanOrEqual(portalTimestamp)
      }
    }

    if (fetchCallOrder.length > 0) {
      console.log('\n# Fetch実行順')
      fetchCallOrder.forEach((call, index) => {
        console.log(`${index + 1}. ${call.url}`)
      })
    }
  })
})