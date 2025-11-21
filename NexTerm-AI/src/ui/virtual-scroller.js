/**
 * Virtual Scroller for terminal output
 * Efficiently renders large conversation histories
 */

export class VirtualScroller {
    constructor(container, options = {}) {
        this.container = container;
        this.itemHeight = options.itemHeight || 24;
        this.bufferSize = options.bufferSize || 10;
        this.items = [];
        this.renderItem = options.renderItem || (item => document.createElement('div'));
        
        this.scrollTop = 0;
        this.visibleHeight = 0;
        this.totalHeight = 0;

        this.init();
    }

    init() {
        this.container.style.position = 'relative';
        this.container.style.overflowY = 'auto';
        this.container.style.willChange = 'scroll-position';

        this.spacerTop = document.createElement('div');
        this.spacerBottom = document.createElement('div');
        this.viewport = document.createElement('div');
        
        this.container.appendChild(this.spacerTop);
        this.container.appendChild(this.viewport);
        this.container.appendChild(this.spacerBottom);

        this.container.addEventListener('scroll', () => {
            this.scrollTop = this.container.scrollTop;
            this.scheduleUpdate();
        });

        const resizeObserver = new ResizeObserver(() => {
            this.visibleHeight = this.container.clientHeight;
            this.updateTotalHeight();
            this.update();
        });

        resizeObserver.observe(this.container);
    }

    setItems(items) {
        this.items = items;
        this.updateTotalHeight();
        this.update();
    }

    updateTotalHeight() {
        this.totalHeight = this.items.length * this.itemHeight;
        this.container.style.height = `${this.visibleHeight}px`;
    }

    scheduleUpdate() {
        if (!this.pendingUpdate) {
            this.pendingUpdate = requestAnimationFrame(() => {
                this.update();
                this.pendingUpdate = null;
            });
        }
    }

    update() {
        const startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.bufferSize);
        const endIndex = Math.min(
            this.items.length,
            Math.ceil((this.scrollTop + this.visibleHeight) / this.itemHeight) + this.bufferSize
        );

        this.spacerTop.style.height = `${startIndex * this.itemHeight}px`;
        this.spacerBottom.style.height = `${Math.max(0, this.items.length - endIndex) * this.itemHeight}px`;

        const fragment = document.createDocumentFragment();
        
        for (let i = startIndex; i < endIndex; i++) {
            const item = this.items[i];
            const el = this.renderItem(item, i);
            el.style.transform = `translateY(${i * this.itemHeight}px)`;
            el.style.position = 'absolute';
            el.style.height = `${this.itemHeight}px`;
            fragment.appendChild(el);
        }

        this.viewport.innerHTML = '';
        this.viewport.appendChild(fragment);
    }

    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }

    destroy() {
        cancelAnimationFrame(this.pendingUpdate);
        this.container.innerHTML = '';
    }
}
