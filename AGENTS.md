# Repository Guidelines

## Project Structure & Module Organization
- App entry: `App.tsx`; TypeScript config: `tsconfig.json`.
- Mobile source: `src/` — `componentes/` (UI components), `pantallas/` (screens), `estilos/` (styles), `hooks/`, `config/`, `images/`.
- Native projects: `android/`, `ios/`. Metro: `metro.config.js`.
- Tests: `__tests__/` (e.g., `App.test.tsx`).
- Backend (optional local dev): `server/` (Express with `server.js`, `.env.example`).

## Build, Test, and Development Commands
- Run Metro bundler: `npm start`
- Run Android: `npm run android`
- Run iOS (macOS): `npm run ios`
- Lint code: `npm run lint`
- Run tests: `npm test`
- Backend (from `server/`): `npm run dev` (nodemon) or `npm start`

## Coding Style & Naming Conventions
- Language: React Native + TypeScript.
- Linting: ESLint (`@react-native/eslint-config`). Format with Prettier (`.prettierrc.js`).
- Indentation: Prettier defaults; single quotes; trailing commas; arrow parens avoided.
- Naming: components/screens in PascalCase (e.g., `UserCard.tsx`), hooks `useXxx`, files in `estilos/` as lowerCamelCase.
- Imports: prefer absolute from `src/` when configured, otherwise relative and grouped (react, libs, local).

## Testing Guidelines
- Framework: Jest (preset `react-native`).
- Location: place tests in `__tests__/` with `*.test.tsx/ts`.
- Scope: snapshot or render tests for components; logic in hooks should have unit tests.
- Run locally: `npm test` (ensure Metro is not occupying the same port).

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits (e.g., `feat(sms): add cascaded address` or `chore(android): cleanup gradle`).
- PRs: include summary, rationale, screenshots for UI changes, and linked issues. Note affected platforms (Android/iOS) and any breaking changes.
- Keep PRs focused and small; ensure `npm run lint` and `npm test` pass.

## Security & Configuration
- Do not commit secrets or keystores (`.env`, `*.keystore`). Use `server/.env.example` as a template.
- Node >= 18 is required. Clear Metro cache if needed: `npx react-native start --reset-cache`.
- For local backend, configure env vars in `server/.env` and start the server before app flows that depend on it.

