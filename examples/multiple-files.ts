/**
 * Multiple Files Example
 *
 * This example demonstrates how to execute code that spans
 * multiple files (modules/imports).
 */

import { Piston } from "@codize/piston";

const PISTON_URL = "https://emkc.org/api/v2/piston";

async function main() {
	const piston = new Piston(PISTON_URL);

	// Example 1: Python with multiple modules
	console.log("=== Example 1: Python Multiple Modules ===\n");

	const pythonResult = await piston.execute({
		language: "python",
		version: "3.x",
		files: [
			{
				name: "main.py",
				content: `
from utils import greet, calculate
from constants import APP_NAME, VERSION

print(f"{APP_NAME} v{VERSION}")
print()
print(greet("Alice"))
print(greet("Bob"))
print()
print(f"Sum: {calculate.add(10, 20)}")
print(f"Product: {calculate.multiply(5, 6)}")
`.trim(),
			},
			{
				name: "utils.py",
				content: `
def greet(name):
    return f"Hello, {name}!"

class calculate:
    @staticmethod
    def add(a, b):
        return a + b

    @staticmethod
    def multiply(a, b):
        return a * b
`.trim(),
			},
			{
				name: "constants.py",
				content: `
APP_NAME = "Multi-File Demo"
VERSION = "1.0.0"
`.trim(),
			},
		],
	});

	console.log("stdout:", JSON.stringify(pythonResult.run.stdout));
	console.log();

	// Example 2: C with header files
	console.log("=== Example 2: C with Header Files ===\n");

	const cResult = await piston.execute({
		language: "c",
		version: "*",
		files: [
			{
				name: "main.c",
				content: `
#include <stdio.h>
#include "math_utils.h"
#include "string_utils.h"

int main() {
    // Math operations
    printf("5 + 3 = %d\\n", add(5, 3));
    printf("5 * 3 = %d\\n", multiply(5, 3));
    printf("2^8 = %d\\n", power(2, 8));

    // String operations
    printf("\\n");
    print_header("Results");

    return 0;
}
`.trim(),
			},
			{
				name: "math_utils.h",
				content: `
#ifndef MATH_UTILS_H
#define MATH_UTILS_H

int add(int a, int b) {
    return a + b;
}

int multiply(int a, int b) {
    return a * b;
}

int power(int base, int exp) {
    int result = 1;
    for (int i = 0; i < exp; i++) {
        result *= base;
    }
    return result;
}

#endif
`.trim(),
			},
			{
				name: "string_utils.h",
				content: `
#ifndef STRING_UTILS_H
#define STRING_UTILS_H

#include <stdio.h>
#include <string.h>

void print_header(const char* text) {
    int len = strlen(text);
    for (int i = 0; i < len + 4; i++) printf("=");
    printf("\\n");
    printf("= %s =\\n", text);
    for (int i = 0; i < len + 4; i++) printf("=");
    printf("\\n");
}

#endif
`.trim(),
			},
		],
	});

	if (cResult.compile) {
		console.log("Compile status:", cResult.compile.code === 0 ? "OK" : "Error");
		console.log("Compile stderr:", JSON.stringify(cResult.compile.stderr));
	}
	console.log("stdout:", JSON.stringify(cResult.run.stdout));
	console.log();

	// Example 3: JavaScript with CommonJS-style modules
	console.log("=== Example 3: JavaScript Multiple Files ===\n");

	const jsResult = await piston.execute({
		language: "javascript",
		version: "*",
		files: [
			{
				name: "index.js",
				content: `
const config = require('./config.js');
const { formatDate, formatCurrency } = require('./formatters.js');

console.log('App:', config.appName);
console.log('Version:', config.version);
console.log();
console.log('Date:', formatDate(new Date()));
console.log('Price:', formatCurrency(99.99));
`.trim(),
			},
			{
				name: "config.js",
				content: `
module.exports = {
    appName: 'Multi-File JS Demo',
    version: '2.0.0',
    debug: false
};
`.trim(),
			},
			{
				name: "formatters.js",
				content: `
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

module.exports = { formatDate, formatCurrency };
`.trim(),
			},
		],
	});

	console.log("stdout:", JSON.stringify(jsResult.run.stdout));
}

main().catch(console.error);
