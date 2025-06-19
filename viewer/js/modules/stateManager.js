/**
 * Component State Management System
 * Handles component state, history, and communication
 */
class ComponentStateManager {
    constructor() {
        this.componentStates = new Map();
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 100;
        this.eventBus = null;
        this.nestingManager = null;
        this.subscribers = new Map();
        this.batchUpdates = false;
        this.pendingUpdates = new Set();
    }

    /**
     * Set dependencies
     */
    setEventBus(eventBus) {
        this.eventBus = eventBus;
    }

    setNestingManager(nestingManager) {
        this.nestingManager = nestingManager;
    }

    /**
     * Get component state
     */
    getState(componentId) {
        return this.componentStates.get(componentId) || null;
    }

    /**
     * Set component state
     */
    setState(componentId, partialState, skipHistory = false) {
        const currentState = this.getState(componentId);
        if (!currentState) {
            console.warn(`Component ${componentId} not found in state manager`);
            return;
        }

        const previousState = { ...currentState };
        const newState = { ...currentState, ...partialState };
        
        // Update timestamp
        newState.lastModified = Date.now();

        // Validate state change
        const validation = this.validateStateChange(componentId, previousState, newState);
        if (!validation.isValid) {
            console.error('State validation failed:', validation.errors);
            this.emitEvent('component:state:validation-failed', {
                componentId,
                errors: validation.errors,
                previousState,
                newState
            });
            return;
        }

        // Update state
        this.componentStates.set(componentId, newState);

        // Add to history
        if (!skipHistory) {
            this.addToHistory({
                type: 'state-change',
                componentId,
                previousState,
                newState,
                timestamp: Date.now()
            });
        }

        // Notify subscribers
        this.notifySubscribers(componentId, newState, previousState);

        // Emit event
        this.emitEvent('component:state:changed', {
            componentId,
            previousState,
            newState,
            changes: this.getStateChanges(previousState, newState)
        });

        return newState;
    }

    /**
     * Initialize component state
     */
    initializeState(componentData) {
        const componentId = componentData.id;
        const initialState = {
            id: componentId,
            type: componentData.type,
            component: componentData.component,
            category: componentData.category,
            subcategory: componentData.subcategory,
            props: componentData.props || {},
            children: [],
            parent: componentData.parentId || null,
            isVisible: true,
            isSelected: false,
            isDragging: false,
            hasError: false,
            errorMessage: null,
            lastModified: Date.now(),
            created: Date.now(),
            metadata: {
                depth: 0,
                index: 0,
                ...componentData.metadata
            }
        };

        this.componentStates.set(componentId, initialState);

        this.addToHistory({
            type: 'component-created',
            componentId,
            state: initialState,
            timestamp: Date.now()
        });

        this.emitEvent('component:state:initialized', {
            componentId,
            state: initialState
        });

        return initialState;
    }

    /**
     * Remove component state
     */
    removeState(componentId) {
        const state = this.getState(componentId);
        if (!state) return;

        // Remove from children lists of other components
        this.componentStates.forEach((componentState, id) => {
            if (componentState.children.includes(componentId)) {
                componentState.children = componentState.children.filter(childId => childId !== componentId);
                componentState.lastModified = Date.now();
            }
        });

        this.componentStates.delete(componentId);

        this.addToHistory({
            type: 'component-removed',
            componentId,
            state,
            timestamp: Date.now()
        });

        this.emitEvent('component:state:removed', {
            componentId,
            state
        });
    }

    /**
     * Update component props
     */
    updateProps(componentId, newProps, merge = true) {
        const currentState = this.getState(componentId);
        if (!currentState) return;

        const updatedProps = merge ? 
            { ...currentState.props, ...newProps } : 
            newProps;

        return this.setState(componentId, { props: updatedProps });
    }

    /**
     * Add child to component
     */
    addChild(parentId, childState) {
        const parentState = this.getState(parentId);
        if (!parentState) {
            throw new Error(`Parent component ${parentId} not found`);
        }

        // Initialize child state if not exists
        let childId = childState.id;
        if (!this.getState(childId)) {
            this.initializeState(childState);
        }

        // Update parent's children array
        if (!parentState.children.includes(childId)) {
            const updatedChildren = [...parentState.children, childId];
            this.setState(parentId, { children: updatedChildren });
        }

        // Update child's parent reference
        this.setState(childId, { parent: parentId });

        // Update metadata
        this.updateComponentMetadata(childId);

        this.emitEvent('component:child:added', {
            parentId,
            childId,
            childState: this.getState(childId)
        });
    }

    /**
     * Remove child from component
     */
    removeChild(parentId, childId) {
        const parentState = this.getState(parentId);
        const childState = this.getState(childId);

        if (!parentState || !childState) return;

        // Update parent's children array
        const updatedChildren = parentState.children.filter(id => id !== childId);
        this.setState(parentId, { children: updatedChildren });

        // Update child's parent reference
        this.setState(childId, { parent: null });

        this.emitEvent('component:child:removed', {
            parentId,
            childId,
            childState
        });
    }

    /**
     * Move component to new parent
     */
    moveComponent(componentId, newParentId, index = -1) {
        const componentState = this.getState(componentId);
        if (!componentState) return;

        const oldParentId = componentState.parent;

        // Remove from old parent
        if (oldParentId) {
            this.removeChild(oldParentId, componentId);
        }

        // Add to new parent
        if (newParentId) {
            this.addChild(newParentId, componentState);
            
            // Handle index positioning
            if (index >= 0) {
                const newParentState = this.getState(newParentId);
                const children = [...newParentState.children];
                
                // Remove from current position
                const currentIndex = children.indexOf(componentId);
                if (currentIndex >= 0) {
                    children.splice(currentIndex, 1);
                }
                
                // Insert at new position
                children.splice(index, 0, componentId);
                this.setState(newParentId, { children });
            }
        }

        // Update metadata for moved component and its descendants
        this.updateComponentMetadata(componentId);

        this.emitEvent('component:moved', {
            componentId,
            oldParentId,
            newParentId,
            index
        });
    }

    /**
     * Get full component tree
     */
    getFullTree() {
        const rootComponents = Array.from(this.componentStates.values())
            .filter(state => !state.parent);

        return rootComponents.map(root => this.buildStateTree(root));
    }

    /**
     * Build state tree recursively
     */
    buildStateTree(componentState) {
        const treeNode = { ...componentState };
        treeNode.children = componentState.children
            .map(childId => this.getState(childId))
            .filter(child => child)
            .map(child => this.buildStateTree(child));

        return treeNode;
    }

    /**
     * Validate state change
     */
    validateStateChange(componentId, previousState, newState) {
        const errors = [];
        const warnings = [];

        // Validate required fields
        const requiredFields = ['id', 'type', 'component'];
        for (const field of requiredFields) {
            if (!newState[field]) {
                errors.push({
                    type: 'required-field',
                    field,
                    message: `Required field '${field}' is missing`
                });
            }
        }

        // Validate children references
        for (const childId of newState.children || []) {
            if (!this.componentStates.has(childId)) {
                errors.push({
                    type: 'invalid-child',
                    childId,
                    message: `Child component '${childId}' does not exist`
                });
            }
        }

        // Validate parent reference
        if (newState.parent && !this.componentStates.has(newState.parent)) {
            errors.push({
                type: 'invalid-parent',
                parentId: newState.parent,
                message: `Parent component '${newState.parent}' does not exist`
            });
        }

        // Validate nesting rules if nesting manager is available
        if (this.nestingManager && newState.parent) {
            const nestingResult = this.nestingManager.canNest(
                newState.parent, 
                newState.type, 
                newState.component
            );
            
            if (!nestingResult.allowed) {
                errors.push({
                    type: 'nesting-violation',
                    message: nestingResult.reason,
                    code: nestingResult.code
                });
            }
        }

        // Performance warnings
        if (newState.children && newState.children.length > 50) {
            warnings.push({
                type: 'performance',
                message: `Component has many children (${newState.children.length}), consider optimization`
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Update component metadata (depth, index, etc.)
     */
    updateComponentMetadata(componentId) {
        const state = this.getState(componentId);
        if (!state) return;

        const metadata = { ...state.metadata };

        // Calculate depth
        if (this.nestingManager) {
            metadata.depth = this.nestingManager.getComponentDepth(componentId);
        } else {
            metadata.depth = this.calculateDepth(componentId);
        }

        // Calculate index within parent
        if (state.parent) {
            const parentState = this.getState(state.parent);
            if (parentState) {
                metadata.index = parentState.children.indexOf(componentId);
            }
        }

        this.setState(componentId, { metadata }, true); // Skip history for metadata updates

        // Update children recursively
        for (const childId of state.children) {
            this.updateComponentMetadata(childId);
        }
    }

    /**
     * Calculate component depth manually
     */
    calculateDepth(componentId, visited = new Set()) {
        if (visited.has(componentId)) {
            // Circular reference detected
            console.warn('Circular reference detected in component tree');
            return 0;
        }

        visited.add(componentId);
        const state = this.getState(componentId);
        if (!state || !state.parent) {
            return 0;
        }

        return 1 + this.calculateDepth(state.parent, visited);
    }

    /**
     * Get state changes between two states
     */
    getStateChanges(previousState, newState) {
        const changes = {};

        for (const key in newState) {
            if (previousState[key] !== newState[key]) {
                changes[key] = {
                    from: previousState[key],
                    to: newState[key]
                };
            }
        }

        return changes;
    }

    /**
     * Subscribe to state changes
     */
    subscribe(componentId, callback) {
        if (!this.subscribers.has(componentId)) {
            this.subscribers.set(componentId, new Set());
        }
        this.subscribers.get(componentId).add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(componentId);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.subscribers.delete(componentId);
                }
            }
        };
    }

    /**
     * Notify subscribers of state changes
     */
    notifySubscribers(componentId, newState, previousState) {
        const callbacks = this.subscribers.get(componentId);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(newState, previousState);
                } catch (error) {
                    console.error('Error in state change callback:', error);
                }
            });
        }
    }

    /**
     * Batch multiple state updates
     */
    batch(updateFunction) {
        this.batchUpdates = true;
        this.pendingUpdates.clear();

        try {
            updateFunction();
        } finally {
            this.batchUpdates = false;
            
            // Process pending updates
            this.pendingUpdates.forEach(componentId => {
                this.updateComponentMetadata(componentId);
            });
            this.pendingUpdates.clear();
        }
    }

    /**
     * History management
     */
    addToHistory(entry) {
        // Remove future history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        this.history.push(entry);
        this.historyIndex++;

        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(-this.maxHistorySize);
            this.historyIndex = this.history.length - 1;
        }

        this.emitEvent('state:history:added', { entry, historyIndex: this.historyIndex });
    }

    /**
     * Undo last action
     */
    undo() {
        if (this.historyIndex < 0) return false;

        const entry = this.history[this.historyIndex];
        this.executeHistoryEntry(entry, true);
        this.historyIndex--;

        this.emitEvent('state:undo', { entry, historyIndex: this.historyIndex });
        return true;
    }

    /**
     * Redo next action
     */
    redo() {
        if (this.historyIndex >= this.history.length - 1) return false;

        this.historyIndex++;
        const entry = this.history[this.historyIndex];
        this.executeHistoryEntry(entry, false);

        this.emitEvent('state:redo', { entry, historyIndex: this.historyIndex });
        return true;
    }

    /**
     * Execute history entry for undo/redo
     */
    executeHistoryEntry(entry, isUndo) {
        switch (entry.type) {
            case 'state-change':
                const targetState = isUndo ? entry.previousState : entry.newState;
                this.setState(entry.componentId, targetState, true);
                break;

            case 'component-created':
                if (isUndo) {
                    this.removeState(entry.componentId);
                } else {
                    this.componentStates.set(entry.componentId, entry.state);
                }
                break;

            case 'component-removed':
                if (isUndo) {
                    this.componentStates.set(entry.componentId, entry.state);
                } else {
                    this.removeState(entry.componentId);
                }
                break;

            default:
                console.warn('Unknown history entry type:', entry.type);
        }
    }

    /**
     * Get history
     */
    getHistory() {
        return this.history.slice();
    }

    /**
     * Clear history
     */
    clearHistory() {
        this.history = [];
        this.historyIndex = -1;
        this.emitEvent('state:history:cleared', {});
    }

    /**
     * Export state for persistence
     */
    exportState() {
        return {
            states: Array.from(this.componentStates.entries()),
            history: this.history,
            historyIndex: this.historyIndex,
            exported: Date.now()
        };
    }

    /**
     * Import state from persistence
     */
    importState(stateData) {
        this.componentStates.clear();
        this.subscribers.clear();

        // Import states
        for (const [id, state] of stateData.states) {
            this.componentStates.set(id, state);
        }

        // Import history
        this.history = stateData.history || [];
        this.historyIndex = stateData.historyIndex || -1;

        this.emitEvent('state:imported', { stateData });
    }

    /**
     * Get state statistics
     */
    getStatistics() {
        const states = Array.from(this.componentStates.values());
        
        return {
            totalComponents: states.length,
            componentsByType: states.reduce((acc, state) => {
                acc[state.type] = (acc[state.type] || 0) + 1;
                return acc;
            }, {}),
            rootComponents: states.filter(state => !state.parent).length,
            leafComponents: states.filter(state => state.children.length === 0).length,
            maxDepth: Math.max(...states.map(state => state.metadata?.depth || 0), 0),
            historySize: this.history.length,
            subscriberCount: this.subscribers.size
        };
    }

    /**
     * Emit event through event bus
     */
    emitEvent(type, data) {
        if (this.eventBus) {
            this.eventBus.emit({
                type,
                source: 'state-manager',
                data,
                timestamp: Date.now(),
                propagate: true
            });
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ComponentStateManager = ComponentStateManager;
}

export default ComponentStateManager;