# Repository Guidelines

## Project Structure & Module Organization
- Entry point `App.tsx`; TypeScript config in `tsconfig.json`.
- Mobile code lives in `src/` with `componentes/` for reusable UI, `pantallas/` for screens, `estilos/` for styles, plus dedicated folders for hooks, config, and images.
- Native wrappers sit in `android/` and `ios/`; Metro is configured via `metro.config.js`.
- Tests belong in `__tests__/` (e.g., `App.test.tsx`). Backend helpers (if used) live under `server/`.

## Build, Test, and Development Commands
- `npm start` boots Metro for local development.
- `npm run android` / `npm run ios` build and install the app on their respective simulators/devices.
- `npm run lint` enforces ESLint + Prettier rules; run before committing.
- `npm test` executes Jest suites; ensure Metro is stopped to avoid port conflicts.
- From `server/`, use `npm run dev` (nodemon) for hot reloading or `npm start` for a plain Express run.

## Coding Style & Naming Conventions
- React Native + TypeScript with ESLint (`@react-native/eslint-config`) and Prettier (`.prettierrc.js`).
- Use single quotes, trailing commas, and avoid unnecessary arrow parens; accept Prettier defaults for indentation.
- Components/screens follow PascalCase (e.g., `UserCard.tsx`); hooks use `useXxx`; style files in `estilos/` use lowerCamelCase.
- Prefer absolute imports from `src/` when configured; otherwise group relative imports by origin (react, libraries, local).

## Testing Guidelines
- Jest with the `react-native` preset is required for components, hooks, and utilities.
- Place tests beside related features in `__tests__/` using `*.test.tsx` or `*.test.ts` naming.
- Favor render or snapshot tests for UI, unit tests for hooks/logic, and keep coverage close to feature scope.
- Run `npm test` locally; clear Metro cache (`npx react-native start --reset-cache`) if tests require a clean environment.

## Commit & Pull Request Guidelines
- Commits follow Conventional Commits (e.g., `feat(sms): add cascaded address`, `chore(android): cleanup gradle`).
- Each PR must summarize scope, rationale, linked issues, and attach Android/iOS screenshots for UI changes; call out breaking changes and affected platforms.
- Keep PRs narrow, ensure `npm run lint` and `npm test` pass, and document backend requirements if features depend on `server/` configuration.

## Security & Configuration Tips
- Never commit secrets (`.env`, keystore files). Use `server/.env.example` as the template.
- The project requires Node 18+. Clear Metro cache via `npx react-native start --reset-cache` if builds misbehave.
- Start the Express backend before flows that call it, and document any new env vars in the sample file.
