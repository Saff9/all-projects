/**
 * Lazy Loading System for non-critical components
 * Loads resources only when needed with priority scheduling
 */

export class LazyLoader {
    constructor() {
        this.loaded = new Map();
        this.queue = [];
        this.processing = false;
        this.maxConcurrent = 2;
        this.observer = null;

        this.initIntersectionObserver();
    }

    initIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const loadFn = entry.target._lazyLoad;
                        if (loadFn) {
                            loadFn();
                            this.observer.unobserve(entry.target);
                        }
                    }
                });
            }, { rootMargin: '200px' });
        }
    }

    async load(importFn, options = {}) {
        const key = options.key || importFn.toString();
        
        if (this.loaded.has(key)) {
            return this.loaded.get(key);
        }

        if (options.priority === 'low' && this.queue.length > 0) {
            return new Promise(resolve => {
                this.queue.push({ importFn, key, resolve, options });
                this.processQueue();
            });
        }

        return this.executeLoad(importFn, key);
    }

    async executeLoad(importFn, key) {
        try {
            const module = await importFn();
            this.loaded.set(key, module);
            return module;
        } catch (error) {
            console.error('Lazy load failed:', error);
            throw error;
        }
    }

    async processQueue() {
        if (this.processing) return;
        this.processing = true;

        while (this.queue.length > 0) {
            const batch = this.queue.splice(0, this.maxConcurrent);
            await Promise.allSettled(
                batch.map(item => 
                    this.executeLoad(item.importFn, item.key).then(module => {
                        item.resolve(module);
                    })
                )
            );
        }

        this.processing = false;
    }

    onVisible(element, loadFn) {
        if (!this.observer) {
            loadFn();
            return;
        }
        
        element._lazyLoad = loadFn;
        this.observer.observe(element);
    }

    preload(importFn, key) {
        if (!this.loaded.has(key)) {
            this.executeLoad(importFn, key);
        }
    }

    isLoaded(key) {
        return this.loaded.has(key);
    }
}

export const lazyLoader = new LazyLoader();
