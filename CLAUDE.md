# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript SDK for the [Piston](https://github.com/engineer-man/piston) code execution API. Piston is a high-performance engine for safely executing untrusted code in sandboxed environments.

## Commands

```bash
npm run build    # Build TypeScript (outputs to dist/)
npm test         # Run tests with vitest (watch mode)
npm run lint     # Check code with Biome
npm run format   # Fix lint/format issues with Biome

# Run single test file
npx vitest src/client.spec.ts

# Run tests once (no watch)
npx vitest run
```

## Architecture

```
src/
├── index.ts        # Public API exports
├── client.ts       # Piston class - main entry point for API calls
├── errors.ts       # Error class hierarchy (PistonError base, specific error subclasses)
└── types/
    ├── common.ts   # Shared types (FileEncoding, ExecutionStatus, SignalName)
    ├── request.ts  # ExecuteRequest, ExecuteFile, constraint interfaces
    └── response.ts # ExecuteResponse, StageResult, ErrorResponse
```

**Key pattern**: SDK uses camelCase (e.g., `runTimeout`), but the API uses snake_case (e.g., `run_timeout`). The `Piston` class handles this conversion in `toRawRequest()` and `toStageResult()`.

## Code Style

- **Indentation**: Tabs
- **Quotes**: Double quotes
- **Imports**: Use `.js` extension for local imports (e.g., `import { Piston } from "./client.js"`)
- **Type imports**: Use `import type` for type-only imports
- **Tests**: Co-located with source files as `*.spec.ts`
