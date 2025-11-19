/**
 * Performance Monitor & Memory Leak Prevention
 * Tracks render times, memory usage, component lifecycles
 */

export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
        this.warnings = [];
        this.maxWarnings = 50;
        this.memoryCheckInterval = null;
        this.thresholds = {
            renderTime: 16, // ms (60fps target)
            longTask: 50,
            memoryGrowth: 1.5,
            memoryUsage: 0.8
        };
    }

    start() {
        if (typeof performance === 'undefined') return;
        
        if ('memory' in performance) {
            this.memoryCheckInterval = setInterval(() => this.checkMemoryUsage(), 5000);
        }

        if ('PerformanceObserver' in window) {
            this.initObservers();
        }
    }

    initObservers() {
        const longTaskObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                if (entry.duration > this.thresholds.longTask) {
                    this.addWarning('long_task', `Long task detected: ${entry.duration.toFixed(1)}ms`, {
                        duration: entry.duration,
                        startTime: entry.startTime
                    });
                }
            });
        });

        try {
            longTaskObserver.observe({ entryTypes: ['longtask'] });
            this.observers.set('longtask', longTaskObserver);
        } catch (e) {}

        const paintObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                this.recordMetric(`paint_${entry.name}`, entry.startTime);
            });
        });

        try {
            paintObserver.observe({ entryTypes: ['paint'] });
            this.observers.set('paint', paintObserver);
        } catch (e) {}
    }

    checkMemoryUsage() {
        const memory = performance.memory;
        if (!memory) return;

        const usedPercent = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        this.recordMetric('memory_used', memory.usedJSHeapSize);
        this.recordMetric('memory_total', memory.totalJSHeapSize);

        if (usedPercent > this.thresholds.memoryUsage) {
            this.addWarning('high_memory_usage', `Memory usage at ${(usedPercent * 100).toFixed(1)}%`, {
                used: memory.usedJSHeapSize,
                limit: memory.jsHeapSizeLimit
            });

            if (globalThis.gc) {
                globalThis.gc();
            }
        }
    }

    measureRender(componentName, renderFn) {
        const start = performance.now();
        const result = renderFn();
        const duration = performance.now() - start;

        this.recordMetric(`render_${componentName}`, duration);

        if (duration > this.thresholds.renderTime) {
            this.addWarning('slow_render', `Slow render for ${componentName}: ${duration.toFixed(1)}ms`, {
                component: componentName,
                duration
            });
        }

        return result;
    }

    recordMetric(name, value) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }

        const entries = this.metrics.get(name);
        entries.push({ value, timestamp: Date.now() });

        if (entries.length > 100) {
            entries.shift();
        }
    }

    addWarning(type, message, details = {}) {
        this.warnings.unshift({
            id: crypto.randomUUID(),
            type,
            message,
            details,
            timestamp: new Date().toISOString()
        });

        if (this.warnings.length > this.maxWarnings) {
            this.warnings.pop();
        }
    }

    getMetrics() {
        const stats = {};
        this.metrics.forEach((values, name) => {
            const nums = values.map(v => v.value);
            stats[name] = {
                count: nums.length,
                min: Math.min(...nums),
                max: Math.max(...nums),
                avg: nums.reduce((a, b) => a + b, 0) / nums.length,
                last: nums[nums.length - 1]
            };
        });
        return stats;
    }

    stop() {
        if (this.memoryCheckInterval) {
            clearInterval(this.memoryCheckInterval);
        }
        this.observers.forEach(obs => obs.disconnect());
        this.observers.clear();
    }
}

export const performanceMonitor = new PerformanceMonitor();
