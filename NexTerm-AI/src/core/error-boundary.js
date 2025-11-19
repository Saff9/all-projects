/**
 * Global Error Boundary & Error Handling System
 * Handles all uncaught exceptions, promise rejections and component errors
 */

export class ErrorBoundary {
    constructor() {
        this.handlers = new Set();
        this.errorLog = [];
        this.maxLogEntries = 100;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        window.addEventListener('error', (event) => {
            event.preventDefault();
            this.handleError(event.error || event.message, {
                type: 'uncaught_exception',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            event.preventDefault();
            this.handleError(event.reason, {
                type: 'unhandled_promise_rejection'
            });
        });

        this.initialized = true;
    }

    handleError(error, context = {}) {
        const errorEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            message: error?.message || String(error),
            stack: error?.stack || null,
            context,
            handled: false
        };

        this.errorLog.unshift(errorEntry);
        if (this.errorLog.length > this.maxLogEntries) {
            this.errorLog.pop();
        }

        this.handlers.forEach(handler => {
            try {
                handler(errorEntry);
            } catch (e) {
                console.error('Error handler failed:', e);
            }
        });

        console.error('[ErrorBoundary]', errorEntry);
        return errorEntry;
    }

    wrap(fn, context = {}) {
        return async (...args) => {
            try {
                return await fn.apply(this, args);
            } catch (error) {
                this.handleError(error, context);
                throw error;
            }
        };
    }

    wrapSync(fn, context = {}) {
        return (...args) => {
            try {
                return fn.apply(this, args);
            } catch (error) {
                this.handleError(error, context);
                throw error;
            }
        };
    }

    addHandler(handler) {
        this.handlers.add(handler);
        return () => this.handlers.delete(handler);
    }

    getErrors() {
        return [...this.errorLog];
    }

    clear() {
        this.errorLog = [];
    }
}

export const globalErrorBoundary = new ErrorBoundary();
globalErrorBoundary.init();
