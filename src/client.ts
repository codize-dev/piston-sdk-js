import type {
  ExecuteRequest,
  ExecuteResponse,
  ErrorResponse,
  StageResult,
} from "./types/index.js";
import {
  PistonError,
  PistonValidationError,
  PistonContentTypeError,
  PistonServerError,
  PistonNetworkError,
} from "./errors.js";

/**
 * Raw API request body (snake_case).
 */
interface RawExecuteRequest {
  language: string;
  version: string;
  files: Array<{
    content: string;
    name?: string;
    encoding?: string;
  }>;
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  compile_cpu_time?: number;
  compile_memory_limit?: number;
  run_timeout?: number;
  run_cpu_time?: number;
  run_memory_limit?: number;
}

/**
 * Raw API stage result (snake_case).
 */
interface RawStageResult {
  stdout: string;
  stderr: string;
  output: string;
  code: number | null;
  signal: string | null;
  message: string | null;
  status: string | null;
  cpu_time: number | null;
  wall_time: number | null;
  memory: number | null;
}

/**
 * Raw API response (snake_case).
 */
interface RawExecuteResponse {
  language: string;
  version: string;
  compile?: RawStageResult;
  run: RawStageResult;
}

/**
 * Piston client options.
 */
export interface PistonOptions {
  /**
   * Custom fetch function (useful for testing).
   * @default globalThis.fetch
   */
  fetch?: typeof fetch;
}

/**
 * Piston API client.
 *
 * @example
 * ```typescript
 * const piston = new Piston("https://emkc.org/api/v2/piston");
 *
 * const result = await piston.execute({
 *   language: "python",
 *   version: "3.10.0",
 *   files: [{ content: "print('Hello, World!')" }],
 * });
 *
 * console.log(result.run.stdout); // "Hello, World!\n"
 * ```
 */
export class Piston {
  private readonly baseUrl: string;
  private readonly fetch: typeof fetch;

  /**
   * Create a Piston client.
   *
   * @param baseUrl - Piston API base URL (e.g., "https://emkc.org/api/v2/piston")
   * @param options - Client options
   */
  constructor(baseUrl: string, options: PistonOptions = {}) {
    // Remove trailing slashes
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.fetch = options.fetch ?? globalThis.fetch;
  }

  /**
   * Execute code.
   *
   * @param request - Execute request parameters
   * @returns Execution result
   * @throws {PistonValidationError} Validation error (HTTP 400)
   * @throws {PistonContentTypeError} Content-Type error (HTTP 415)
   * @throws {PistonServerError} Server error (HTTP 500)
   * @throws {PistonNetworkError} Network error
   *
   * @example
   * ```typescript
   * // Basic execution
   * const result = await piston.execute({
   *   language: "python",
   *   version: "3.10.0",
   *   files: [{ name: "main.py", content: "print('Hello!')" }],
   * });
   *
   * // With stdin and args
   * const result = await piston.execute({
   *   language: "python",
   *   version: "3.x",
   *   files: [{ content: "import sys\nprint(input())" }],
   *   stdin: "Alice",
   *   args: ["arg1", "arg2"],
   * });
   *
   * // With resource constraints
   * const result = await piston.execute({
   *   language: "python",
   *   version: "3.x",
   *   files: [{ content: "print('Hello!')" }],
   *   runTimeout: 5000,
   *   runMemoryLimit: 67108864, // 64MB
   * });
   * ```
   */
  async execute(request: ExecuteRequest): Promise<ExecuteResponse> {
    const url = `${this.baseUrl}/execute`;
    const rawRequest = this.toRawRequest(request);

    let response: Response;
    try {
      response = await this.fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rawRequest),
      });
    } catch (error) {
      throw new PistonNetworkError(
        `Failed to connect to Piston API: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      );
    }

    return this.handleResponse(response);
  }

  /**
   * Convert SDK request (camelCase) to API request (snake_case).
   */
  private toRawRequest(request: ExecuteRequest): RawExecuteRequest {
    const raw: RawExecuteRequest = {
      language: request.language,
      version: request.version,
      files: request.files,
    };

    if (request.stdin !== undefined) raw.stdin = request.stdin;
    if (request.args !== undefined) raw.args = request.args;
    if (request.compileTimeout !== undefined)
      raw.compile_timeout = request.compileTimeout;
    if (request.compileCpuTime !== undefined)
      raw.compile_cpu_time = request.compileCpuTime;
    if (request.compileMemoryLimit !== undefined)
      raw.compile_memory_limit = request.compileMemoryLimit;
    if (request.runTimeout !== undefined) raw.run_timeout = request.runTimeout;
    if (request.runCpuTime !== undefined) raw.run_cpu_time = request.runCpuTime;
    if (request.runMemoryLimit !== undefined)
      raw.run_memory_limit = request.runMemoryLimit;

    return raw;
  }

  /**
   * Convert API stage result (snake_case) to SDK stage result (camelCase).
   */
  private toStageResult(raw: RawStageResult): StageResult {
    return {
      stdout: raw.stdout,
      stderr: raw.stderr,
      output: raw.output,
      code: raw.code,
      signal: raw.signal,
      message: raw.message,
      status: raw.status as StageResult["status"],
      cpuTime: raw.cpu_time,
      wallTime: raw.wall_time,
      memory: raw.memory,
    };
  }

  /**
   * Convert API response (snake_case) to SDK response (camelCase).
   */
  private toExecuteResponse(raw: RawExecuteResponse): ExecuteResponse {
    const result: ExecuteResponse = {
      language: raw.language,
      version: raw.version,
      run: this.toStageResult(raw.run),
    };

    if (raw.compile) {
      result.compile = this.toStageResult(raw.compile);
    }

    return result;
  }

  /**
   * Handle API response.
   */
  private async handleResponse(response: Response): Promise<ExecuteResponse> {
    if (response.ok) {
      const raw = (await response.json()) as RawExecuteResponse;
      return this.toExecuteResponse(raw);
    }

    // Handle error responses
    let errorMessage: string;
    try {
      const errorBody = (await response.json()) as ErrorResponse;
      errorMessage = errorBody.message;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }

    switch (response.status) {
      case 400:
        throw new PistonValidationError(errorMessage);
      case 415:
        throw new PistonContentTypeError(errorMessage);
      case 500:
        throw new PistonServerError(errorMessage);
      default:
        throw new PistonError(`Unexpected error: ${errorMessage}`);
    }
  }
}
