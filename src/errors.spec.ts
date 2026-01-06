import { describe, expect, it } from "vitest";
import {
	PistonContentTypeError,
	PistonError,
	PistonNetworkError,
	PistonServerError,
	PistonValidationError,
} from "./errors.js";

describe("PistonError", () => {
	it("should be an instance of Error", () => {
		const error = new PistonError("test message");
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(PistonError);
	});

	it("should have correct name", () => {
		const error = new PistonError("test message");
		expect(error.name).toBe("PistonError");
	});

	it("should have correct message", () => {
		const error = new PistonError("test message");
		expect(error.message).toBe("test message");
	});

	it("should have stack trace", () => {
		const error = new PistonError("test message");
		expect(error.stack).toBeDefined();
	});
});

describe("PistonValidationError", () => {
	it("should be an instance of PistonError", () => {
		const error = new PistonValidationError("validation failed");
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(PistonError);
		expect(error).toBeInstanceOf(PistonValidationError);
	});

	it("should have correct name", () => {
		const error = new PistonValidationError("validation failed");
		expect(error.name).toBe("PistonValidationError");
	});

	it("should have statusCode 400", () => {
		const error = new PistonValidationError("validation failed");
		expect(error.statusCode).toBe(400);
	});

	it("should have correct message", () => {
		const error = new PistonValidationError("language is required");
		expect(error.message).toBe("language is required");
	});
});

describe("PistonContentTypeError", () => {
	it("should be an instance of PistonError", () => {
		const error = new PistonContentTypeError();
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(PistonError);
		expect(error).toBeInstanceOf(PistonContentTypeError);
	});

	it("should have correct name", () => {
		const error = new PistonContentTypeError();
		expect(error.name).toBe("PistonContentTypeError");
	});

	it("should have statusCode 415", () => {
		const error = new PistonContentTypeError();
		expect(error.statusCode).toBe(415);
	});

	it("should have default message", () => {
		const error = new PistonContentTypeError();
		expect(error.message).toBe("requests must be of type application/json");
	});

	it("should accept custom message", () => {
		const error = new PistonContentTypeError("custom message");
		expect(error.message).toBe("custom message");
	});
});

describe("PistonServerError", () => {
	it("should be an instance of PistonError", () => {
		const error = new PistonServerError();
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(PistonError);
		expect(error).toBeInstanceOf(PistonServerError);
	});

	it("should have correct name", () => {
		const error = new PistonServerError();
		expect(error.name).toBe("PistonServerError");
	});

	it("should have statusCode 500", () => {
		const error = new PistonServerError();
		expect(error.statusCode).toBe(500);
	});

	it("should have default message", () => {
		const error = new PistonServerError();
		expect(error.message).toBe("Internal server error");
	});

	it("should accept custom message", () => {
		const error = new PistonServerError("custom error");
		expect(error.message).toBe("custom error");
	});
});

describe("PistonNetworkError", () => {
	it("should be an instance of PistonError", () => {
		const error = new PistonNetworkError("connection failed");
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(PistonError);
		expect(error).toBeInstanceOf(PistonNetworkError);
	});

	it("should have correct name", () => {
		const error = new PistonNetworkError("connection failed");
		expect(error.name).toBe("PistonNetworkError");
	});

	it("should have correct message", () => {
		const error = new PistonNetworkError("connection failed");
		expect(error.message).toBe("connection failed");
	});

	it("should store cause when provided", () => {
		const cause = new Error("original error");
		const error = new PistonNetworkError("connection failed", cause);
		expect(error.cause).toBe(cause);
	});

	it("should have undefined cause when not provided", () => {
		const error = new PistonNetworkError("connection failed");
		expect(error.cause).toBeUndefined();
	});
});

describe("Error hierarchy", () => {
	it("should allow catching all Piston errors with PistonError", () => {
		const errors = [
			new PistonValidationError("test"),
			new PistonContentTypeError(),
			new PistonServerError(),
			new PistonNetworkError("test"),
		];

		for (const error of errors) {
			expect(error).toBeInstanceOf(PistonError);
		}
	});

	it("should allow distinguishing specific error types", () => {
		const validationError = new PistonValidationError("test");
		const contentTypeError = new PistonContentTypeError();
		const serverError = new PistonServerError();
		const networkError = new PistonNetworkError("test");

		expect(validationError).not.toBeInstanceOf(PistonContentTypeError);
		expect(contentTypeError).not.toBeInstanceOf(PistonValidationError);
		expect(serverError).not.toBeInstanceOf(PistonNetworkError);
		expect(networkError).not.toBeInstanceOf(PistonServerError);
	});
});
