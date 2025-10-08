import { vi } from 'vitest'

export const initializeApp = vi.fn(() => ({
  name: '[DEFAULT]',
  options: {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-bucket',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
  },
  automaticDataCollectionEnabled: false,
}))