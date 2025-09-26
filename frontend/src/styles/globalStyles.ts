import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :root {
    color-scheme: light;
  }

  body {
    margin: 0;
    min-height: 100vh;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    transition: background-color 0.25s ease, color 0.25s ease;
  }

  body[data-theme='dark'] {
    background-color: #0f172a;
    color: #f8fafc;
    color-scheme: dark;
  }

  body[data-theme='dark'] a {
    color: #cbd5f5;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  select {
    font: inherit;
  }
`
