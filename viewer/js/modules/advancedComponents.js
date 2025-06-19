/**
 * Advanced Component Types
 * Smart containers, conditional components, and dynamic lists
 */
class AdvancedComponentManager {
    constructor() {
        this.componentTypes = new Map();
        this.eventBus = null;
        this.stateManager = null;
        this.nestingManager = null;
        this.performanceMonitor = null;
        this.errorBoundary = null;

        this.initializeComponentTypes();
    }

    /**
     * Set dependencies
     */
    setEventBus(eventBus) {
        this.eventBus = eventBus;
    }

    setStateManager(stateManager) {
        this.stateManager = stateManager;
    }

    setNestingManager(nestingManager) {
        this.nestingManager = nestingManager;
    }

    setPerformanceMonitor(performanceMonitor) {
        this.performanceMonitor = performanceMonitor;
    }

    setErrorBoundary(errorBoundary) {
        this.errorBoundary = errorBoundary;
    }

    /**
     * Initialize advanced component types
     */
    initializeComponentTypes() {
        // Smart Container Component
        this.registerComponentType('smart-container', {
            name: 'Smart Container',
            category: 'layout',
            subcategory: 'smart',
            description: 'Intelligent container that adapts based on content and context',
            factory: this.createSmartContainer.bind(this),
            validator: this.validateSmartContainer.bind(this),
            renderer: this.renderSmartContainer.bind(this),
            updater: this.updateSmartContainer.bind(this),
            destroyer: this.destroySmartContainer.bind(this),
            defaultProps: {
                adaptiveLayout: true,
                responsiveBreakpoints: ['sm', 'md', 'lg', 'xl'],
                contentAnalysis: true,
                autoOptimize: true,
                maxChildren: 50,
                layoutStrategy: 'auto'
            }
        });

        // Conditional Component
        this.registerComponentType('conditional', {
            name: 'Conditional Component',
            category: 'logic',
            subcategory: 'conditional',
            description: 'Component that renders conditionally based on state or props',
            factory: this.createConditionalComponent.bind(this),
            validator: this.validateConditionalComponent.bind(this),
            renderer: this.renderConditionalComponent.bind(this),
            updater: this.updateConditionalComponent.bind(this),
            destroyer: this.destroyConditionalComponent.bind(this),
            defaultProps: {
                condition: null,
                conditionType: 'expression', // 'expression', 'state', 'prop', 'custom'
                trueContent: null,
                falseContent: null,
                showPlaceholder: true,
                evaluateOnStateChange: true
            }
        });

        // Dynamic List Component
        this.registerComponentType('dynamic-list', {
            name: 'Dynamic List',
            category: 'data',
            subcategory: 'list',
            description: 'Dynamic list that renders items based on data with virtualization support',
            factory: this.createDynamicList.bind(this),
            validator: this.validateDynamicList.bind(this),
            renderer: this.renderDynamicList.bind(this),
            updater: this.updateDynamicList.bind(this),
            destroyer: this.destroyDynamicList.bind(this),
            defaultProps: {
                items: [],
                itemTemplate: null,
                virtualized: false,
                itemHeight: 'auto',
                maxVisibleItems: 100,
                sortable: false,
                filterable: false,
                groupBy: null,
                keyField: 'id'
            }
        });

        // Repeater Component
        this.registerComponentType('repeater', {
            name: 'Repeater',
            category: 'data',
            subcategory: 'repeater',
            description: 'Component that repeats a template for each item in a collection',
            factory: this.createRepeater.bind(this),
            validator: this.validateRepeater.bind(this),
            renderer: this.renderRepeater.bind(this),
            updater: this.updateRepeater.bind(this),
            destroyer: this.destroyRepeater.bind(this),
            defaultProps: {
                data: [],
                template: null,
                emptyMessage: 'No items to display',
                loadingMessage: 'Loading...',
                errorMessage: 'Error loading items',
                maxItems: 1000,
                lazy: false
            }
        });

        // State Container Component
        this.registerComponentType('state-container', {
            name: 'State Container',
            category: 'logic',
            subcategory: 'state',
            description: 'Container that provides state management for child components',
            factory: this.createStateContainer.bind(this),
            validator: this.validateStateContainer.bind(this),
            renderer: this.renderStateContainer.bind(this),
            updater: this.updateStateContainer.bind(this),
            destroyer: this.destroyStateContainer.bind(this),
            defaultProps: {
                initialState: {},
                stateKey: null,
                persistent: false,
                shareWithChildren: true,
                isolateState: false
            }
        });

        // Event Bridge Component
        this.registerComponentType('event-bridge', {
            name: 'Event Bridge',
            category: 'logic',
            subcategory: 'events',
            description: 'Component that bridges events between different parts of the application',
            factory: this.createEventBridge.bind(this),
            validator: this.validateEventBridge.bind(this),
            renderer: this.renderEventBridge.bind(this),
            updater: this.updateEventBridge.bind(this),
            destroyer: this.destroyEventBridge.bind(this),
            defaultProps: {
                eventMappings: [],
                filterEvents: false,
                transformEvents: false,
                debugMode: false,
                namespace: null
            }
        });
    }

    /**
     * Register component type
     */
    registerComponentType(type, definition) {
        this.componentTypes.set(type, definition);
    }

    /**
     * Get component type definition
     */
    getComponentType(type) {
        return this.componentTypes.get(type);
    }

    /**
     * Create component instance
     */
    createComponent(type, componentData) {
        const definition = this.componentTypes.get(type);
        if (!definition) {
            throw new Error(`Unknown component type: ${type}`);
        }

        try {
            return definition.factory(componentData);
        } catch (error) {
            if (this.errorBoundary) {
                this.errorBoundary.handleError(componentData.id, {
                    type: 'component-creation-error',
                    message: `Failed to create ${type} component`,
                    error,
                    source: 'advanced-components'
                });
            }
            throw error;
        }
    }

    // Smart Container Implementation
    createSmartContainer(componentData) {
        const container = {
            id: componentData.id,
            type: 'smart-container',
            props: { ...this.componentTypes.get('smart-container').defaultProps, ...componentData.props },
            children: [],
            state: {
                layout: 'auto',
                contentAnalysis: null,
                optimizations: [],
                breakpoint: 'lg'
            },
            methods: {
                analyzeContent: () => this.analyzeContainerContent(container),
                optimizeLayout: () => this.optimizeContainerLayout(container),
                adaptToBreakpoint: (bp) => this.adaptContainerToBreakpoint(container, bp)
            }
        };

        // Setup content analysis
        if (container.props.contentAnalysis) {
            this.setupContentAnalysis(container);
        }

        // Setup responsive behavior
        this.setupResponsiveBehavior(container);

        return container;
    }

    validateSmartContainer(container) {
        const errors = [];
        
        if (container.children.length > container.props.maxChildren) {
            errors.push(`Too many children (${container.children.length}/${container.props.maxChildren})`);
        }

        return { isValid: errors.length === 0, errors };
    }

    renderSmartContainer(container) {
        const analysis = container.methods.analyzeContent();
        const layout = this.determineOptimalLayout(container, analysis);

        return `
            <div class="smart-container ${layout.classes}" 
                 data-component-id="${container.id}"
                 data-layout="${layout.type}"
                 data-breakpoint="${container.state.breakpoint}">
                ${this.renderContainerContent(container, layout)}
            </div>
        `;
    }

    updateSmartContainer(container, changes) {
        if (changes.children || changes.props) {
            // Re-analyze content
            const analysis = container.methods.analyzeContent();
            
            // Update layout if needed
            if (analysis.layoutSuggestion !== container.state.layout) {
                container.state.layout = analysis.layoutSuggestion;
                container.methods.optimizeLayout();
            }
        }
    }

    destroySmartContainer(container) {
        // Cleanup observers and timers
        if (container._resizeObserver) {
            container._resizeObserver.disconnect();
        }
        if (container._analysisTimer) {
            clearInterval(container._analysisTimer);
        }
    }

    // Conditional Component Implementation
    createConditionalComponent(componentData) {
        const conditional = {
            id: componentData.id,
            type: 'conditional',
            props: { ...this.componentTypes.get('conditional').defaultProps, ...componentData.props },
            state: {
                conditionResult: false,
                lastEvaluation: null,
                evaluationCount: 0
            },
            methods: {
                evaluateCondition: () => this.evaluateCondition(conditional),
                updateVisibility: () => this.updateConditionalVisibility(conditional)
            }
        };

        // Initial evaluation
        conditional.methods.evaluateCondition();

        // Setup state change listeners
        if (conditional.props.evaluateOnStateChange && this.stateManager) {
            this.setupConditionalStateListeners(conditional);
        }

        return conditional;
    }

    validateConditionalComponent(conditional) {
        const errors = [];
        
        if (!conditional.props.condition) {
            errors.push('Condition is required');
        }

        if (!conditional.props.trueContent && !conditional.props.falseContent) {
            errors.push('At least one content option (true or false) must be provided');
        }

        return { isValid: errors.length === 0, errors };
    }

    renderConditionalComponent(conditional) {
        const result = conditional.methods.evaluateCondition();
        const content = result ? conditional.props.trueContent : conditional.props.falseContent;

        if (!content && conditional.props.showPlaceholder) {
            return `
                <div class="conditional-placeholder" data-component-id="${conditional.id}">
                    <div class="text-gray-400 text-sm">Conditional content (${result ? 'true' : 'false'})</div>
                </div>
            `;
        }

        return content || '';
    }

    updateConditionalComponent(conditional, changes) {
        if (changes.props && (changes.props.condition || changes.props.conditionType)) {
            conditional.methods.evaluateCondition();
            conditional.methods.updateVisibility();
        }
    }

    destroyConditionalComponent(conditional) {
        // Cleanup listeners
        if (conditional._stateUnsubscribe) {
            conditional._stateUnsubscribe();
        }
    }

    // Dynamic List Implementation
    createDynamicList(componentData) {
        const list = {
            id: componentData.id,
            type: 'dynamic-list',
            props: { ...this.componentTypes.get('dynamic-list').defaultProps, ...componentData.props },
            state: {
                visibleItems: [],
                scrollTop: 0,
                itemHeights: new Map(),
                totalHeight: 0,
                isVirtualized: false
            },
            methods: {
                updateVisibleItems: () => this.updateListVisibleItems(list),
                scrollToItem: (index) => this.scrollListToItem(list, index),
                addItem: (item, index) => this.addListItem(list, item, index),
                removeItem: (index) => this.removeListItem(list, index),
                filterItems: (predicate) => this.filterListItems(list, predicate),
                sortItems: (compareFn) => this.sortListItems(list, compareFn)
            }
        };

        // Setup virtualization if enabled
        if (list.props.virtualized) {
            this.setupListVirtualization(list);
        }

        // Setup sorting and filtering
        if (list.props.sortable || list.props.filterable) {
            this.setupListInteractions(list);
        }

        return list;
    }

    validateDynamicList(list) {
        const errors = [];
        
        if (!Array.isArray(list.props.items)) {
            errors.push('Items must be an array');
        }

        if (list.props.virtualized && list.props.itemHeight === 'auto') {
            errors.push('Virtualized lists require fixed item height');
        }

        return { isValid: errors.length === 0, errors };
    }

    renderDynamicList(list) {
        const items = list.props.virtualized ? list.state.visibleItems : list.props.items;
        
        return `
            <div class="dynamic-list" 
                 data-component-id="${list.id}"
                 ${list.props.virtualized ? `style="height: ${list.state.totalHeight}px; overflow-y: auto;"` : ''}>
                ${items.map((item, index) => this.renderListItem(list, item, index)).join('')}
            </div>
        `;
    }

    updateDynamicList(list, changes) {
        if (changes.props && changes.props.items) {
            if (list.props.virtualized) {
                list.methods.updateVisibleItems();
            }
        }
    }

    destroyDynamicList(list) {
        // Cleanup scroll listeners
        if (list._scrollListener) {
            const element = document.querySelector(`[data-component-id="${list.id}"]`);
            if (element) {
                element.removeEventListener('scroll', list._scrollListener);
            }
        }
    }

    // Repeater Implementation
    createRepeater(componentData) {
        const repeater = {
            id: componentData.id,
            type: 'repeater',
            props: { ...this.componentTypes.get('repeater').defaultProps, ...componentData.props },
            state: {
                isLoading: false,
                hasError: false,
                errorMessage: null,
                renderedItems: []
            },
            methods: {
                renderItems: () => this.renderRepeaterItems(repeater),
                updateData: (newData) => this.updateRepeaterData(repeater, newData),
                refresh: () => this.refreshRepeater(repeater)
            }
        };

        // Setup lazy loading if enabled
        if (repeater.props.lazy) {
            this.setupRepeaterLazyLoading(repeater);
        }

        return repeater;
    }

    validateRepeater(repeater) {
        const errors = [];
        
        if (!Array.isArray(repeater.props.data)) {
            errors.push('Data must be an array');
        }

        if (!repeater.props.template) {
            errors.push('Template is required');
        }

        if (repeater.props.data.length > repeater.props.maxItems) {
            errors.push(`Too many items (${repeater.props.data.length}/${repeater.props.maxItems})`);
        }

        return { isValid: errors.length === 0, errors };
    }

    renderRepeater(repeater) {
        if (repeater.state.isLoading) {
            return `<div class="repeater-loading" data-component-id="${repeater.id}">${repeater.props.loadingMessage}</div>`;
        }

        if (repeater.state.hasError) {
            return `<div class="repeater-error" data-component-id="${repeater.id}">${repeater.state.errorMessage}</div>`;
        }

        if (repeater.props.data.length === 0) {
            return `<div class="repeater-empty" data-component-id="${repeater.id}">${repeater.props.emptyMessage}</div>`;
        }

        return `
            <div class="repeater" data-component-id="${repeater.id}">
                ${repeater.methods.renderItems()}
            </div>
        `;
    }

    updateRepeater(repeater, changes) {
        if (changes.props && changes.props.data) {
            repeater.methods.renderItems();
        }
    }

    destroyRepeater(repeater) {
        // Cleanup any pending operations
        if (repeater._lazyLoader) {
            repeater._lazyLoader.disconnect();
        }
    }

    // State Container Implementation
    createStateContainer(componentData) {
        const container = {
            id: componentData.id,
            type: 'state-container',
            props: { ...this.componentTypes.get('state-container').defaultProps, ...componentData.props },
            state: {
                containerState: { ...componentData.props.initialState },
                subscribers: new Set()
            },
            methods: {
                getState: () => container.state.containerState,
                setState: (newState) => this.setContainerState(container, newState),
                subscribe: (callback) => this.subscribeToContainerState(container, callback),
                unsubscribe: (callback) => this.unsubscribeFromContainerState(container, callback)
            }
        };

        // Setup persistence if enabled
        if (container.props.persistent && container.props.stateKey) {
            this.setupStatePersistence(container);
        }

        return container;
    }

    validateStateContainer(container) {
        const errors = [];
        
        if (container.props.persistent && !container.props.stateKey) {
            errors.push('State key is required for persistent state');
        }

        return { isValid: errors.length === 0, errors };
    }

    renderStateContainer(container) {
        return `
            <div class="state-container" data-component-id="${container.id}">
                <!-- Child components will be rendered here -->
            </div>
        `;
    }

    updateStateContainer(container, changes) {
        if (changes.state) {
            // Notify subscribers
            container.state.subscribers.forEach(callback => {
                try {
                    callback(container.state.containerState);
                } catch (error) {
                    console.error('Error in state container subscriber:', error);
                }
            });
        }
    }

    destroyStateContainer(container) {
        container.state.subscribers.clear();
    }

    // Event Bridge Implementation
    createEventBridge(componentData) {
        const bridge = {
            id: componentData.id,
            type: 'event-bridge',
            props: { ...this.componentTypes.get('event-bridge').defaultProps, ...componentData.props },
            state: {
                eventMappings: new Map(),
                activeListeners: new Map()
            },
            methods: {
                addMapping: (from, to, transform) => this.addEventMapping(bridge, from, to, transform),
                removeMapping: (from) => this.removeEventMapping(bridge, from),
                bridgeEvent: (event) => this.bridgeEvent(bridge, event)
            }
        };

        // Setup event mappings
        if (bridge.props.eventMappings) {
            bridge.props.eventMappings.forEach(mapping => {
                bridge.methods.addMapping(mapping.from, mapping.to, mapping.transform);
            });
        }

        return bridge;
    }

    validateEventBridge(bridge) {
        const errors = [];
        
        if (!Array.isArray(bridge.props.eventMappings)) {
            errors.push('Event mappings must be an array');
        }

        return { isValid: errors.length === 0, errors };
    }

    renderEventBridge(bridge) {
        if (bridge.props.debugMode) {
            return `
                <div class="event-bridge debug" data-component-id="${bridge.id}">
                    <div class="debug-info">
                        <h4>Event Bridge Debug</h4>
                        <p>Mappings: ${bridge.state.eventMappings.size}</p>
                        <p>Active Listeners: ${bridge.state.activeListeners.size}</p>
                    </div>
                </div>
            `;
        }
        
        return `<div class="event-bridge" data-component-id="${bridge.id}" style="display: none;"></div>`;
    }

    updateEventBridge(bridge, changes) {
        if (changes.props && changes.props.eventMappings) {
            // Re-setup event mappings
            bridge.state.eventMappings.clear();
            bridge.props.eventMappings.forEach(mapping => {
                bridge.methods.addMapping(mapping.from, mapping.to, mapping.transform);
            });
        }
    }

    destroyEventBridge(bridge) {
        // Remove all event listeners
        bridge.state.activeListeners.forEach((unsubscribe, eventType) => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        bridge.state.activeListeners.clear();
    }

    // Helper Methods

    analyzeContainerContent(container) {
        const children = container.children || [];
        const analysis = {
            childCount: children.length,
            contentTypes: [],
            layoutSuggestion: 'auto',
            optimizations: []
        };

        // Analyze child types
        children.forEach(child => {
            if (child.type) {
                analysis.contentTypes.push(child.type);
            }
        });

        // Suggest layout based on content
        if (children.length > 10) {
            analysis.layoutSuggestion = 'grid';
            analysis.optimizations.push('Consider virtualization for large lists');
        } else if (children.length > 5) {
            analysis.layoutSuggestion = 'flex';
        } else {
            analysis.layoutSuggestion = 'block';
        }

        return analysis;
    }

    evaluateCondition(conditional) {
        const { condition, conditionType } = conditional.props;
        let result = false;

        try {
            switch (conditionType) {
                case 'expression':
                    result = this.evaluateExpression(condition, conditional);
                    break;
                case 'state':
                    result = this.evaluateStateCondition(condition, conditional);
                    break;
                case 'prop':
                    result = this.evaluatePropCondition(condition, conditional);
                    break;
                case 'custom':
                    result = this.evaluateCustomCondition(condition, conditional);
                    break;
                default:
                    result = Boolean(condition);
            }

            conditional.state.conditionResult = result;
            conditional.state.lastEvaluation = Date.now();
            conditional.state.evaluationCount++;

        } catch (error) {
            console.error('Error evaluating condition:', error);
            if (this.errorBoundary) {
                this.errorBoundary.handleError(conditional.id, {
                    type: 'condition-evaluation-error',
                    message: 'Failed to evaluate condition',
                    error,
                    source: 'conditional-component'
                });
            }
            result = false;
        }

        return result;
    }

    evaluateExpression(expression, conditional) {
        // Simple expression evaluation
        // In a real implementation, you might use a safe expression evaluator
        if (typeof expression === 'string') {
            // Replace variables with actual values
            const context = this.getExpressionContext(conditional);
            return this.safeEval(expression, context);
        }
        return Boolean(expression);
    }

    evaluateStateCondition(condition, conditional) {
        if (!this.stateManager) return false;
        
        const state = this.stateManager.getState(conditional.id);
        return Boolean(state && state[condition]);
    }

    evaluatePropCondition(condition, conditional) {
        return Boolean(conditional.props[condition]);
    }

    evaluateCustomCondition(condition, conditional) {
        if (typeof condition === 'function') {
            return condition(conditional);
        }
        return Boolean(condition);
    }

    getExpressionContext(conditional) {
        const context = {};
        
        if (this.stateManager) {
            const state = this.stateManager.getState(conditional.id);
            if (state) {
                context.state = state;
            }
        }

        context.props = conditional.props;
        context.component = conditional;

        return context;
    }

    safeEval(expression, context) {
        // Simple safe evaluation - in production, use a proper expression evaluator
        try {
            const func = new Function('context', `with(context) { return ${expression}; }`);
            return func(context);
        } catch (error) {
            console.error('Expression evaluation error:', error);
            return false;
        }
    }

    /**
     * Get all registered component types
     */
    getComponentTypes() {
        return Array.from(this.componentTypes.entries()).map(([type, definition]) => ({
            type,
            name: definition.name,
            category: definition.category,
            subcategory: definition.subcategory,
            description: definition.description,
            defaultProps: definition.defaultProps
        }));
    }

    /**
     * Export advanced components data
     */
    exportData() {
        return {
            componentTypes: this.getComponentTypes(),
            exported: Date.now()
        };
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AdvancedComponentManager = AdvancedComponentManager;
}

export default AdvancedComponentManager;