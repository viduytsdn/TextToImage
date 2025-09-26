import 'styled-components'

import type { AppTheme } from './defaultTheme'

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface DefaultTheme extends AppTheme {}
}
