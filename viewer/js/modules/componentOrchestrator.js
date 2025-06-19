/**
 * Component System Orchestrator
 * Integrates all advanced component systems together
 */
class ComponentOrchestrator {
    constructor() {
        // Core systems
        this.eventBus = null;
        this.stateManager = null;
        this.nestingManager = null;
        this.performanceMonitor = null;
        this.errorBoundary = null;
        this.advancedComponents = null;

        // System state
        this.isInitialized = false;
        this.systems = new Map();
        this.initializationOrder = [
            'eventBus',
            'stateManager', 
            'nestingManager',
            'performanceMonitor',
            'errorBoundary',
            'advancedComponents'
        ];

        // Component registry
        this.componentRegistry = new Map();
        this.componentInstances = new Map();

        // Configuration
        this.config = {
            enablePerformanceMonitoring: true,
            enableErrorBoundaries: true,
            enableAdvancedComponents: true,
            autoOptimization: true,
            debugMode: false,
            maxComponents: 1000,
            historySize: 500
        };

        // Metrics
        this.metrics = {
            totalComponents: 0,
            systemsInitialized: 0,
            errorsHandled: 0,
            performanceAlerts: 0,
            lastUpdate: Date.now()
        };
    }

    /**
     * Initialize the component system
     */
    async initialize(config = {}) {
        if (this.isInitialized) {
            console.warn('Component orchestrator already initialized');
            return;
        }

        // Merge configuration
        this.config = { ...this.config, ...config };

        try {
            // Initialize core systems in order
            await this.initializeSystems();

            // Setup system interconnections
            this.setupSystemConnections();

            // Setup global event listeners
            this.setupGlobalListeners();

            // Mark as initialized
            this.isInitialized = true;
            this.metrics.lastUpdate = Date.now();

            // Emit initialization complete event
            this.eventBus.emit({
                type: 'orchestrator:initialized',
                source: 'component-orchestrator',
                data: {
                    systems: Array.from(this.systems.keys()),
                    config: this.config,
                    metrics: this.metrics
                }
            });

            console.log('Component orchestrator initialized successfully');

        } catch (error) {
            console.error('Failed to initialize component orchestrator:', error);
            throw error;
        }
    }

    /**
     * Initialize all systems
     */
    async initializeSystems() {
        // Import and initialize systems dynamically
        const systemModules = {
            eventBus: () => import('./eventBus.js'),
            stateManager: () => import('./stateManager.js'),
            nestingManager: () => import('./componentNesting.js'),
            performanceMonitor: () => import('./performanceMonitor.js'),
            errorBoundary: () => import('./errorBoundary.js'),
            advancedComponents: () => import('./advancedComponents.js')
        };

        for (const systemName of this.initializationOrder) {
            try {
                console.log(`Initializing ${systemName}...`);

                // Import module
                const module = await systemModules[systemName]();
                const SystemClass = module.default;

                // Create instance
                const instance = new SystemClass();
                this.systems.set(systemName, instance);

                // Store reference for easy access
                this[systemName] = instance;

                this.metrics.systemsInitialized++;
                console.log(`${systemName} initialized`);

            } catch (error) {
                console.error(`Failed to initialize ${systemName}:`, error);
                throw new Error(`System initialization failed: ${systemName}`);
            }
        }
    }

    /**
     * Setup connections between systems
     */
    setupSystemConnections() {
        // Connect event bus to all systems
        this.stateManager.setEventBus(this.eventBus);
        this.nestingManager.setEventBus(this.eventBus);
        this.performanceMonitor.setEventBus(this.eventBus);
        this.errorBoundary.setEventBus(this.eventBus);
        this.advancedComponents.setEventBus(this.eventBus);

        // Connect state manager to dependent systems
        this.nestingManager.setStateManager(this.stateManager);
        this.performanceMonitor.setStateManager(this.stateManager);
        this.errorBoundary.setStateManager(this.stateManager);
        this.advancedComponents.setStateManager(this.stateManager);

        // Connect nesting manager to dependent systems
        this.stateManager.setNestingManager(this.nestingManager);
        this.performanceMonitor.setNestingManager(this.nestingManager);
        this.advancedComponents.setNestingManager(this.nestingManager);

        // Connect performance monitor to dependent systems
        this.errorBoundary.setPerformanceMonitor(this.performanceMonitor);
        this.advancedComponents.setPerformanceMonitor(this.performanceMonitor);

        // Connect error boundary to dependent systems
        this.advancedComponents.setErrorBoundary(this.errorBoundary);

        // Make error boundary available globally
        if (typeof window !== 'undefined') {
            window.errorBoundary = this.errorBoundary;
        }

        console.log('System connections established');
    }

    /**
     * Setup global event listeners
     */
    setupGlobalListeners() {
        // Performance monitoring
        if (this.config.enablePerformanceMonitoring) {
            this.performanceMonitor.startMonitoring();

            this.eventBus.on('performance:alert', (event) => {
                this.handlePerformanceAlert(event.data);
            });
        }

        // Error handling
        if (this.config.enableErrorBoundaries) {
            this.eventBus.on('error-boundary:error', (event) => {
                this.handleComponentError(event.data);
            });
        }

        // Component lifecycle
        this.eventBus.on('component:created', (event) => {
            this.handleComponentCreated(event.data);
        });

        this.eventBus.on('component:destroyed', (event) => {
            this.handleComponentDestroyed(event.data);
        });

        // System health monitoring
        setInterval(() => {
            this.checkSystemHealth();
        }, 30000); // Check every 30 seconds

        console.log('Global event listeners setup');
    }

    /**
     * Create a new component
     */
    async createComponent(componentData) {
        try {
            // Validate component data
            this.validateComponentData(componentData);

            // Check system limits
            if (this.metrics.totalComponents >= this.config.maxComponents) {
                throw new Error('Maximum component limit reached');
            }

            // Generate ID if not provided
            if (!componentData.id) {
                componentData.id = this.generateComponentId();
            }

            // Initialize component state
            const initialState = this.stateManager.initializeState(componentData);

            // Create error boundary
            this.errorBoundary.createErrorBoundary(componentData);

            // Register with nesting manager
            if (componentData.parentId) {
                await this.nestingManager.addChild(componentData.parentId, componentData.id, {
                    type: componentData.type,
                    component: componentData.component,
                    category: componentData.category
                });
            }

            // Create advanced component if applicable
            let advancedComponent = null;
            if (this.config.enableAdvancedComponents && this.isAdvancedComponentType(componentData.type)) {
                advancedComponent = this.advancedComponents.createComponent(componentData.type, componentData);
            }

            // Store component instance
            const componentInstance = {
                id: componentData.id,
                data: componentData,
                state: initialState,
                advancedComponent,
                created: Date.now(),
                lastUpdate: Date.now()
            };

            this.componentInstances.set(componentData.id, componentInstance);
            this.componentRegistry.set(componentData.id, componentData);

            // Update metrics
            this.metrics.totalComponents++;
            this.metrics.lastUpdate = Date.now();

            // Emit creation event
            this.eventBus.emit({
                type: 'component:created',
                source: 'component-orchestrator',
                data: componentInstance
            });

            return componentInstance;

        } catch (error) {
            console.error('Failed to create component:', error);
            
            // Handle error through error boundary
            if (componentData.id && this.errorBoundary) {
                this.errorBoundary.handleError(componentData.id, {
                    type: 'component-creation-error',
                    message: 'Failed to create component',
                    error,
                    source: 'component-orchestrator'
                });
            }

            throw error;
        }
    }

    /**
     * Update component
     */
    async updateComponent(componentId, updates) {
        try {
            const componentInstance = this.componentInstances.get(componentId);
            if (!componentInstance) {
                throw new Error(`Component not found: ${componentId}`);
            }

            // Update component data
            Object.assign(componentInstance.data, updates);
            componentInstance.lastUpdate = Date.now();

            // Update state if provided
            if (updates.state) {
                this.stateManager.setState(componentId, updates.state);
            }

            // Update advanced component if applicable
            if (componentInstance.advancedComponent) {
                const componentType = this.advancedComponents.getComponentType(componentInstance.data.type);
                if (componentType && componentType.updater) {
                    componentType.updater(componentInstance.advancedComponent, updates);
                }
            }

            // Emit update event
            this.eventBus.emit({
                type: 'component:updated',
                source: 'component-orchestrator',
                data: { componentId, updates, componentInstance }
            });

            return componentInstance;

        } catch (error) {
            console.error('Failed to update component:', error);
            
            this.errorBoundary.handleError(componentId, {
                type: 'component-update-error',
                message: 'Failed to update component',
                error,
                source: 'component-orchestrator'
            });

            throw error;
        }
    }

    /**
     * Destroy component
     */
    async destroyComponent(componentId) {
        try {
            const componentInstance = this.componentInstances.get(componentId);
            if (!componentInstance) {
                console.warn(`Component not found for destruction: ${componentId}`);
                return;
            }

            // Remove from nesting hierarchy
            const state = this.stateManager.getState(componentId);
            if (state && state.parent) {
                await this.nestingManager.removeChild(state.parent, componentId);
            }

            // Destroy advanced component
            if (componentInstance.advancedComponent) {
                const componentType = this.advancedComponents.getComponentType(componentInstance.data.type);
                if (componentType && componentType.destroyer) {
                    componentType.destroyer(componentInstance.advancedComponent);
                }
            }

            // Remove error boundary
            this.errorBoundary.removeErrorBoundary(componentId);

            // Remove state
            this.stateManager.removeState(componentId);

            // Remove from registries
            this.componentInstances.delete(componentId);
            this.componentRegistry.delete(componentId);

            // Update metrics
            this.metrics.totalComponents--;
            this.metrics.lastUpdate = Date.now();

            // Emit destruction event
            this.eventBus.emit({
                type: 'component:destroyed',
                source: 'component-orchestrator',
                data: { componentId, componentInstance }
            });

        } catch (error) {
            console.error('Failed to destroy component:', error);
            
            this.errorBoundary.handleError(componentId, {
                type: 'component-destruction-error',
                message: 'Failed to destroy component',
                error,
                source: 'component-orchestrator'
            });
        }
    }

    /**
     * Get component instance
     */
    getComponent(componentId) {
        return this.componentInstances.get(componentId);
    }

    /**
     * Get all components
     */
    getAllComponents() {
        return Array.from(this.componentInstances.values());
    }

    /**
     * Get components by type
     */
    getComponentsByType(type) {
        return Array.from(this.componentInstances.values())
            .filter(instance => instance.data.type === type);
    }

    /**
     * Get component tree
     */
    getComponentTree() {
        return this.stateManager.getFullTree();
    }

    /**
     * Validate component data
     */
    validateComponentData(componentData) {
        const errors = [];

        if (!componentData.type) {
            errors.push('Component type is required');
        }

        if (!componentData.component) {
            errors.push('Component name is required');
        }

        if (componentData.id && this.componentInstances.has(componentData.id)) {
            errors.push('Component ID already exists');
        }

        if (errors.length > 0) {
            throw new Error(`Component validation failed: ${errors.join(', ')}`);
        }
    }

    /**
     * Check if component type is advanced
     */
    isAdvancedComponentType(type) {
        const advancedTypes = [
            'smart-container',
            'conditional',
            'dynamic-list',
            'repeater',
            'state-container',
            'event-bridge'
        ];
        return advancedTypes.includes(type);
    }

    /**
     * Generate unique component ID
     */
    generateComponentId() {
        return `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Handle performance alerts
     */
    handlePerformanceAlert(alertData) {
        this.metrics.performanceAlerts++;

        if (this.config.autoOptimization) {
            this.attemptPerformanceOptimization(alertData);
        }

        if (this.config.debugMode) {
            console.warn('Performance alert:', alertData);
        }
    }

    /**
     * Handle component errors
     */
    handleComponentError(errorData) {
        this.metrics.errorsHandled++;

        if (this.config.debugMode) {
            console.error('Component error:', errorData);
        }

        // Attempt recovery if possible
        if (errorData.componentId && this.componentInstances.has(errorData.componentId)) {
            this.attemptComponentRecovery(errorData);
        }
    }

    /**
     * Handle component creation
     */
    handleComponentCreated(componentData) {
        if (this.config.debugMode) {
            console.log('Component created:', componentData.id);
        }
    }

    /**
     * Handle component destruction
     */
    handleComponentDestroyed(componentData) {
        if (this.config.debugMode) {
            console.log('Component destroyed:', componentData.componentId);
        }
    }

    /**
     * Attempt performance optimization
     */
    attemptPerformanceOptimization(alertData) {
        // Implement optimization strategies based on alert type
        switch (alertData.type) {
            case 'high-memory-usage':
                this.optimizeMemoryUsage();
                break;
            case 'slow-render':
                this.optimizeRenderPerformance(alertData.componentId);
                break;
            case 'deep-nesting':
                this.optimizeComponentNesting(alertData.componentId);
                break;
            default:
                console.log('No optimization strategy for:', alertData.type);
        }
    }

    /**
     * Attempt component recovery
     */
    attemptComponentRecovery(errorData) {
        const componentId = errorData.componentId;
        const componentInstance = this.componentInstances.get(componentId);

        if (componentInstance) {
            // Try to reset component state
            try {
                this.stateManager.setState(componentId, {
                    hasError: false,
                    errorMessage: null,
                    isVisible: true
                });

                console.log(`Component recovery attempted for: ${componentId}`);
            } catch (recoveryError) {
                console.error('Component recovery failed:', recoveryError);
            }
        }
    }

    /**
     * Optimize memory usage
     */
    optimizeMemoryUsage() {
        // Clear old performance history
        this.performanceMonitor.getHistory().splice(0, 100);
        
        // Clear old error history
        this.errorBoundary.clearErrorHistory();

        console.log('Memory optimization performed');
    }

    /**
     * Optimize render performance
     */
    optimizeRenderPerformance(componentId) {
        const componentInstance = this.componentInstances.get(componentId);
        if (componentInstance && componentInstance.advancedComponent) {
            // Apply performance optimizations to advanced components
            if (componentInstance.data.type === 'dynamic-list') {
                // Enable virtualization
                componentInstance.advancedComponent.props.virtualized = true;
            }
        }
    }

    /**
     * Optimize component nesting
     */
    optimizeComponentNesting(componentId) {
        // Suggest flattening deeply nested structures
        const depth = this.nestingManager.getComponentDepth(componentId);
        if (depth > 8) {
            console.warn(`Consider flattening component hierarchy for: ${componentId} (depth: ${depth})`);
        }
    }

    /**
     * Check system health
     */
    checkSystemHealth() {
        const health = {
            timestamp: Date.now(),
            systems: {},
            overall: 'healthy'
        };

        // Check each system
        for (const [systemName, system] of this.systems) {
            try {
                health.systems[systemName] = this.checkSystemHealthStatus(systemName, system);
            } catch (error) {
                health.systems[systemName] = { status: 'error', error: error.message };
                health.overall = 'degraded';
            }
        }

        // Check component limits
        if (this.metrics.totalComponents > this.config.maxComponents * 0.9) {
            health.overall = 'warning';
            health.componentLimitWarning = true;
        }

        // Emit health status
        this.eventBus.emit({
            type: 'orchestrator:health-check',
            source: 'component-orchestrator',
            data: health
        });

        if (this.config.debugMode) {
            console.log('System health check:', health);
        }
    }

    /**
     * Check individual system health
     */
    checkSystemHealthStatus(systemName, system) {
        const status = { status: 'healthy', metrics: {} };

        switch (systemName) {
            case 'performanceMonitor':
                const perfMetrics = system.getMetrics();
                status.metrics = perfMetrics;
                if (perfMetrics.failedEvents > 10) {
                    status.status = 'warning';
                }
                break;

            case 'errorBoundary':
                const errorStats = system.getErrorStatistics();
                status.metrics = errorStats;
                if (errorStats.totalErrors > 50) {
                    status.status = 'warning';
                }
                break;

            case 'stateManager':
                const stateStats = system.getStatistics();
                status.metrics = stateStats;
                if (stateStats.totalComponents > this.config.maxComponents) {
                    status.status = 'error';
                }
                break;

            default:
                status.metrics = { note: 'No specific health metrics available' };
        }

        return status;
    }

    /**
     * Get system statistics
     */
    getStatistics() {
        return {
            orchestrator: this.metrics,
            systems: Object.fromEntries(
                Array.from(this.systems.entries()).map(([name, system]) => [
                    name,
                    this.getSystemStatistics(name, system)
                ])
            ),
            components: {
                total: this.metrics.totalComponents,
                byType: this.getComponentsByTypeStats(),
                instances: this.componentInstances.size,
                registry: this.componentRegistry.size
            }
        };
    }

    /**
     * Get system-specific statistics
     */
    getSystemStatistics(systemName, system) {
        try {
            switch (systemName) {
                case 'performanceMonitor':
                    return system.getMetrics();
                case 'errorBoundary':
                    return system.getErrorStatistics();
                case 'stateManager':
                    return system.getStatistics();
                case 'eventBus':
                    return system.getMetrics();
                default:
                    return { note: 'No statistics method available' };
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get components by type statistics
     */
    getComponentsByTypeStats() {
        const stats = {};
        for (const instance of this.componentInstances.values()) {
            const type = instance.data.type;
            stats[type] = (stats[type] || 0) + 1;
        }
        return stats;
    }

    /**
     * Export orchestrator data
     */
    exportData() {
        return {
            config: this.config,
            metrics: this.metrics,
            statistics: this.getStatistics(),
            components: Array.from(this.componentRegistry.entries()),
            exported: Date.now()
        };
    }

    /**
     * Import orchestrator data
     */
    async importData(data) {
        try {
            // Import configuration
            if (data.config) {
                this.config = { ...this.config, ...data.config };
            }

            // Import components
            if (data.components) {
                for (const [componentId, componentData] of data.components) {
                    try {
                        await this.createComponent({ ...componentData, id: componentId });
                    } catch (error) {
                        console.error(`Failed to import component ${componentId}:`, error);
                    }
                }
            }

            console.log('Orchestrator data imported successfully');

        } catch (error) {
            console.error('Failed to import orchestrator data:', error);
            throw error;
        }
    }

    /**
     * Shutdown orchestrator
     */
    async shutdown() {
        try {
            // Stop performance monitoring
            if (this.performanceMonitor) {
                this.performanceMonitor.stopMonitoring();
            }

            // Destroy all components
            const componentIds = Array.from(this.componentInstances.keys());
            for (const componentId of componentIds) {
                await this.destroyComponent(componentId);
            }

            // Destroy systems
            for (const [systemName, system] of this.systems) {
                if (system.destroy) {
                    system.destroy();
                }
            }

            // Clear references
            this.systems.clear();
            this.componentInstances.clear();
            this.componentRegistry.clear();

            this.isInitialized = false;

            console.log('Component orchestrator shutdown complete');

        } catch (error) {
            console.error('Error during orchestrator shutdown:', error);
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ComponentOrchestrator = ComponentOrchestrator;
}

export default ComponentOrchestrator;