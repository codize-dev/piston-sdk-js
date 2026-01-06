/**
 * Timeout and Process Termination Demo
 *
 * This example demonstrates how Piston handles timeouts and
 * various process termination scenarios.
 */

import { Piston } from "@codize/piston";

const PISTON_URL = "https://emkc.org/api/v2/piston";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
	const piston = new Piston(PISTON_URL);

	// Example 1: Infinite loop (will be killed by timeout)
	console.log("=== Example 1: Infinite Loop (Timeout) ===\n");

	const infiniteLoopResult = await piston.execute({
		language: "python",
		version: "3.x",
		files: [
			{
				content: `
print("Starting infinite loop...")
i = 0
while True:
    i += 1
    if i % 1000000 == 0:
        print(f"Iteration: {i}")
`.trim(),
			},
		],
		runTimeout: 1000, // 1 second timeout
	});

	console.log("stdout:", JSON.stringify(infiniteLoopResult.run.stdout));
	console.log("Exit code:", infiniteLoopResult.run.code);
	console.log("Signal:", infiniteLoopResult.run.signal);
	console.log("Status:", infiniteLoopResult.run.status);
	console.log("Message:", infiniteLoopResult.run.message);
	console.log("Wall time:", infiniteLoopResult.run.wallTime, "ms");
	console.log();

	// Example 2: CPU-intensive task
	console.log("=== Example 2: CPU-Intensive Task ===\n");

	const cpuIntensiveResult = await piston.execute({
		language: "python",
		version: "3.x",
		files: [
			{
				content: `
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print("Calculating fibonacci...")
# This is intentionally slow (exponential time complexity)
for i in range(25):
    print(f"fib({i}) = {fibonacci(i)}")
`.trim(),
			},
		],
		runTimeout: 2000, // 2 second timeout
		runCpuTime: 1500, // 1.5 second CPU time limit
	});

	console.log("stdout:", JSON.stringify(cpuIntensiveResult.run.stdout));
	console.log("Exit code:", cpuIntensiveResult.run.code);
	console.log("Status:", cpuIntensiveResult.run.status ?? "success");
	console.log("CPU time:", cpuIntensiveResult.run.cpuTime, "ms");
	console.log();

	// Example 3: Sleep vs CPU time
	console.log("=== Example 3: Sleep vs CPU Time ===\n");
	console.log("Sleep uses wall time but not CPU time:\n");

	const sleepResult = await piston.execute({
		language: "python",
		version: "3.x",
		files: [
			{
				content: `
import time
print("Starting sleep...")
time.sleep(0.5)  # Sleep for 0.5 seconds
print("Done sleeping!")
`.trim(),
			},
		],
		runTimeout: 3000, // 3 second wall time
		runCpuTime: 100, // Only 100ms CPU time (should be enough)
	});

	console.log("stdout:", JSON.stringify(sleepResult.run.stdout));
	console.log("Status:", sleepResult.run.status ?? "success");
	console.log("CPU time:", sleepResult.run.cpuTime, "ms");
	console.log("Wall time:", sleepResult.run.wallTime, "ms");
	console.log();

	// Example 4: Process exit codes
	console.log("=== Example 4: Various Exit Codes ===\n");

	const exitCodes = [0, 1, 42, 255];

	for (const exitCode of exitCodes) {
		const result = await piston.execute({
			language: "python",
			version: "3.x",
			files: [
				{
					content: `
import sys
sys.exit(${exitCode})
`.trim(),
				},
			],
		});

		console.log(
			`exit(${exitCode}): code=${result.run.code}, signal=${result.run.signal}`,
		);
		await sleep(1000); // Rate limit: 5 req/sec
	}
	console.log();

	// Example 5: Compile timeout
	console.log("=== Example 5: Compile with Timeout ===\n");

	const compileResult = await piston.execute({
		language: "c",
		version: "*",
		files: [
			{
				content: `
#include <stdio.h>

// Template metaprogramming-like heavy code (simplified)
#define REPEAT_10(x) x x x x x x x x x x
#define REPEAT_100(x) REPEAT_10(REPEAT_10(x))

int main() {
    REPEAT_100(printf("Line\\n");)
    return 0;
}
`.trim(),
			},
		],
		compileTimeout: 5000, // 5 seconds
	});

	if (compileResult.compile) {
		console.log("Compile status:", compileResult.compile.status ?? "success");
		console.log("Compile exit code:", compileResult.compile.code);
		console.log("Compile CPU time:", compileResult.compile.cpuTime, "ms");
	}
	console.log("Run exit code:", compileResult.run.code);
	console.log("stdout:", JSON.stringify(compileResult.run.stdout));
}

main().catch(console.error);
