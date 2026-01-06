/**
 * Base class for all Piston API errors.
 */
export class PistonError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "PistonError";
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

/**
 * Validation error (HTTP 400).
 *
 * Thrown when the request parameters are invalid.
 *
 * Common error messages:
 * - `language is required as a string`
 * - `version is required as a string`
 * - `files is required as an array`
 * - `{language}-{version} runtime is unknown`
 * - `files must include at least one utf8 encoded file`
 */
export class PistonValidationError extends PistonError {
	public readonly statusCode = 400 as const;

	constructor(message: string) {
		super(message);
		this.name = "PistonValidationError";
	}
}

/**
 * Content-Type error (HTTP 415).
 *
 * Thrown when the Content-Type header is not set to `application/json`.
 */
export class PistonContentTypeError extends PistonError {
	public readonly statusCode = 415 as const;

	constructor(message: string = "requests must be of type application/json") {
		super(message);
		this.name = "PistonContentTypeError";
	}
}

/**
 * Server error (HTTP 500).
 *
 * Thrown when an unexpected error occurs during job execution.
 */
export class PistonServerError extends PistonError {
	public readonly statusCode = 500 as const;

	constructor(message: string = "Internal server error") {
		super(message);
		this.name = "PistonServerError";
	}
}

/**
 * Network error.
 *
 * Thrown when the connection to the Piston API fails.
 * The original error is available via the standard `cause` property.
 */
export class PistonNetworkError extends PistonError {
	constructor(message: string, cause?: Error) {
		super(message);
		this.name = "PistonNetworkError";
		if (cause) {
			this.cause = cause;
		}
	}
}
