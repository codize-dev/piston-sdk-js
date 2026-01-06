/**
 * Standard Input and Arguments Example
 *
 * This example demonstrates how to pass stdin and command-line
 * arguments to the executed code.
 *
 * Run with: bun examples/02-stdin-args.ts
 */

import { Piston } from "@codize/piston";

const PISTON_URL = "https://emkc.org/api/v2/piston";

async function main() {
	const piston = new Piston(PISTON_URL);

	// Example 1: Using stdin
	console.log("=== Example 1: Using stdin ===\n");

	const stdinResult = await piston.execute({
		language: "python",
		version: "3.x",
		files: [
			{
				content: `
name = input("Enter your name: ")
print(f"Hello, {name}!")
`.trim(),
			},
		],
		stdin: "Alice",
	});

	console.log("stdout:", JSON.stringify(stdinResult.run.stdout));

	// Example 2: Using command-line arguments
	console.log("=== Example 2: Using command-line arguments ===\n");

	const argsResult = await piston.execute({
		language: "python",
		version: "3.x",
		files: [
			{
				content: `
import sys
print(f"Script name: {sys.argv[0]}")
print(f"Arguments: {sys.argv[1:]}")
print(f"Total args: {len(sys.argv) - 1}")
`.trim(),
			},
		],
		args: ["arg1", "arg2", "arg3"],
	});

	console.log("stdout:", JSON.stringify(argsResult.run.stdout));

	// Example 3: Combining stdin and args
	console.log("=== Example 3: Combining stdin and args ===\n");

	const combinedResult = await piston.execute({
		language: "python",
		version: "3.x",
		files: [
			{
				content: `
import sys

# Read greeting type from args
greeting_type = sys.argv[1] if len(sys.argv) > 1 else "Hello"

# Read names from stdin (one per line)
import sys as sys_stdin
names = []
for line in sys_stdin.stdin:
    name = line.strip()
    if name:
        names.append(name)

for name in names:
    print(f"{greeting_type}, {name}!")
`.trim(),
			},
		],
		stdin: "Alice\nBob\nCharlie",
		args: ["Welcome"],
	});

	console.log("stdout:", JSON.stringify(combinedResult.run.stdout));
}

main().catch(console.error);
