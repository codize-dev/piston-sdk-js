import type { FileEncoding } from "./common.js";

/**
 * A file to be executed.
 */
export interface ExecuteFile {
	/**
	 * File content (required).
	 */
	content: string;

	/**
	 * File name.
	 * If omitted, auto-generated as `file{i}.code`.
	 * Directory traversal is not allowed.
	 */
	name?: string;

	/**
	 * File content encoding.
	 * @default "utf8"
	 */
	encoding?: FileEncoding;
}

/**
 * Compile stage constraint options.
 */
export interface CompileConstraints {
	/**
	 * Maximum compile wall-time in milliseconds.
	 * Cannot exceed the server's configured limit.
	 * @default 10000
	 */
	compileTimeout?: number;

	/**
	 * Maximum compile CPU time in milliseconds.
	 * Cannot exceed the server's configured limit.
	 * @default 10000
	 */
	compileCpuTime?: number;

	/**
	 * Maximum memory usage during compilation in bytes.
	 * -1 means unlimited.
	 * Cannot exceed the server's configured limit.
	 * @default -1
	 */
	compileMemoryLimit?: number;
}

/**
 * Run stage constraint options.
 */
export interface RunConstraints {
	/**
	 * Maximum run wall-time in milliseconds.
	 * Cannot exceed the server's configured limit.
	 * @default 3000
	 */
	runTimeout?: number;

	/**
	 * Maximum run CPU time in milliseconds.
	 * Cannot exceed the server's configured limit.
	 * @default 3000
	 */
	runCpuTime?: number;

	/**
	 * Maximum memory usage during execution in bytes.
	 * -1 means unlimited.
	 * Cannot exceed the server's configured limit.
	 * @default -1
	 */
	runMemoryLimit?: number;
}

/**
 * Execute request parameters.
 */
export interface ExecuteRequest extends CompileConstraints, RunConstraints {
	/**
	 * Language name or alias.
	 * Must be a language available from `/api/v2/runtimes`.
	 */
	language: string;

	/**
	 * Language version as a SemVer selector.
	 * Examples: "15.10.0", "3.x", ">=3.9.0"
	 */
	version: string;

	/**
	 * Files to execute.
	 * The first file is treated as the main file.
	 * At least one UTF-8 encoded file is required (except for the `file` runtime).
	 */
	files: ExecuteFile[];

	/**
	 * Standard input text.
	 * A newline is automatically appended if not present.
	 * @default ""
	 */
	stdin?: string;

	/**
	 * Command-line arguments.
	 * @default []
	 */
	args?: string[];
}
