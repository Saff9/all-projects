/**
 * Browser Feature Detection & Graceful Degradation
 */

export class BrowserSupport {
    constructor() {
        this.features = this.detectFeatures();
        this.supportLevel = this.calculateSupportLevel();
    }

    detectFeatures() {
        return {
            esModules: 'noModule' in document.createElement('script'),
            dynamicImport: (function() {
                try {
                    return typeof import.meta !== 'undefined';
                } catch (e) {
                    return false;
                }
            })(),
            webWorkers: 'Worker' in window,
            sharedWorkers: 'SharedWorker' in window,
            intersectionObserver: 'IntersectionObserver' in window,
            resizeObserver: 'ResizeObserver' in window,
            performanceObserver: 'PerformanceObserver' in window,
            indexedDB: 'indexedDB' in window,
            serviceWorker: 'serviceWorker' in navigator,
            crypto: 'crypto' in window && 'randomUUID' in crypto,
            wasm: 'WebAssembly' in window,
            bigInt: 'BigInt' in window,
            pointerEvents: 'PointerEvent' in window,
            cssGrid: CSS.supports('display', 'grid'),
            cssFlex: CSS.supports('display', 'flex'),
            customElements: 'customElements' in window,
            shadowDom: 'attachShadow' in Element.prototype
        };
    }

    calculateSupportLevel() {
        const required = ['esModules', 'crypto', 'cssFlex', 'indexedDB'];
        const recommended = ['dynamicImport', 'intersectionObserver', 'resizeObserver'];

        const requiredMissing = required.filter(f => !this.features[f]);
        const recommendedMissing = recommended.filter(f => !this.features[f]);

        if (requiredMissing.length > 0) {
            return 'unsupported';
        }

        if (recommendedMissing.length > 1) {
            return 'partial';
        }

        return 'full';
    }

    isSupported() {
        return this.supportLevel !== 'unsupported';
    }

    getFallbackStrategy(feature) {
        const fallbacks = {
            intersectionObserver: () => 'Use scroll event listeners',
            resizeObserver: () => 'Use window.resize events',
            performanceObserver: () => 'Disable performance monitoring',
            dynamicImport: () => 'Use pre-bundled modules',
            webWorkers: () => 'Run tasks on main thread'
        };

        return fallbacks[feature] ? fallbacks[feature]() : null;
    }

    applyFallbacks() {
        if (!this.features.intersectionObserver) {
            window.IntersectionObserver = class {
                observe() {}
                unobserve() {}
                disconnect() {}
            };
        }

        if (!this.features.resizeObserver) {
            window.ResizeObserver = class {
                observe() {}
                unobserve() {}
                disconnect() {}
            };
        }

        if (!this.features.crypto.randomUUID) {
            crypto.randomUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }
    }

    getWarnings() {
        const warnings = [];

        if (this.supportLevel === 'partial') {
            warnings.push('Some performance and UI features will be disabled for compatibility');
        }

        if (!this.features.dynamicImport) {
            warnings.push('Dynamic plugin loading will not work');
        }

        return warnings;
    }
}

export const browserSupport = new BrowserSupport();
