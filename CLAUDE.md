# Duck Rift Development Guide

## Build Commands

- `pnpm start`: Copy assets, build, and start dev server with hot reload
- `pnpm build`: Copy assets and build for production
- `pnpm dev`: Copy assets and build in dev mode with watch

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

Always run `pnpm build` to verify the game compiles.
