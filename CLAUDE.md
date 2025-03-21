# Duck Rift Development Guide

## Build Commands

- `pnpm start`: Copy assets, build, and start dev server with hot reload
- `pnpm build`: Copy assets and build for production
- `pnpm dev`: Copy assets and build in dev mode with watch
- `pnpm lint`: Run ESLint to check for code issues
- `pnpm lint:fix`: Run ESLint and automatically fix issues
- `pnpm format`: Run Prettier to format all source files
- `pnpm format:check`: Check if files are properly formatted

## Code Style Guidelines

- Use TypeScript strict mode with explicit types
- Follow 2-space indentation
- Use PascalCase for class names (Duck, Obstacle)
- Use camelCase for variables, methods, and properties
- Prefix private class members with visibility modifiers
- Class organization: constructor → lifecycle methods → utility methods
- Import order: external libraries → internal modules
- Error handling: null checks with if statements
- Comment important logic with descriptive comments
- Follow Phaser 3 patterns for game objects and scenes
- Keep methods focused on single responsibilities
- Use const for values that don't change

## Project Structure

- `/src/scenes`: Game scene classes (MainMenuScene, GameScene)
- `/src/objects`: Game entity classes (Duck, Obstacle)
- `/src/assets`: Game assets (images, audio)

Always run `pnpm format`, `pnpm lint`, and `pnpm build` to verify the game compiles and follows style guidelines.
