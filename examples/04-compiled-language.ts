/**
 * Compiled Language Example
 *
 * This example demonstrates executing compiled languages (C, C++, Rust)
 * and shows both compile and run stage results.
 *
 * Run with: bun examples/04-compiled-language.ts
 */

import { Piston } from "@codize/piston";

const PISTON_URL = "https://emkc.org/api/v2/piston";

async function main() {
	const piston = new Piston(PISTON_URL);

	// Example 1: C Program
	console.log("=== C Program ===\n");

	const cResult = await piston.execute({
		language: "c",
		version: "*",
		files: [
			{
				name: "main.c",
				content: `
#include <stdio.h>

int main() {
    printf("Hello from C!\\n");
    printf("Size of int: %lu bytes\\n", sizeof(int));
    printf("Size of long: %lu bytes\\n", sizeof(long));
    return 0;
}
`.trim(),
			},
		],
	});

	console.log("Language:", cResult.language);
	console.log("Version:", cResult.version);
	if (cResult.compile) {
		console.log("\n[Compile Stage]");
		console.log("  Exit code:", cResult.compile.code);
		console.log("  CPU time:", cResult.compile.cpuTime, "ms");
		console.log("  Memory:", cResult.compile.memory, "bytes");
		console.log("  stderr:", JSON.stringify(cResult.compile.stderr));
	}
	console.log("\n[Run Stage]");
	console.log("  stdout:", JSON.stringify(cResult.run.stdout));
	console.log("  Exit code:", cResult.run.code);
	console.log();

	// Example 2: C++ Program
	console.log("=== C++ Program ===\n");

	const cppResult = await piston.execute({
		language: "c++",
		version: "*",
		files: [
			{
				name: "main.cpp",
				content: `
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {5, 2, 8, 1, 9};

    std::cout << "Original: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;

    std::sort(numbers.begin(), numbers.end());

    std::cout << "Sorted:   ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;

    return 0;
}
`.trim(),
			},
		],
	});

	console.log("Language:", cppResult.language);
	console.log("Version:", cppResult.version);
	if (cppResult.compile) {
		console.log("\n[Compile Stage]");
		console.log("  Exit code:", cppResult.compile.code);
		console.log("  CPU time:", cppResult.compile.cpuTime, "ms");
		console.log("  stderr:", JSON.stringify(cppResult.compile.stderr));
	}
	console.log("\n[Run Stage]");
	console.log("  stdout:", JSON.stringify(cppResult.run.stdout));
	console.log("  Exit code:", cppResult.run.code);
	console.log();

	// Example 3: Rust Program
	console.log("=== Rust Program ===\n");

	const rustResult = await piston.execute({
		language: "rust",
		version: "*",
		files: [
			{
				name: "main.rs",
				content: `
fn main() {
    let message = "Hello from Rust!";
    println!("{}", message);

    // Demonstrate some Rust features
    let numbers: Vec<i32> = (1..=5).collect();
    let sum: i32 = numbers.iter().sum();
    println!("Sum of 1 to 5: {}", sum);

    // Pattern matching
    let result = match sum {
        15 => "Correct!",
        _ => "Unexpected",
    };
    println!("{}", result);
}
`.trim(),
			},
		],
	});

	console.log("Language:", rustResult.language);
	console.log("Version:", rustResult.version);
	if (rustResult.compile) {
		console.log("\n[Compile Stage]");
		console.log("  Exit code:", rustResult.compile.code);
		console.log("  CPU time:", rustResult.compile.cpuTime, "ms");
		console.log("  Memory:", rustResult.compile.memory, "bytes");
		console.log("  stderr:", JSON.stringify(rustResult.compile.stderr));
	}
	console.log("\n[Run Stage]");
	console.log("  stdout:", JSON.stringify(rustResult.run.stdout));
	console.log("  Exit code:", rustResult.run.code);
}

main().catch(console.error);
