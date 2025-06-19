/**
 * Component Event Bus System
 * Handles decoupled communication between components
 */
class ComponentEventBus {
    constructor() {
        this.listeners = new Map();
        this.eventQueue = [];
        this.isProcessing = false;
        this.maxQueueSize = 1000;
        this.eventHistory = [];
        this.maxHistorySize = 500;
        this.middlewares = [];
        this.eventFilters = [];
        this.performanceMetrics = {
            totalEvents: 0,
            processedEvents: 0,
            failedEvents: 0,
            averageProcessingTime: 0,
            lastProcessingTime: 0
        };
    }

    /**
     * Subscribe to events
     */
    on(eventType, callback, options = {}) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        const listener = {
            id: this.generateId(),
            callback,
            once: options.once || false,
            priority: options.priority || 0,
            context: options.context || null,
            filter: options.filter || null,
            created: Date.now()
        };

        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }

        const listeners = this.listeners.get(eventType);
        listeners.push(listener);

        // Sort by priority (higher priority first)
        listeners.sort((a, b) => b.priority - a.priority);

        // Return unsubscribe function
        return () => this.off(eventType, listener.id);
    }

    /**
     * Subscribe to events (one-time)
     */
    once(eventType, callback, options = {}) {
        return this.on(eventType, callback, { ...options, once: true });
    }

    /**
     * Unsubscribe from events
     */
    off(eventType, listenerId) {
        if (!this.listeners.has(eventType)) {
            return false;
        }

        const listeners = this.listeners.get(eventType);
        const index = listeners.findIndex(listener => listener.id === listenerId);

        if (index >= 0) {
            listeners.splice(index, 1);
            
            // Clean up empty listener arrays
            if (listeners.length === 0) {
                this.listeners.delete(eventType);
            }
            
            return true;
        }

        return false;
    }

    /**
     * Remove all listeners for an event type
     */
    removeAllListeners(eventType) {
        if (eventType) {
            return this.listeners.delete(eventType);
        } else {
            this.listeners.clear();
            return true;
        }
    }

    /**
     * Emit an event
     */
    emit(event) {
        if (typeof event === 'string') {
            event = { type: event };
        }

        // Validate event
        if (!event.type) {
            throw new Error('Event must have a type');
        }

        // Enhance event with metadata
        const enhancedEvent = {
            ...event,
            id: event.id || this.generateId(),
            timestamp: event.timestamp || Date.now(),
            source: event.source || 'unknown',
            propagate: event.propagate !== false
        };

        // Apply filters
        if (!this.passesFilters(enhancedEvent)) {
            return false;
        }

        // Add to queue
        this.eventQueue.push(enhancedEvent);

        // Limit queue size
        if (this.eventQueue.length > this.maxQueueSize) {
            this.eventQueue.shift();
            console.warn('Event queue overflow, dropping oldest event');
        }

        // Process queue
        this.processQueue();

        return true;
    }

    /**
     * Emit event synchronously
     */
    emitSync(event) {
        if (typeof event === 'string') {
            event = { type: event };
        }

        const enhancedEvent = {
            ...event,
            id: event.id || this.generateId(),
            timestamp: event.timestamp || Date.now(),
            source: event.source || 'unknown',
            propagate: event.propagate !== false
        };

        return this.processEvent(enhancedEvent);
    }

    /**
     * Process event queue
     */
    async processQueue() {
        if (this.isProcessing || this.eventQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        try {
            while (this.eventQueue.length > 0) {
                const event = this.eventQueue.shift();
                await this.processEvent(event);
            }
        } catch (error) {
            console.error('Error processing event queue:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Process a single event
     */
    async processEvent(event) {
        const startTime = performance.now();
        let success = true;

        try {
            // Apply middlewares
            for (const middleware of this.middlewares) {
                try {
                    const result = await middleware(event);
                    if (result === false) {
                        // Middleware cancelled the event
                        return false;
                    }
                    if (result && typeof result === 'object') {
                        // Middleware modified the event
                        Object.assign(event, result);
                    }
                } catch (error) {
                    console.error('Middleware error:', error);
                }
            }

            // Get listeners
            const listeners = this.listeners.get(event.type) || [];
            const results = [];

            // Process listeners
            for (const listener of listeners) {
                try {
                    // Apply listener filter
                    if (listener.filter && !listener.filter(event)) {
                        continue;
                    }

                    // Call listener
                    const result = await this.callListener(listener, event);
                    results.push(result);

                    // Remove one-time listeners
                    if (listener.once) {
                        this.off(event.type, listener.id);
                    }

                } catch (error) {
                    console.error(`Error in event listener for ${event.type}:`, error);
                    success = false;
                    this.performanceMetrics.failedEvents++;
                }
            }

            // Add to history
            this.addToHistory(event, results, success);

            // Update metrics
            const processingTime = performance.now() - startTime;
            this.updateMetrics(processingTime, success);

            return { success, results };

        } catch (error) {
            console.error('Error processing event:', error);
            success = false;
            this.performanceMetrics.failedEvents++;
            return { success: false, error };
        }
    }

    /**
     * Call a listener with proper context
     */
    async callListener(listener, event) {
        if (listener.context) {
            return await listener.callback.call(listener.context, event);
        } else {
            return await listener.callback(event);
        }
    }

    /**
     * Add middleware
     */
    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function');
        }

        this.middlewares.push(middleware);

        // Return function to remove middleware
        return () => {
            const index = this.middlewares.indexOf(middleware);
            if (index >= 0) {
                this.middlewares.splice(index, 1);
            }
        };
    }

    /**
     * Add event filter
     */
    addFilter(filter) {
        if (typeof filter !== 'function') {
            throw new Error('Filter must be a function');
        }

        this.eventFilters.push(filter);

        // Return function to remove filter
        return () => {
            const index = this.eventFilters.indexOf(filter);
            if (index >= 0) {
                this.eventFilters.splice(index, 1);
            }
        };
    }

    /**
     * Check if event passes all filters
     */
    passesFilters(event) {
        return this.eventFilters.every(filter => {
            try {
                return filter(event);
            } catch (error) {
                console.error('Error in event filter:', error);
                return true; // Allow event through if filter fails
            }
        });
    }

    /**
     * Get event listeners
     */
    getListeners(eventType) {
        if (eventType) {
            return this.listeners.get(eventType) || [];
        } else {
            const allListeners = {};
            for (const [type, listeners] of this.listeners) {
                allListeners[type] = listeners.slice();
            }
            return allListeners;
        }
    }

    /**
     * Check if event has listeners
     */
    hasListeners(eventType) {
        const listeners = this.listeners.get(eventType);
        return listeners && listeners.length > 0;
    }

    /**
     * Get event history
     */
    getHistory(limit = 50) {
        return this.eventHistory.slice(-limit);
    }

    /**
     * Add event to history
     */
    addToHistory(event, results, success) {
        const historyEntry = {
            event: { ...event },
            results,
            success,
            timestamp: Date.now()
        };

        this.eventHistory.push(historyEntry);

        // Limit history size
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
        }
    }

    /**
     * Update performance metrics
     */
    updateMetrics(processingTime, success) {
        this.performanceMetrics.totalEvents++;
        
        if (success) {
            this.performanceMetrics.processedEvents++;
        }

        this.performanceMetrics.lastProcessingTime = processingTime;
        
        // Calculate rolling average
        const currentAvg = this.performanceMetrics.averageProcessingTime;
        const totalProcessed = this.performanceMetrics.processedEvents;
        
        if (totalProcessed === 1) {
            this.performanceMetrics.averageProcessingTime = processingTime;
        } else {
            this.performanceMetrics.averageProcessingTime = 
                (currentAvg * (totalProcessed - 1) + processingTime) / totalProcessed;
        }
    }

    /**
     * Get performance metrics
     */
    getMetrics() {
        return {
            ...this.performanceMetrics,
            queueSize: this.eventQueue.length,
            listenerCount: Array.from(this.listeners.values())
                .reduce((total, listeners) => total + listeners.length, 0),
            eventTypes: this.listeners.size,
            isProcessing: this.isProcessing,
            middlewareCount: this.middlewares.length,
            filterCount: this.eventFilters.length
        };
    }

    /**
     * Clear metrics
     */
    clearMetrics() {
        this.performanceMetrics = {
            totalEvents: 0,
            processedEvents: 0,
            failedEvents: 0,
            averageProcessingTime: 0,
            lastProcessingTime: 0
        };
    }

    /**
     * Clear event history
     */
    clearHistory() {
        this.eventHistory = [];
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Create event namespace
     */
    namespace(prefix) {
        return {
            on: (eventType, callback, options) => 
                this.on(`${prefix}:${eventType}`, callback, options),
            
            once: (eventType, callback, options) => 
                this.once(`${prefix}:${eventType}`, callback, options),
            
            off: (eventType, listenerId) => 
                this.off(`${prefix}:${eventType}`, listenerId),
            
            emit: (eventType, data) => 
                this.emit({
                    type: `${prefix}:${eventType}`,
                    source: prefix,
                    ...data
                }),
            
            emitSync: (eventType, data) => 
                this.emitSync({
                    type: `${prefix}:${eventType}`,
                    source: prefix,
                    ...data
                })
        };
    }

    /**
     * Wait for event
     */
    waitFor(eventType, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                unsubscribe();
                reject(new Error(`Timeout waiting for event: ${eventType}`));
            }, timeout);

            const unsubscribe = this.once(eventType, (event) => {
                clearTimeout(timer);
                resolve(event);
            });
        });
    }

    /**
     * Batch emit multiple events
     */
    emitBatch(events) {
        const results = [];
        
        for (const event of events) {
            try {
                const result = this.emit(event);
                results.push({ success: true, result });
            } catch (error) {
                results.push({ success: false, error });
            }
        }

        return results;
    }

    /**
     * Debug information
     */
    debug() {
        console.group('Event Bus Debug Info');
        console.log('Listeners:', this.listeners);
        console.log('Queue:', this.eventQueue);
        console.log('Metrics:', this.getMetrics());
        console.log('History:', this.getHistory(10));
        console.groupEnd();
    }

    /**
     * Export event bus state
     */
    export() {
        return {
            listeners: Array.from(this.listeners.entries()),
            eventHistory: this.eventHistory.slice(-100), // Last 100 events
            metrics: this.getMetrics(),
            exported: Date.now()
        };
    }

    /**
     * Destroy event bus
     */
    destroy() {
        this.listeners.clear();
        this.eventQueue = [];
        this.eventHistory = [];
        this.middlewares = [];
        this.eventFilters = [];
        this.isProcessing = false;
        this.clearMetrics();
    }
}

// Predefined event types for better type safety
ComponentEventBus.EventTypes = {
    // Component lifecycle
    COMPONENT_CREATED: 'component:created',
    COMPONENT_DESTROYED: 'component:destroyed',
    COMPONENT_UPDATED: 'component:updated',
    COMPONENT_SELECTED: 'component:selected',
    COMPONENT_DESELECTED: 'component:deselected',

    // State management
    STATE_CHANGED: 'component:state:changed',
    STATE_INITIALIZED: 'component:state:initialized',
    STATE_REMOVED: 'component:state:removed',

    // Nesting operations
    CHILD_ADDED: 'component:child:added',
    CHILD_REMOVED: 'component:child:removed',
    COMPONENT_MOVED: 'component:moved',

    // Drag and drop
    DRAG_START: 'drag:start',
    DRAG_OVER: 'drag:over',
    DRAG_END: 'drag:end',
    DROP: 'drop',

    // UI interactions
    UI_CLICK: 'ui:click',
    UI_HOVER: 'ui:hover',
    UI_FOCUS: 'ui:focus',
    UI_BLUR: 'ui:blur',

    // Performance
    PERFORMANCE_WARNING: 'performance:warning',
    PERFORMANCE_ERROR: 'performance:error',

    // Errors
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ComponentEventBus = ComponentEventBus;
}

export default ComponentEventBus;