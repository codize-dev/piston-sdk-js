# @codize/piston

[![npm version](https://img.shields.io/npm/v/@codize/piston)](https://www.npmjs.com/package/@codize/piston)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

TypeScript SDK for the [Piston](https://github.com/engineer-man/piston) code execution API. Execute untrusted code safely in sandboxed environments with support for 50+ programming languages.

## Installation

```bash
# npm
npm install @codize/piston

# yarn
yarn add @codize/piston

# pnpm
pnpm add @codize/piston

# bun
bun add @codize/piston
```

## Quick Start

```typescript
import { Piston } from "@codize/piston";

const piston = new Piston("https://emkc.org/api/v2/piston");

const result = await piston.execute({
  language: "python",
  version: "3.x",
  files: [{ content: 'print("Hello, World!")' }],
});

console.log(result.run.stdout); // "Hello, World!\n"
```

## Usage

### List Available Runtimes

```typescript
import { Piston } from "@codize/piston";

const piston = new Piston("https://emkc.org/api/v2/piston");

const runtimes = await piston.runtimes();

for (const runtime of runtimes) {
  console.log(`${runtime.language} ${runtime.version}`);
}
```

### Basic Execution

```typescript
import { Piston } from "@codize/piston";

const piston = new Piston("https://emkc.org/api/v2/piston");

const result = await piston.execute({
  language: "javascript",
  version: "*",
  files: [
    {
      name: "index.js",
      content: 'console.log("Hello from JavaScript!");',
    },
  ],
});

console.log(result.run.stdout);
```

### With stdin and Arguments

```typescript
const result = await piston.execute({
  language: "python",
  version: "3.x",
  files: [
    {
      content: `
import sys
name = input()
print(f"Hello, {name}!")
print("Args:", sys.argv[1:])
`,
    },
  ],
  stdin: "Alice",
  args: ["--verbose", "--count=3"],
});
```

### Compiled Languages

```typescript
const result = await piston.execute({
  language: "c",
  version: "*",
  files: [
    {
      name: "main.c",
      content: `
#include <stdio.h>

int main() {
    printf("Hello from C!\\n");
    return 0;
}
`,
    },
  ],
});

// Check compile stage result
if (result.compile) {
  console.log("Compile stdout:", result.compile.stdout);
  console.log("Compile stderr:", result.compile.stderr);
}

console.log("Run stdout:", result.run.stdout);
```

### Resource Constraints

```typescript
const result = await piston.execute({
  language: "python",
  version: "3.x",
  files: [{ content: 'print("Hello!")' }],
  // Compile stage constraints (for compiled languages)
  compileTimeout: 10000, // 10 seconds wall-time
  compileCpuTime: 10000, // 10 seconds CPU time
  compileMemoryLimit: 256 * 1024 * 1024, // 256MB

  // Run stage constraints
  runTimeout: 3000, // 3 seconds wall-time
  runCpuTime: 3000, // 3 seconds CPU time
  runMemoryLimit: 64 * 1024 * 1024, // 64MB
});
```

### Multiple Files

```typescript
const result = await piston.execute({
  language: "python",
  version: "3.x",
  files: [
    {
      name: "main.py",
      content: `
from utils import greet
greet("World")
`,
    },
    {
      name: "utils.py",
      content: `
def greet(name):
    print(f"Hello, {name}!")
`,
    },
  ],
});
```

### Custom Headers

```typescript
// Global headers (applied to all requests)
const piston = new Piston("https://emkc.org/api/v2/piston", {
  headers: {
    Authorization: "Bearer your-api-key",
  },
});

// Per-request headers (override global headers)
const result = await piston.execute(
  {
    language: "python",
    version: "3.x",
    files: [{ content: 'print("Hello!")' }],
  },
  {
    headers: { "X-Request-Id": "req-123" },
  }
);

// Also works with runtimes()
const runtimes = await piston.runtimes({
  headers: { "X-Request-Id": "req-456" },
});
```

## Related Projects

- [Piston](https://github.com/engineer-man/piston) - The code execution engine
- [Piston API Documentation](https://github.com/engineer-man/piston#api-documentation)

## License

[MIT](./LICENSE)
