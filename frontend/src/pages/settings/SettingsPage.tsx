import styled from 'styled-components'

import { envConfig, envFlags } from '@/config/env.ts'
import { useAppDispatch, useAppSelector } from '@/store/hooks.ts'
import { setThemeMode } from '@/store/slices/appSlice.ts'

const Section = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing(6)};
`

const Heading = styled.h2`
  margin: 0;
`

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing(6)};
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`

const Label = styled.label`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  font-weight: 600;
`

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`

const List = styled.dl`
  margin: 0;
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
`

const Item = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(1)};
`

const Term = styled.dt`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

const Detail = styled.dd`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedText};
  word-break: break-word;
`

export function SettingsPage() {
  const themeMode = useAppSelector((state) => state.app.themeMode)
  const dispatch = useAppDispatch()

  return (
    <Section>
      <div>
        <Heading>Workspace Settings</Heading>
        <p>Inspect environment wiring and choose defaults for the shared UI.</p>
      </div>

      <Panel>
        <Label>
          Theme mode
          <Select value={themeMode} onChange={(event) => dispatch(setThemeMode(event.target.value as typeof themeMode))}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>
        </Label>
      </Panel>

      <Panel>
        <Heading as="h3">Environment Variables</Heading>
        <List>
          <Item>
            <Term>Backend base URL</Term>
            <Detail>{envConfig.backendBaseUrl || 'Not configured'}</Detail>
          </Item>
          <Item>
            <Term>Google Gemini API key</Term>
            <Detail>{envFlags.isGeminiConfigured ? 'Configured' : 'Not configured'}</Detail>
          </Item>
          <Item>
            <Term>Custom integrations base URL</Term>
            <Detail>{envConfig.customApiBaseUrl || 'Not configured'}</Detail>
          </Item>
        </List>
      </Panel>
    </Section>
  )
}
