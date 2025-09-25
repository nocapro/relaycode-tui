/**
 * Log level for a log entry.
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

/**
 * Represents a single log entry in the system.
 */
export interface LogEntry {
    timestamp: number;
    level: LogLevel;
    message: string;
}