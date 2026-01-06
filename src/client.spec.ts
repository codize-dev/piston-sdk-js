import { beforeEach, describe, expect, it, vi } from "vitest";
import { Piston } from "./client.js";
import {
	PistonContentTypeError,
	PistonError,
	PistonNetworkError,
	PistonServerError,
	PistonValidationError,
} from "./errors.js";
import type { ExecuteRequest } from "./types/index.js";

describe("Piston", () => {
	const mockFetch = vi.fn();
	let piston: Piston;

	beforeEach(() => {
		mockFetch.mockReset();
		piston = new Piston("https://example.com/api/v2/piston", {
			fetch: mockFetch,
		});
	});

	describe("constructor", () => {
		it("should remove trailing slashes from baseUrl", async () => {
			const p1 = new Piston("https://example.com/", { fetch: mockFetch });
			const p2 = new Piston("https://example.com///", { fetch: mockFetch });

			// Execute a request to verify the URL is correct
			mockFetch.mockImplementation(() =>
				Promise.resolve(
					new Response(
						JSON.stringify({
							language: "python",
							version: "3.10.0",
							run: {
								stdout: "",
								stderr: "",
								output: "",
								code: 0,
								signal: null,
								message: null,
								status: null,
								cpu_time: 0,
								wall_time: 0,
								memory: 0,
							},
						}),
						{ status: 200 },
					),
				),
			);

			const request: ExecuteRequest = {
				language: "python",
				version: "3.10.0",
				files: [{ content: "print('hello')" }],
			};

			await p1.execute(request);
			expect(mockFetch).toHaveBeenCalledWith(
				"https://example.com/execute",
				expect.any(Object),
			);

			mockFetch.mockClear();
			await p2.execute(request);
			expect(mockFetch).toHaveBeenCalledWith(
				"https://example.com/execute",
				expect.any(Object),
			);
		});
	});

	describe("execute", () => {
		const basicRequest: ExecuteRequest = {
			language: "python",
			version: "3.10.0",
			files: [{ content: "print('Hello, World!')" }],
		};

		const mockRawResponse = {
			language: "python",
			version: "3.10.0",
			run: {
				stdout: "Hello, World!\n",
				stderr: "",
				output: "Hello, World!\n",
				code: 0,
				signal: null,
				message: null,
				status: null,
				cpu_time: 10,
				wall_time: 100,
				memory: 1000000,
			},
		};

		it("should send POST request to /execute endpoint", async () => {
			mockFetch.mockResolvedValue(
				new Response(JSON.stringify(mockRawResponse), { status: 200 }),
			);

			await piston.execute(basicRequest);

			expect(mockFetch).toHaveBeenCalledWith(
				"https://example.com/api/v2/piston/execute",
				expect.objectContaining({
					method: "POST",
					headers: { "Content-Type": "application/json" },
				}),
			);
		});

		it("should convert camelCase request to snake_case for API", async () => {
			mockFetch.mockResolvedValue(
				new Response(JSON.stringify(mockRawResponse), { status: 200 }),
			);

			const request: ExecuteRequest = {
				language: "python",
				version: "3.10.0",
				files: [{ content: "print('hello')" }],
				stdin: "input",
				args: ["arg1", "arg2"],
				compileTimeout: 15000,
				compileCpuTime: 12000,
				compileMemoryLimit: 100000000,
				runTimeout: 5000,
				runCpuTime: 4000,
				runMemoryLimit: 50000000,
			};

			await piston.execute(request);

			const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
			const body = JSON.parse(options.body as string);

			expect(body).toEqual({
				language: "python",
				version: "3.10.0",
				files: [{ content: "print('hello')" }],
				stdin: "input",
				args: ["arg1", "arg2"],
				compile_timeout: 15000,
				compile_cpu_time: 12000,
				compile_memory_limit: 100000000,
				run_timeout: 5000,
				run_cpu_time: 4000,
				run_memory_limit: 50000000,
			});
		});

		it("should only include defined optional parameters", async () => {
			mockFetch.mockResolvedValue(
				new Response(JSON.stringify(mockRawResponse), { status: 200 }),
			);

			await piston.execute(basicRequest);

			const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
			const body = JSON.parse(options.body as string);

			expect(body).toEqual({
				language: "python",
				version: "3.10.0",
				files: [{ content: "print('Hello, World!')" }],
			});
			expect(body).not.toHaveProperty("stdin");
			expect(body).not.toHaveProperty("args");
			expect(body).not.toHaveProperty("compile_timeout");
		});

		it("should convert snake_case response to camelCase", async () => {
			mockFetch.mockResolvedValue(
				new Response(JSON.stringify(mockRawResponse), { status: 200 }),
			);

			const result = await piston.execute(basicRequest);

			expect(result).toEqual({
				language: "python",
				version: "3.10.0",
				run: {
					stdout: "Hello, World!\n",
					stderr: "",
					output: "Hello, World!\n",
					code: 0,
					signal: null,
					message: null,
					status: null,
					cpuTime: 10,
					wallTime: 100,
					memory: 1000000,
				},
			});
		});

		it("should handle compile stage in response", async () => {
			const responseWithCompile = {
				language: "c++",
				version: "10.2.0",
				compile: {
					stdout: "",
					stderr: "",
					output: "",
					code: 0,
					signal: null,
					message: null,
					status: null,
					cpu_time: 1000,
					wall_time: 1200,
					memory: 50000000,
				},
				run: {
					stdout: "Hello, C++!\n",
					stderr: "",
					output: "Hello, C++!\n",
					code: 0,
					signal: null,
					message: null,
					status: null,
					cpu_time: 5,
					wall_time: 50,
					memory: 2000000,
				},
			};

			mockFetch.mockResolvedValue(
				new Response(JSON.stringify(responseWithCompile), { status: 200 }),
			);

			const result = await piston.execute({
				language: "c++",
				version: "10.2.0",
				files: [{ content: "int main() { return 0; }" }],
			});

			expect(result.compile).toBeDefined();
			expect(result.compile?.cpuTime).toBe(1000);
			expect(result.compile?.wallTime).toBe(1200);
			expect(result.run.cpuTime).toBe(5);
			expect(result.run.wallTime).toBe(50);
		});

		it("should handle runtime error status", async () => {
			const errorResponse = {
				language: "python",
				version: "3.10.0",
				run: {
					stdout: "",
					stderr: "NameError: name 'undefined' is not defined\n",
					output: "NameError: name 'undefined' is not defined\n",
					code: 1,
					signal: null,
					message: null,
					status: "RE",
					cpu_time: 10,
					wall_time: 100,
					memory: 1000000,
				},
			};

			mockFetch.mockResolvedValue(
				new Response(JSON.stringify(errorResponse), { status: 200 }),
			);

			const result = await piston.execute({
				language: "python",
				version: "3.10.0",
				files: [{ content: "print(undefined)" }],
			});

			expect(result.run.status).toBe("RE");
			expect(result.run.code).toBe(1);
		});

		it("should handle timeout status", async () => {
			const timeoutResponse = {
				language: "python",
				version: "3.10.0",
				run: {
					stdout: "",
					stderr: "",
					output: "",
					code: null,
					signal: "SIGKILL",
					message: "Time limit exceeded",
					status: "TO",
					cpu_time: 3000,
					wall_time: 3001,
					memory: 1000000,
				},
			};

			mockFetch.mockResolvedValue(
				new Response(JSON.stringify(timeoutResponse), { status: 200 }),
			);

			const result = await piston.execute({
				language: "python",
				version: "3.10.0",
				files: [{ content: "while True: pass" }],
			});

			expect(result.run.status).toBe("TO");
			expect(result.run.signal).toBe("SIGKILL");
			expect(result.run.code).toBeNull();
		});

		it("should handle signal termination", async () => {
			const signalResponse = {
				language: "c",
				version: "10.2.0",
				compile: {
					stdout: "",
					stderr: "",
					output: "",
					code: 0,
					signal: null,
					message: null,
					status: null,
					cpu_time: 500,
					wall_time: 600,
					memory: 30000000,
				},
				run: {
					stdout: "",
					stderr: "",
					output: "",
					code: null,
					signal: "SIGSEGV",
					message: "Signaled",
					status: "SG",
					cpu_time: 2,
					wall_time: 10,
					memory: 2000000,
				},
			};

			mockFetch.mockResolvedValue(
				new Response(JSON.stringify(signalResponse), { status: 200 }),
			);

			const result = await piston.execute({
				language: "c",
				version: "10.2.0",
				files: [{ content: "int main() { int *p = 0; *p = 1; }" }],
			});

			expect(result.run.status).toBe("SG");
			expect(result.run.signal).toBe("SIGSEGV");
		});
	});

	describe("error handling", () => {
		const basicRequest: ExecuteRequest = {
			language: "python",
			version: "3.10.0",
			files: [{ content: "print('hello')" }],
		};

		it("should throw PistonValidationError on HTTP 400", async () => {
			mockFetch.mockImplementation(() =>
				Promise.resolve(
					new Response(
						JSON.stringify({ message: "language is required as a string" }),
						{ status: 400 },
					),
				),
			);

			const error = await piston.execute(basicRequest).catch((e) => e);
			expect(error).toBeInstanceOf(PistonValidationError);
			expect(error.message).toBe("language is required as a string");
		});

		it("should throw PistonContentTypeError on HTTP 415", async () => {
			mockFetch.mockResolvedValue(
				new Response(
					JSON.stringify({
						message: "requests must be of type application/json",
					}),
					{ status: 415 },
				),
			);

			await expect(piston.execute(basicRequest)).rejects.toThrow(
				PistonContentTypeError,
			);
		});

		it("should throw PistonServerError on HTTP 500", async () => {
			mockFetch.mockResolvedValue(
				new Response(JSON.stringify({ message: "Internal server error" }), {
					status: 500,
				}),
			);

			await expect(piston.execute(basicRequest)).rejects.toThrow(
				PistonServerError,
			);
		});

		it("should throw PistonError on unexpected HTTP status", async () => {
			mockFetch.mockImplementation(() =>
				Promise.resolve(
					new Response(JSON.stringify({ message: "Service unavailable" }), {
						status: 503,
					}),
				),
			);

			const error = await piston.execute(basicRequest).catch((e) => e);
			expect(error).toBeInstanceOf(PistonError);
			expect(error.message).toBe("Unexpected error: Service unavailable");
		});

		it("should handle error response without JSON body", async () => {
			mockFetch.mockImplementation(() =>
				Promise.resolve(
					new Response("Internal Server Error", {
						status: 500,
						statusText: "Internal Server Error",
					}),
				),
			);

			const error = await piston.execute(basicRequest).catch((e) => e);
			expect(error).toBeInstanceOf(PistonServerError);
			expect(error.message).toBe("HTTP 500: Internal Server Error");
		});

		it("should throw PistonNetworkError on fetch failure", async () => {
			mockFetch.mockRejectedValue(new Error("Network error"));

			const error = await piston.execute(basicRequest).catch((e) => e);
			expect(error).toBeInstanceOf(PistonNetworkError);
			expect(error.message).toBe(
				"Failed to connect to Piston API: Network error",
			);
		});

		it("should include cause in PistonNetworkError", async () => {
			const originalError = new Error("Connection refused");
			mockFetch.mockRejectedValue(originalError);

			try {
				await piston.execute(basicRequest);
			} catch (error) {
				expect(error).toBeInstanceOf(PistonNetworkError);
				expect((error as PistonNetworkError).cause).toBe(originalError);
			}
		});

		it("should handle non-Error thrown by fetch", async () => {
			mockFetch.mockRejectedValue("string error");

			const error = await piston.execute(basicRequest).catch((e) => e);
			expect(error).toBeInstanceOf(PistonNetworkError);
			expect(error.message).toBe(
				"Failed to connect to Piston API: string error",
			);
		});
	});

	describe("runtimes", () => {
		it("should send GET request to /runtimes endpoint", async () => {
			mockFetch.mockResolvedValue(
				new Response(JSON.stringify([]), { status: 200 }),
			);

			await piston.runtimes();

			expect(mockFetch).toHaveBeenCalledWith(
				"https://example.com/api/v2/piston/runtimes",
				expect.objectContaining({
					method: "GET",
					headers: { Accept: "application/json" },
				}),
			);
		});

		it("should return array of runtime info", async () => {
			const mockRuntimes = [
				{
					language: "python",
					version: "3.12.0",
					aliases: ["py", "py3", "python3"],
				},
				{
					language: "rust",
					version: "1.65.0",
					aliases: ["rs"],
				},
			];

			mockFetch.mockResolvedValue(
				new Response(JSON.stringify(mockRuntimes), { status: 200 }),
			);

			const result = await piston.runtimes();

			expect(result).toEqual(mockRuntimes);
			expect(result).toHaveLength(2);
			expect(result[0]?.language).toBe("python");
			expect(result[1]?.aliases).toContain("rs");
		});

		it("should handle empty runtimes array", async () => {
			mockFetch.mockResolvedValue(
				new Response(JSON.stringify([]), { status: 200 }),
			);

			const result = await piston.runtimes();

			expect(result).toEqual([]);
			expect(result).toHaveLength(0);
		});

		it("should handle runtime field for multi-language packages", async () => {
			const mockRuntimes = [
				{
					language: "javascript",
					version: "24.12.0",
					aliases: ["node-javascript", "node-js", "js"],
					runtime: "node",
				},
				{
					language: "c",
					version: "10.2.0",
					aliases: ["gcc"],
					runtime: "gcc",
				},
				{
					language: "c++",
					version: "10.2.0",
					aliases: ["cpp", "g++"],
					runtime: "gcc",
				},
			];

			mockFetch.mockResolvedValue(
				new Response(JSON.stringify(mockRuntimes), { status: 200 }),
			);

			const result = await piston.runtimes();

			expect(result[0]?.runtime).toBe("node");
			expect(result[1]?.runtime).toBe("gcc");
			expect(result[2]?.runtime).toBe("gcc");
		});

		it("should throw PistonNetworkError on fetch failure", async () => {
			mockFetch.mockRejectedValue(new Error("Network error"));

			const error = await piston.runtimes().catch((e) => e);
			expect(error).toBeInstanceOf(PistonNetworkError);
			expect(error.message).toBe(
				"Failed to connect to Piston API: Network error",
			);
		});

		it("should throw PistonServerError on HTTP 500", async () => {
			mockFetch.mockResolvedValue(
				new Response(JSON.stringify({ message: "Internal server error" }), {
					status: 500,
				}),
			);

			await expect(piston.runtimes()).rejects.toThrow(PistonServerError);
		});

		it("should throw PistonError on unexpected HTTP status", async () => {
			mockFetch.mockResolvedValue(
				new Response(JSON.stringify({ message: "Service unavailable" }), {
					status: 503,
				}),
			);

			const error = await piston.runtimes().catch((e) => e);
			expect(error).toBeInstanceOf(PistonError);
			expect(error.message).toBe("Unexpected error: Service unavailable");
		});

		it("should handle error response without JSON body", async () => {
			mockFetch.mockResolvedValue(
				new Response("Internal Server Error", {
					status: 500,
					statusText: "Internal Server Error",
				}),
			);

			const error = await piston.runtimes().catch((e) => e);
			expect(error).toBeInstanceOf(PistonServerError);
			expect(error.message).toBe("HTTP 500: Internal Server Error");
		});
	});
});
