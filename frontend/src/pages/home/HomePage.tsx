import styled from 'styled-components'

import { envConfig } from '@/config/env.ts'

const Section = styled.section`
  display: grid;
  gap: ${({ theme }) => theme.spacing(8)};
`

const Hero = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
`

const Headline = styled.h2`
  font-size: clamp(2rem, 2.5vw, 2.75rem);
  margin: 0;
`

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedText};
  font-size: 1.05rem;
  line-height: 1.6;
`

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing(6)};
`

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing(6)};
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
`

const CardBody = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.mutedText};
  line-height: 1.5;
`

const Hint = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.mutedText};
`

export function HomePage() {
  return (
    <Section>
      <Hero>
        <Headline>Design prompts, tune Gemini, ship visuals.</Headline>
        <Description>
          This workspace is the entry point for the Text-to-Image platform. Compose prompts, orchestrate the Nano Banana
          enhancer, and plug in future APIs from a single control panel.
        </Description>
        <Hint>
          Connected backend: <strong>{envConfig.backendBaseUrl || 'not yet configured'}</strong>
        </Hint>
      </Hero>

      <CardGrid>
        <Card>
          <CardTitle>Prompt Studio</CardTitle>
          <CardBody>
            Centralize your prompt templates, preview Gemini responses, and hand off payloads to additional AI services without
            leaving the flow.
          </CardBody>
        </Card>
        <Card>
          <CardTitle>Environment-aware</CardTitle>
          <CardBody>
            Configuration lives in environment variables, making it safe to switch between staging, production, or local
            backends.
          </CardBody>
        </Card>
        <Card>
          <CardTitle>Extensible Integrations</CardTitle>
          <CardBody>
            Bring your own APIs. The workspace keeps credentials and endpoints isolated while providing shared state management
            via Redux Toolkit.
          </CardBody>
        </Card>
      </CardGrid>
    </Section>
  )
}
