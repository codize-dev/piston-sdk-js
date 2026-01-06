/**
 * Multi-Language Execution Example
 *
 * This example demonstrates executing code in various programming
 * languages supported by Piston.
 */

import { Piston } from "@codize/piston";

const PISTON_URL = "https://emkc.org/api/v2/piston";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface LanguageExample {
	name: string;
	language: string;
	version: string;
	code: string;
}

const examples: LanguageExample[] = [
	{
		name: "Python",
		language: "python",
		version: "3.x",
		code: `print("Hello from Python!")`,
	},
	{
		name: "JavaScript (Node.js)",
		language: "javascript",
		version: "*",
		code: `console.log("Hello from JavaScript!");`,
	},
	{
		name: "TypeScript",
		language: "typescript",
		version: "*",
		code: `const message: string = "Hello from TypeScript!";
console.log(message);`,
	},
	{
		name: "Ruby",
		language: "ruby",
		version: "*",
		code: `puts "Hello from Ruby!"`,
	},
	{
		name: "Go",
		language: "go",
		version: "*",
		code: `package main

import "fmt"

func main() {
	fmt.Println("Hello from Go!")
}`,
	},
	{
		name: "Bash",
		language: "bash",
		version: "*",
		code: `echo "Hello from Bash!"`,
	},
	{
		name: "PHP",
		language: "php",
		version: "*",
		code: `<?php echo "Hello from PHP!\\n"; ?>`,
	},
	{
		name: "Lua",
		language: "lua",
		version: "*",
		code: `print("Hello from Lua!")`,
	},
];

async function main() {
	const piston = new Piston(PISTON_URL);

	console.log("=== Multi-Language Execution Demo ===\n");

	for (const example of examples) {
		console.log(`--- ${example.name} ---`);

		try {
			const result = await piston.execute({
				language: example.language,
				version: example.version,
				files: [{ content: example.code }],
			});

			console.log(`Version: ${result.version}`);
			console.log(`stdout: ${JSON.stringify(result.run.stdout)}`);
			console.log(`stderr: ${JSON.stringify(result.run.stderr)}`);
			console.log(`Exit code: ${result.run.code}`);
		} catch (error) {
			console.log(`Error: ${error instanceof Error ? error.message : error}`);
		}

		console.log();
		await sleep(1000); // Rate limit: 5 req/sec
	}
}

main().catch(console.error);
