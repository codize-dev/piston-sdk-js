import type { ExecutionStatus, SignalName } from "./common.js";

/**
 * Stage execution result (compile or run).
 */
export interface StageResult {
	/**
	 * Standard output content.
	 */
	stdout: string;

	/**
	 * Standard error output content.
	 */
	stderr: string;

	/**
	 * Combined stdout and stderr in the order received.
	 */
	output: string;

	/**
	 * Exit code (0-255).
	 * `null` if the process was killed by a signal.
	 */
	code: number | null;

	/**
	 * Signal name that killed the process.
	 * `null` if the process exited normally.
	 */
	signal: SignalName | null;

	/**
	 * Human-readable message about the status.
	 */
	message: string | null;

	/**
	 * Two-character status code.
	 * `null` on success.
	 */
	status: ExecutionStatus | null;

	/**
	 * CPU time consumed in milliseconds.
	 */
	cpuTime: number | null;

	/**
	 * Wall-clock time elapsed in milliseconds.
	 */
	wallTime: number | null;

	/**
	 * Peak memory usage in bytes.
	 */
	memory: number | null;
}

/**
 * Execute response.
 */
export interface ExecuteResponse {
	/**
	 * Actual language name used (not an alias).
	 */
	language: string;

	/**
	 * Full semantic version of the runtime used.
	 */
	version: string;

	/**
	 * Compile stage result.
	 * Only present for compiled languages.
	 */
	compile?: StageResult;

	/**
	 * Run stage result.
	 * Always present.
	 */
	run: StageResult;
}

/**
 * Error response from the API.
 */
export interface ErrorResponse {
	/**
	 * Error message.
	 */
	message: string;
}
