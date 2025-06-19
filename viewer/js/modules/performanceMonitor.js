/**
 * Performance Monitor for Component System
 * Tracks performance metrics and provides optimization suggestions
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            components: new Map(),
            global: {
                totalComponents: 0,
                renderTime: 0,
                memoryUsage: 0,
                eventProcessingTime: 0,
                lastUpdate: Date.now()
            }
        };

        this.thresholds = {
            renderTime: 16, // 60fps target
            memoryUsage: 50 * 1024 * 1024, // 50MB
            componentCount: 100,
            nestingDepth: 10,
            eventProcessingTime: 5,
            componentRenderTime: 2
        };

        this.observers = [];
        this.isMonitoring = false;
        this.eventBus = null;
        this.stateManager = null;
        this.nestingManager = null;

        this.performanceHistory = [];
        this.maxHistorySize = 1000;
        this.alertCallbacks = [];
        this.optimizationSuggestions = [];

        // Performance tracking
        this.renderObserver = null;
        this.memoryObserver = null;
        this.eventObserver = null;

        this.initializeObservers();
    }

    /**
     * Set dependencies
     */
    setEventBus(eventBus) {
        this.eventBus = eventBus;
        this.setupEventListeners();
    }

    setStateManager(stateManager) {
        this.stateManager = stateManager;
    }

    setNestingManager(nestingManager) {
        this.nestingManager = nestingManager;
    }

    /**
     * Initialize performance observers
     */
    initializeObservers() {
        // Performance Observer for render timing
        if (typeof PerformanceObserver !== 'undefined') {
            try {
                this.renderObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.recordRenderMetric(entry);
                    }
                });

                this.renderObserver.observe({ 
                    entryTypes: ['measure', 'navigation', 'paint'] 
                });
            } catch (error) {
                console.warn('PerformanceObserver not supported:', error);
            }
        }

        // Memory usage tracking
        if (typeof performance !== 'undefined' && performance.memory) {
            this.memoryObserver = setInterval(() => {
                this.recordMemoryMetrics();
            }, 1000);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.eventBus) return;

        // Monitor component lifecycle events
        this.eventBus.on('component:created', (event) => {
            this.onComponentCreated(event.data);
        });

        this.eventBus.on('component:destroyed', (event) => {
            this.onComponentDestroyed(event.data);
        });

        this.eventBus.on('component:updated', (event) => {
            this.onComponentUpdated(event.data);
        });

        // Monitor state changes
        this.eventBus.on('component:state:changed', (event) => {
            this.onStateChanged(event.data);
        });

        // Monitor nesting operations
        this.eventBus.on('component:child:added', (event) => {
            this.onNestingChanged(event.data);
        });

        this.eventBus.on('component:moved', (event) => {
            this.onNestingChanged(event.data);
        });
    }

    /**
     * Start monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.metrics.global.lastUpdate = Date.now();

        // Start periodic monitoring
        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
            this.analyzePerformance();
            this.checkThresholds();
        }, 1000);

        this.emitEvent('performance:monitoring:started', {});
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        this.emitEvent('performance:monitoring:stopped', {});
    }

    /**
     * Record component creation
     */
    onComponentCreated(componentData) {
        const startTime = performance.now();
        const componentId = componentData.id;

        const metrics = {
            id: componentId,
            type: componentData.type,
            component: componentData.component,
            created: Date.now(),
            renderCount: 0,
            totalRenderTime: 0,
            averageRenderTime: 0,
            lastRenderTime: 0,
            memoryUsage: 0,
            eventCount: 0,
            errorCount: 0,
            warningCount: 0,
            depth: componentData.metadata?.depth || 0,
            childCount: 0,
            updateCount: 0
        };

        this.metrics.components.set(componentId, metrics);
        this.metrics.global.totalComponents++;

        const creationTime = performance.now() - startTime;
        this.recordGlobalMetric('componentCreationTime', creationTime);

        this.emitEvent('performance:component:created', {
            componentId,
            creationTime,
            metrics
        });
    }

    /**
     * Record component destruction
     */
    onComponentDestroyed(componentData) {
        const componentId = componentData.componentId || componentData.id;
        const metrics = this.metrics.components.get(componentId);

        if (metrics) {
            this.metrics.components.delete(componentId);
            this.metrics.global.totalComponents--;

            this.emitEvent('performance:component:destroyed', {
                componentId,
                finalMetrics: metrics
            });
        }
    }

    /**
     * Record component update
     */
    onComponentUpdated(componentData) {
        const startTime = performance.now();
        const componentId = componentData.componentId || componentData.id;
        const metrics = this.metrics.components.get(componentId);

        if (metrics) {
            metrics.updateCount++;
            metrics.lastUpdate = Date.now();

            const updateTime = performance.now() - startTime;
            this.recordComponentMetric(componentId, 'updateTime', updateTime);
        }
    }

    /**
     * Record state changes
     */
    onStateChanged(stateData) {
        const componentId = stateData.componentId;
        const metrics = this.metrics.components.get(componentId);

        if (metrics) {
            metrics.stateChangeCount = (metrics.stateChangeCount || 0) + 1;
            metrics.lastStateChange = Date.now();

            // Check for excessive state changes
            if (metrics.stateChangeCount > 100) {
                this.addOptimizationSuggestion({
                    type: 'excessive-state-changes',
                    componentId,
                    message: 'Component has excessive state changes, consider batching updates',
                    severity: 'warning',
                    count: metrics.stateChangeCount
                });
            }
        }
    }

    /**
     * Record nesting changes
     */
    onNestingChanged(nestingData) {
        const componentId = nestingData.componentId;
        const metrics = this.metrics.components.get(componentId);

        if (metrics && this.nestingManager) {
            metrics.depth = this.nestingManager.getComponentDepth(componentId);
            metrics.childCount = nestingData.childCount || 0;

            // Check nesting depth
            if (metrics.depth > this.thresholds.nestingDepth) {
                this.addOptimizationSuggestion({
                    type: 'deep-nesting',
                    componentId,
                    message: `Component nesting is too deep (${metrics.depth} levels)`,
                    severity: 'warning',
                    depth: metrics.depth
                });
            }
        }
    }

    /**
     * Record render metrics
     */
    recordRenderMetric(entry) {
        if (entry.name && entry.name.startsWith('component-render-')) {
            const componentId = entry.name.replace('component-render-', '');
            const renderTime = entry.duration;

            this.recordComponentMetric(componentId, 'renderTime', renderTime);

            if (renderTime > this.thresholds.componentRenderTime) {
                this.addOptimizationSuggestion({
                    type: 'slow-render',
                    componentId,
                    message: `Component render time is slow (${renderTime.toFixed(2)}ms)`,
                    severity: 'warning',
                    renderTime
                });
            }
        }
    }

    /**
     * Record memory metrics
     */
    recordMemoryMetrics() {
        if (typeof performance !== 'undefined' && performance.memory) {
            const memory = performance.memory;
            
            this.metrics.global.memoryUsage = memory.usedJSHeapSize;
            this.metrics.global.totalMemory = memory.totalJSHeapSize;
            this.metrics.global.memoryLimit = memory.jsHeapSizeLimit;

            // Check memory usage
            if (memory.usedJSHeapSize > this.thresholds.memoryUsage) {
                this.addOptimizationSuggestion({
                    type: 'high-memory-usage',
                    message: `High memory usage detected (${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB)`,
                    severity: 'warning',
                    memoryUsage: memory.usedJSHeapSize
                });
            }
        }
    }

    /**
     * Record component-specific metric
     */
    recordComponentMetric(componentId, metricType, value) {
        const metrics = this.metrics.components.get(componentId);
        if (!metrics) return;

        switch (metricType) {
            case 'renderTime':
                metrics.renderCount++;
                metrics.totalRenderTime += value;
                metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;
                metrics.lastRenderTime = value;
                break;

            case 'updateTime':
                metrics.totalUpdateTime = (metrics.totalUpdateTime || 0) + value;
                metrics.averageUpdateTime = metrics.totalUpdateTime / metrics.updateCount;
                metrics.lastUpdateTime = value;
                break;

            case 'eventProcessingTime':
                metrics.eventCount++;
                metrics.totalEventTime = (metrics.totalEventTime || 0) + value;
                metrics.averageEventTime = metrics.totalEventTime / metrics.eventCount;
                break;

            default:
                metrics[metricType] = value;
        }

        metrics.lastMetricUpdate = Date.now();
    }

    /**
     * Record global metric
     */
    recordGlobalMetric(metricType, value) {
        this.metrics.global[metricType] = value;
        this.metrics.global.lastUpdate = Date.now();
    }

    /**
     * Collect all metrics
     */
    collectMetrics() {
        const snapshot = {
            timestamp: Date.now(),
            global: { ...this.metrics.global },
            components: {},
            summary: this.generateSummary()
        };

        // Collect component metrics
        for (const [componentId, metrics] of this.metrics.components) {
            snapshot.components[componentId] = { ...metrics };
        }

        // Add to history
        this.performanceHistory.push(snapshot);

        // Limit history size
        if (this.performanceHistory.length > this.maxHistorySize) {
            this.performanceHistory = this.performanceHistory.slice(-this.maxHistorySize);
        }

        return snapshot;
    }

    /**
     * Generate performance summary
     */
    generateSummary() {
        const components = Array.from(this.metrics.components.values());
        
        return {
            totalComponents: components.length,
            averageRenderTime: this.calculateAverage(components, 'averageRenderTime'),
            slowestComponent: this.findSlowestComponent(),
            memoryPerComponent: this.metrics.global.memoryUsage / Math.max(components.length, 1),
            deepestNesting: Math.max(...components.map(c => c.depth), 0),
            totalRenders: components.reduce((sum, c) => sum + c.renderCount, 0),
            totalUpdates: components.reduce((sum, c) => sum + c.updateCount, 0),
            errorCount: components.reduce((sum, c) => sum + c.errorCount, 0),
            warningCount: components.reduce((sum, c) => sum + c.warningCount, 0)
        };
    }

    /**
     * Calculate average of a metric across components
     */
    calculateAverage(components, metricName) {
        const values = components.map(c => c[metricName] || 0).filter(v => v > 0);
        return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
    }

    /**
     * Find slowest rendering component
     */
    findSlowestComponent() {
        let slowest = null;
        let maxTime = 0;

        for (const [componentId, metrics] of this.metrics.components) {
            if (metrics.averageRenderTime > maxTime) {
                maxTime = metrics.averageRenderTime;
                slowest = { componentId, renderTime: maxTime };
            }
        }

        return slowest;
    }

    /**
     * Analyze performance and generate insights
     */
    analyzePerformance() {
        const summary = this.generateSummary();
        const insights = [];

        // Check component count
        if (summary.totalComponents > this.thresholds.componentCount) {
            insights.push({
                type: 'component-count',
                message: `High component count (${summary.totalComponents}), consider virtualization`,
                severity: 'info',
                value: summary.totalComponents
            });
        }

        // Check average render time
        if (summary.averageRenderTime > this.thresholds.componentRenderTime) {
            insights.push({
                type: 'render-performance',
                message: `Average render time is high (${summary.averageRenderTime.toFixed(2)}ms)`,
                severity: 'warning',
                value: summary.averageRenderTime
            });
        }

        // Check memory usage per component
        if (summary.memoryPerComponent > 1024 * 1024) { // 1MB per component
            insights.push({
                type: 'memory-per-component',
                message: `High memory usage per component (${(summary.memoryPerComponent / 1024 / 1024).toFixed(2)}MB)`,
                severity: 'warning',
                value: summary.memoryPerComponent
            });
        }

        // Add insights to suggestions
        insights.forEach(insight => this.addOptimizationSuggestion(insight));

        return insights;
    }

    /**
     * Check performance thresholds
     */
    checkThresholds() {
        const alerts = [];

        // Check global render time
        if (this.metrics.global.renderTime > this.thresholds.renderTime) {
            alerts.push({
                type: 'render-time-threshold',
                message: 'Global render time exceeded threshold',
                value: this.metrics.global.renderTime,
                threshold: this.thresholds.renderTime
            });
        }

        // Check memory usage
        if (this.metrics.global.memoryUsage > this.thresholds.memoryUsage) {
            alerts.push({
                type: 'memory-threshold',
                message: 'Memory usage exceeded threshold',
                value: this.metrics.global.memoryUsage,
                threshold: this.thresholds.memoryUsage
            });
        }

        // Trigger alerts
        alerts.forEach(alert => this.triggerAlert(alert));

        return alerts;
    }

    /**
     * Add optimization suggestion
     */
    addOptimizationSuggestion(suggestion) {
        // Avoid duplicate suggestions
        const existing = this.optimizationSuggestions.find(s => 
            s.type === suggestion.type && 
            s.componentId === suggestion.componentId
        );

        if (!existing) {
            suggestion.timestamp = Date.now();
            suggestion.id = this.generateId();
            this.optimizationSuggestions.push(suggestion);

            this.emitEvent('performance:suggestion:added', suggestion);
        }
    }

    /**
     * Get optimization suggestions
     */
    getOptimizationSuggestions(componentId = null) {
        if (componentId) {
            return this.optimizationSuggestions.filter(s => s.componentId === componentId);
        }
        return this.optimizationSuggestions.slice();
    }

    /**
     * Clear optimization suggestions
     */
    clearOptimizationSuggestions(componentId = null) {
        if (componentId) {
            this.optimizationSuggestions = this.optimizationSuggestions
                .filter(s => s.componentId !== componentId);
        } else {
            this.optimizationSuggestions = [];
        }
    }

    /**
     * Trigger performance alert
     */
    triggerAlert(alert) {
        alert.timestamp = Date.now();
        alert.id = this.generateId();

        this.alertCallbacks.forEach(callback => {
            try {
                callback(alert);
            } catch (error) {
                console.error('Error in alert callback:', error);
            }
        });

        this.emitEvent('performance:alert', alert);
    }

    /**
     * Subscribe to performance alerts
     */
    onAlert(callback) {
        this.alertCallbacks.push(callback);

        // Return unsubscribe function
        return () => {
            const index = this.alertCallbacks.indexOf(callback);
            if (index >= 0) {
                this.alertCallbacks.splice(index, 1);
            }
        };
    }

    /**
     * Get performance metrics
     */
    getMetrics(componentId = null) {
        if (componentId) {
            return this.metrics.components.get(componentId) || null;
        }

        return {
            global: { ...this.metrics.global },
            components: Object.fromEntries(this.metrics.components),
            summary: this.generateSummary()
        };
    }

    /**
     * Get performance history
     */
    getHistory(limit = 100) {
        return this.performanceHistory.slice(-limit);
    }

    /**
     * Export performance data
     */
    exportData() {
        return {
            metrics: this.getMetrics(),
            history: this.getHistory(),
            suggestions: this.getOptimizationSuggestions(),
            thresholds: { ...this.thresholds },
            exported: Date.now()
        };
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Emit event through event bus
     */
    emitEvent(type, data) {
        if (this.eventBus) {
            this.eventBus.emit({
                type,
                source: 'performance-monitor',
                data,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        this.stopMonitoring();

        if (this.renderObserver) {
            this.renderObserver.disconnect();
        }

        if (this.memoryObserver) {
            clearInterval(this.memoryObserver);
        }

        this.metrics.components.clear();
        this.performanceHistory = [];
        this.optimizationSuggestions = [];
        this.alertCallbacks = [];
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PerformanceMonitor = PerformanceMonitor;
}

export default PerformanceMonitor;