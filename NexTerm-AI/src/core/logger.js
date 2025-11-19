/**
 * Structured Logging System with log levels
 */

export const LogLevel = {
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5,
    OFF: 6
};

export class Logger {
    constructor(options = {}) {
        this.level = options.level ?? LogLevel.INFO;
        this.transports = options.transports || [this.consoleTransport];
        this.context = options.context || {};
        this.maxBufferSize = options.maxBufferSize || 1000;
        this.buffer = [];
    }

    log(level, message, data = {}) {
        if (level < this.level) return;

        const entry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            level,
            levelName: Object.keys(LogLevel).find(k => LogLevel[k] === level),
            message: String(message),
            data: { ...this.context, ...data },
            stack: level >= LogLevel.ERROR ? new Error().stack : null
        };

        this.buffer.push(entry);
        if (this.buffer.length > this.maxBufferSize) {
            this.buffer.shift();
        }

        this.transports.forEach(transport => {
            try {
                transport(entry);
            } catch (e) {
                console.error('Logger transport failed:', e);
            }
        });
    }

    trace(message, data) { this.log(LogLevel.TRACE, message, data); }
    debug(message, data) { this.log(LogLevel.DEBUG, message, data); }
    info(message, data)  { this.log(LogLevel.INFO,  message, data); }
    warn(message, data)  { this.log(LogLevel.WARN,  message, data); }
    error(message, data) { this.log(LogLevel.ERROR, message, data); }
    fatal(message, data) { this.log(LogLevel.FATAL, message, data); }

    consoleTransport(entry) {
        const consoleMethod = {
            [LogLevel.TRACE]: console.debug,
            [LogLevel.DEBUG]: console.debug,
            [LogLevel.INFO]:  console.info,
            [LogLevel.WARN]:  console.warn,
            [LogLevel.ERROR]: console.error,
            [LogLevel.FATAL]: console.error
        }[entry.level] || console.log;

        consoleMethod(`[${entry.levelName}] ${entry.message}`, entry.data);
    }

    addTransport(transport) {
        this.transports.push(transport);
        return () => {
            const idx = this.transports.indexOf(transport);
            if (idx !== -1) this.transports.splice(idx, 1);
        };
    }

    child(context) {
        return new Logger({
            level: this.level,
            transports: this.transports,
            context: { ...this.context, ...context }
        });
    }

    getLogs() { return [...this.buffer]; }
    clear() { this.buffer = []; }
}

export const logger = new Logger();
