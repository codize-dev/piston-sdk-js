/**
 * File content encoding type.
 *
 * - `utf8`: UTF-8 text (default) - for source code and text files
 * - `base64`: Base64 encoded - for binary files and images
 * - `hex`: Hexadecimal encoded - for binary data
 */
export type FileEncoding = "utf8" | "base64" | "hex";

/**
 * Execution status code.
 *
 * - `RE`: Runtime Error - process exited with non-zero exit code
 * - `SG`: Signal - process was killed by a signal (e.g., SIGSEGV)
 * - `TO`: Timeout - wall-time or CPU-time limit exceeded
 * - `OL`: Output Length - stdout exceeded output_max_size
 * - `EL`: Error Length - stderr exceeded output_max_size
 * - `XX`: Internal Error - Isolate sandbox internal error
 *
 * Note: `null` indicates success (process completed normally with code=0, signal=null).
 * Use `ExecutionStatus | null` when including the success case.
 */
export type ExecutionStatus = "RE" | "SG" | "TO" | "OL" | "EL" | "XX";

/**
 * Signal name that can terminate a process.
 *
 * Common signals:
 * - `SIGHUP` (1): Hangup detected
 * - `SIGINT` (2): Interrupt (Ctrl+C)
 * - `SIGQUIT` (3): Quit
 * - `SIGILL` (4): Illegal instruction
 * - `SIGTRAP` (5): Trace/breakpoint
 * - `SIGABRT` (6): Abort (set by Piston on buffer limit exceeded)
 * - `SIGFPE` (8): Floating-point exception
 * - `SIGKILL` (9): Force kill (cannot be caught)
 * - `SIGSEGV` (11): Segmentation fault
 * - `SIGALRM` (14): Alarm
 * - `SIGTERM` (15): Termination signal
 * - `SIGXCPU` (24): CPU time limit exceeded (set by Isolate)
 * - `SIGXFSZ` (25): File size limit exceeded (set by Isolate)
 */
export type SignalName =
  | "SIGHUP"
  | "SIGINT"
  | "SIGQUIT"
  | "SIGILL"
  | "SIGTRAP"
  | "SIGABRT"
  | "SIGFPE"
  | "SIGKILL"
  | "SIGSEGV"
  | "SIGALRM"
  | "SIGTERM"
  | "SIGXCPU"
  | "SIGXFSZ"
  | (string & {});
