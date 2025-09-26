import { NavLink, Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/store/hooks.ts'
import { toggleThemeMode } from '@/store/slices/appSlice.ts'

const Shell = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  flex-direction: column;
`

const Header = styled.header`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
`

const HeaderContent = styled.div`
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(8)};
  max-width: ${({ theme }) => theme.layout.maxWidth};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(6)};
  flex-wrap: wrap;
`

const Brand = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`

const Title = styled.h1`
  font-size: 1.5rem;
  margin: 0;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.mutedText};
`

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
  flex-wrap: wrap;
`

const NavItem = styled(NavLink)`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const ThemeToggle = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }
`

const Main = styled.main`
  flex: 1;
  margin: 0 auto;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  padding: ${({ theme }) => theme.spacing(10)} ${({ theme }) => theme.spacing(8)};
`

const Footer = styled.footer`
  margin-top: auto;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(8)};
  text-align: center;
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 0.875rem;
`

export function MainLayout() {
  const themeMode = useAppSelector((state) => state.app.themeMode)
  const dispatch = useAppDispatch()

  useEffect(() => {
    document.body.dataset.theme = themeMode
  }, [themeMode])

  return (
    <Shell>
      <Header>
        <HeaderContent>
          <Brand>
            <Title>Text-to-Image Studio</Title>
            <Subtitle>Composable workspace for Gemini powered creativity</Subtitle>
          </Brand>
          <Navigation>
            <NavItem to="/" end>
              Workspace
            </NavItem>
            <NavItem to="/settings">Settings</NavItem>
            <ThemeToggle type="button" onClick={() => dispatch(toggleThemeMode())}>
              {themeMode === 'light' ? 'Enable Dark Mode' : 'Enable Light Mode'}
            </ThemeToggle>
          </Navigation>
        </HeaderContent>
      </Header>
      <Main>
        <Outlet />
      </Main>
      <Footer>Built with React, Redux Toolkit, and Vite.</Footer>
    </Shell>
  )
}
