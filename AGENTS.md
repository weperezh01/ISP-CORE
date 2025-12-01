# Repository Guidelines

## Project Structure & Module Organization
App entry lives in `App.tsx` with TypeScript settings in `tsconfig.json`. Mobile code stays under `src/`: put reusable UI in `componentes/`, screens in `pantallas/`, shared styles in `estilos/`, and keep hooks, config, and images in their named folders. Native shells are `android/` and `ios/`, Metro lives in `metro.config.js`, tests belong in `__tests__/`, and any backend helper code belongs under `server/`.

## Build, Test, and Development Commands
`npm start` launches Metro for local debugging. Use `npm run android` or `npm run ios` to install the bundle on the respective simulator/device. Run `npm run lint` before every commit to enforce ESLint + Prettier. Execute `npm test` for Jest suites (ensure Metro is stopped to avoid port conflicts). API helpers in `server/` rely on `npm run dev` for nodemon hot reload or `npm start` for a plain Express session.

## Coding Style & Naming Conventions
Write React Native + TypeScript with the repo ESLint config (`@react-native/eslint-config`) and Prettier (`.prettierrc.js`). Prefer single quotes, trailing commas, minimal arrow parens, and let Prettier pick indentation. Components and screens use PascalCase (e.g., `UserCard.tsx`), hooks use the `useXxx` prefix, style sheets in `estilos/` use lowerCamelCase, and tests use `*.test.tsx`. Favor absolute imports from `src/` when available; otherwise group relative imports by dependency type.

## Testing Guidelines
Jest with the `react-native` preset powers unit, render, and snapshot tests. Keep tests beside related code in `__tests__/` using `*.test.tsx` or `*.test.ts`. Run `npm test` locally, and reset Metro (`npx react-native start --reset-cache`) if tests act up. Maintain coverage by writing tests for each new component, hook, or util.

## Commit & Pull Request Guidelines
Messages follow Conventional Commits, e.g., `feat(sms): add cascaded address`. PRs must summarize scope, rationale, linked issues, screenshots for UI changes, breaking-change callouts, and affected platforms. Ensure `npm run lint` and `npm test` pass before requesting review, and document any backend needs in `server/.env.example`.

## Security & Configuration Tips
Never commit secrets or platform keys; rely on `.env` templates. The project expects Node 18+, and stubborn Metro issues usually vanish after `npx react-native start --reset-cache`. Start the Express backend before flows that invoke it, and log any new env vars so other contributors stay unblocked.
