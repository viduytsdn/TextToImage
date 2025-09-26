import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components'

import App from '@/App.tsx'
import { store } from '@/store/index.ts'
import { GlobalStyle } from '@/styles/globalStyles.ts'
import { defaultTheme } from '@/theme/defaultTheme.ts'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element with id "root" not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={defaultTheme}>
        <BrowserRouter>
          <GlobalStyle />
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
