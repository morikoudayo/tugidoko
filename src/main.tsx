import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { Provider } from './components/ui/provider.tsx'
import { AuthProvider } from '@/context/Auth/AuthProvider.tsx'
import { OAuthUserProvider } from './context/OAuthUser/OAuthUserProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <OAuthUserProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </OAuthUserProvider>
    </Provider>
  </StrictMode>,
)
