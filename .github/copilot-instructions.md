# Copilot Instructions

Please apply the instructions where appropriate.

## Terminal Commands

Whenever you suggest terminal commands, please ensure that they work on Windows.
Whenever you think about suggesting a terminal command for Linux or MacOS, stop immediately and find an alternative that works on Windows. If you are unsure about how to do this, please ask for clarification before proceeding.
Please always tell the user explicitly whether the command is .cmd or .ps1, and whether it should be run in Command Prompt or PowerShell.

## Code Style

When suggesting code snippets, please ensure that they follow the project's code style guidelines. If you are unsure about the code style, please ask for clarification before proceeding.

### Use of 'any'

Avoid using 'any' in TypeScript code. If you find yourself needing to use 'any', please ask for clarification on the specific types that should be used instead.
The codebase should strive for type safety, and using 'any' can lead to potential issues down the line. Always aim to use specific types or interfaces to maintain the integrity of the code.
