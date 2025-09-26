# Text-to-Image Frontend Workspace

This package contains the single-page application that powers the Text-to-Image workspace. It is built with React, Vite, Redux Toolkit, React Router, and styled-components to deliver a modular architecture capable of supporting Google Gemini and custom API integrations.

## Getting Started

```bash
npm install
npm run dev
```

The development server reads configuration from environment variables prefixed with `VITE_`. Copy `.env.example` to `.env` and supply the appropriate values before running the app.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `VITE_BACKEND_BASE_URL` | Base URL for the core Text-to-Image backend. |
| `VITE_GEMINI_API_KEY` | Google Gemini API key used for prompt enhancement and image generation. |
| `VITE_CUSTOM_API_BASE_URL` | Optional base URL for customer-provided integrations. |

The helpers in `src/config/env.ts` centralize access to these variables, validate that required settings are present, and expose request utilities for backend, Gemini, and custom API calls.

## Architecture Overview

- **Routing** – Configured with React Router (`src/routes/AppRoutes.tsx`) and a shared layout wrapper (`src/components/layout/MainLayout.tsx`).
- **State Management** – Redux Toolkit store located in `src/store/`, including typed hooks and an application slice for UI preferences.
- **Styling** – Styled-components theme (`src/theme/defaultTheme.ts`) plus global styles (`src/styles/globalStyles.ts`) create a consistent design system.
- **Services** – `src/services/apiClient.ts` exposes typed helpers that automatically resolve environment-configured base URLs.
- **Pages** – Organized under `src/pages/` for workspace and settings experiences.

## Useful Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a production build. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Lint the project using ESLint. |

## Folder Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   ├── config/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── store/
│   ├── styles/
│   └── theme/
└── .env.example
```

This setup is ready to integrate further modules like the Nano Banana enhancer, Gemini prompt pipelines, and additional user-defined APIs.
