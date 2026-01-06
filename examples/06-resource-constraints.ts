/**
 * Resource Constraints Example
 *
 * This example demonstrates how to set resource constraints
 * (timeout, CPU time, memory limits) for code execution.
 *
 * Run with: bun examples/06-resource-constraints.ts
 */

import { Piston } from "@codize/piston";

const PISTON_URL = "https://emkc.org/api/v2/piston";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
	const piston = new Piston(PISTON_URL);

	// Example 1: Normal execution with resource monitoring
	console.log("=== Example 1: Resource Monitoring ===\n");

	const normalResult = await piston.execute({
		language: "python",
		version: "3.x",
		files: [
			{
				content: `
# Simple computation
total = sum(range(100000))
print(f"Sum: {total}")
`.trim(),
			},
		],
	});

	console.log("stdout:", JSON.stringify(normalResult.run.stdout));
	console.log("CPU time:", normalResult.run.cpuTime, "ms");
	console.log("Wall time:", normalResult.run.wallTime, "ms");
	console.log("Memory:", normalResult.run.memory, "bytes");
	console.log();

	// Example 2: Setting timeout limits
	console.log("=== Example 2: With Timeout Limits ===\n");

	const timeoutResult = await piston.execute({
		language: "python",
		version: "3.x",
		files: [
			{
				content: `
import time
print("Starting...")
# This should complete within the timeout
time.sleep(0.5)
print("Done!")
`.trim(),
			},
		],
		runTimeout: 3000, // 3 seconds
		runCpuTime: 3000,
	});

	console.log("stdout:", JSON.stringify(timeoutResult.run.stdout));
	console.log("Status:", timeoutResult.run.status ?? "success");
	console.log("Wall time:", timeoutResult.run.wallTime, "ms");
	console.log();

	// Example 3: Memory-intensive operation
	console.log("=== Example 3: Memory-Intensive Operation ===\n");

	const memoryResult = await piston.execute({
		language: "python",
		version: "3.x",
		files: [
			{
				content: `
# Create a moderately large list
data = list(range(100000))
print(f"Created list with {len(data)} elements")
print(f"First 5: {data[:5]}")
print(f"Last 5: {data[-5:]}")
`.trim(),
			},
		],
		runMemoryLimit: 128 * 1024 * 1024, // 128MB
	});

	console.log("stdout:", JSON.stringify(memoryResult.run.stdout));
	console.log("Memory used:", memoryResult.run.memory, "bytes");
	console.log();

	// Example 4: Compile-time constraints
	console.log("=== Example 4: Compile-Time Constraints ===\n");

	const compileResult = await piston.execute({
		language: "c",
		version: "*",
		files: [
			{
				content: `
#include <stdio.h>

int main() {
    printf("Compiled and running!\\n");
    return 0;
}
`.trim(),
			},
		],
		compileTimeout: 10000, // 10 seconds for compilation
		compileCpuTime: 10000,
		runTimeout: 3000, // 3 seconds for execution
		runCpuTime: 3000,
	});

	console.log("stdout:", JSON.stringify(compileResult.run.stdout));
	if (compileResult.compile) {
		console.log("Compile CPU time:", compileResult.compile.cpuTime, "ms");
		console.log("Compile memory:", compileResult.compile.memory, "bytes");
	}
	console.log("Run CPU time:", compileResult.run.cpuTime, "ms");
	console.log("Run memory:", compileResult.run.memory, "bytes");
	console.log();

	// Example 5: Demonstrating resource usage comparison
	console.log("=== Example 5: Resource Usage Comparison ===\n");

	const algorithms = [
		{
			name: "Simple loop",
			code: `
total = 0
for i in range(10000):
    total += i
print(total)
`.trim(),
		},
		{
			name: "List comprehension",
			code: `
total = sum([i for i in range(10000)])
print(total)
`.trim(),
		},
		{
			name: "Generator expression",
			code: `
total = sum(i for i in range(10000))
print(total)
`.trim(),
		},
		{
			name: "Built-in range sum",
			code: `
total = sum(range(10000))
print(total)
`.trim(),
		},
	];

	console.log("Comparing different approaches to sum numbers:\n");
	console.log(
		"| Algorithm            | CPU (ms) | Wall (ms) | Memory (bytes) |",
	);
	console.log(
		"|----------------------|----------|-----------|----------------|",
	);

	for (const algo of algorithms) {
		const result = await piston.execute({
			language: "python",
			version: "3.x",
			files: [{ content: algo.code }],
		});

		const cpu = String(result.run.cpuTime ?? "-").padStart(8);
		const wall = String(result.run.wallTime ?? "-").padStart(9);
		const mem = String(result.run.memory ?? "-").padStart(14);
		console.log(`| ${algo.name.padEnd(20)} |${cpu} |${wall} |${mem} |`);
		await sleep(1000); // Rate limit: 5 req/sec
	}
}

main().catch(console.error);
