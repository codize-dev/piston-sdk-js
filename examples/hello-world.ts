/**
 * Basic Hello World Example
 *
 * This example demonstrates the simplest usage of the Piston SDK
 * to execute a Python "Hello, World!" program.
 */

import { Piston } from "@codize/piston";

const PISTON_URL = "https://emkc.org/api/v2/piston";

async function main() {
	const piston = new Piston(PISTON_URL);

	console.log("Executing Python Hello World...\n");

	const result = await piston.execute({
		language: "python",
		version: "3.x",
		files: [
			{
				content: `print("Hello, World!")`,
			},
		],
	});

	console.log("Language:", result.language);
	console.log("Version:", result.version);
	console.log("---");
	console.log("stdout:", JSON.stringify(result.run.stdout));
	console.log("stderr:", JSON.stringify(result.run.stderr));
	console.log("Exit code:", result.run.code);
}

main().catch(console.error);
