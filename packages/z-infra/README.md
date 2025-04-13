# @vibe/z-infra

This package contains infrastructure and system-level components for the Vibe game platform.

## Naming Convention

The package is named `z-infra` (instead of `infrastructure`) to ensure it appears at the bottom of the packages directory when sorted alphabetically. This visual distinction helps emphasize its role as a foundational layer that builds upon and integrates with other packages (`@vibe/shared`, `@vibe/client`, and `@vibe/server`).

## Purpose

This package serves as the integration layer and infrastructure foundation for the Vibe platform, providing:
- System-level utilities and services
- Integration points between client and server
- Infrastructure components and configurations
- Platform-wide functionality

## Dependencies

This package depends on all other packages in the workspace:
- `@vibe/shared` - For shared types and utilities
- `@vibe/client` - For client-side integration
- `@vibe/server` - For server-side integration 