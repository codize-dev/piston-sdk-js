/**
 * Error Handling Example
 *
 * This example demonstrates how to handle various errors that can
 * occur when using the Piston SDK.
 *
 * Run with: bun examples/05-error-handling.ts
 */

import {
	Piston,
	PistonError,
	PistonNetworkError,
	PistonValidationError,
} from "@codize/piston";

const PISTON_URL = "https://emkc.org/api/v2/piston";

async function main() {
	const piston = new Piston(PISTON_URL);

	// Example 1: Runtime Error (code with bugs)
	console.log("=== Example 1: Runtime Error ===\n");

	const runtimeErrorResult = await piston.execute({
		language: "python",
		version: "3.x",
		files: [
			{
				content: `
# This will raise a ZeroDivisionError
result = 10 / 0
print(result)
`.trim(),
			},
		],
	});

	console.log("Exit code:", runtimeErrorResult.run.code);
	console.log("stderr:", JSON.stringify(runtimeErrorResult.run.stderr));
	console.log();

	// Example 2: Syntax Error
	console.log("=== Example 2: Syntax Error ===\n");

	const syntaxErrorResult = await piston.execute({
		language: "python",
		version: "3.x",
		files: [
			{
				content: `
# Invalid Python syntax
def broken_function(
    print("missing closing parenthesis")
`.trim(),
			},
		],
	});

	console.log("Exit code:", syntaxErrorResult.run.code);
	console.log("stderr:", JSON.stringify(syntaxErrorResult.run.stderr));
	console.log();

	// Example 3: Compile Error (C with bugs)
	console.log("=== Example 3: Compile Error ===\n");

	const compileErrorResult = await piston.execute({
		language: "c",
		version: "*",
		files: [
			{
				content: `
#include <stdio.h>

int main() {
    // Missing semicolon
    printf("Hello")
    return 0;
}
`.trim(),
			},
		],
	});

	if (compileErrorResult.compile) {
		console.log("Compile exit code:", compileErrorResult.compile.code);
		console.log(
			"Compile stderr:",
			JSON.stringify(compileErrorResult.compile.stderr),
		);
	}
	console.log("Run exit code:", compileErrorResult.run.code);
	console.log("Run stdout:", JSON.stringify(compileErrorResult.run.stdout));
	console.log();

	// Example 4: Invalid Language (API Error)
	console.log("=== Example 4: Invalid Language (API Error) ===\n");

	try {
		await piston.execute({
			language: "nonexistent_language",
			version: "1.0.0",
			files: [{ content: "print('hello')" }],
		});
	} catch (error) {
		if (error instanceof PistonValidationError) {
			console.log("Caught PistonValidationError:");
			console.log("  Message:", error.message);
		} else {
			throw error;
		}
	}
	console.log();

	// Example 5: Network Error (wrong URL)
	console.log("=== Example 5: Network Error ===\n");

	const badPiston = new Piston("https://invalid-url.example.com/api");

	try {
		await badPiston.execute({
			language: "python",
			version: "3.x",
			files: [{ content: "print('hello')" }],
		});
	} catch (error) {
		if (error instanceof PistonNetworkError) {
			console.log("Caught PistonNetworkError:");
			console.log("  Message:", error.message);
			console.log("  Cause:", error.cause);
		} else {
			throw error;
		}
	}
	console.log();

	// Example 6: Generic Error Handling
	console.log("=== Example 6: Generic Error Handling Pattern ===\n");

	try {
		await piston.execute({
			language: "invalid",
			version: "*",
			files: [{ content: "" }],
		});
	} catch (error) {
		if (error instanceof PistonValidationError) {
			console.log("Validation error - check your request parameters");
		} else if (error instanceof PistonNetworkError) {
			console.log("Network error - check your connection");
		} else if (error instanceof PistonError) {
			console.log("General Piston error:", error.message);
		} else {
			console.log("Unexpected error:", error);
		}
	}
}

main().catch(console.error);
