/**
 * Error Boundary System for Component Isolation
 * Provides error handling and recovery mechanisms for components
 */
class ComponentErrorBoundary {
    constructor() {
        this.errorBoundaries = new Map();
        this.errorHistory = [];
        this.maxHistorySize = 500;
        this.eventBus = null;
        this.stateManager = null;
        this.performanceMonitor = null;
        
        this.errorTypes = {
            RENDER_ERROR: 'render-error',
            STATE_ERROR: 'state-error',
            EVENT_ERROR: 'event-error',
            LIFECYCLE_ERROR: 'lifecycle-error',
            NESTING_ERROR: 'nesting-error',
            VALIDATION_ERROR: 'validation-error',
            PERFORMANCE_ERROR: 'performance-error',
            UNKNOWN_ERROR: 'unknown-error'
        };

        this.recoveryStrategies = {
            RETRY: 'retry',
            FALLBACK: 'fallback',
            ISOLATE: 'isolate',
            REMOVE: 'remove',
            RESET: 'reset'
        };

        this.globalErrorHandler = this.handleGlobalError.bind(this);
        this.setupGlobalErrorHandling();
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

    setPerformanceMonitor(performanceMonitor) {
        this.performanceMonitor = performanceMonitor;
    }

    /**
     * Setup global error handling
     */
    setupGlobalErrorHandling() {
        // Handle unhandled errors
        window.addEventListener('error', this.globalErrorHandler);
        window.addEventListener('unhandledrejection', this.globalErrorHandler);

        // Handle console errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.handleConsoleError(args);
            originalConsoleError.apply(console, args);
        };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.eventBus) return;

        // Monitor component lifecycle for errors
        this.eventBus.on('component:created', (event) => {
            this.createErrorBoundary(event.data);
        });

        this.eventBus.on('component:destroyed', (event) => {
            this.removeErrorBoundary(event.data.componentId || event.data.id);
        });

        // Monitor state changes for errors
        this.eventBus.on('component:state:validation-failed', (event) => {
            this.handleError(event.data.componentId, {
                type: this.errorTypes.VALIDATION_ERROR,
                message: 'State validation failed',
                details: event.data.errors,
                source: 'state-validation'
            });
        });

        // Monitor performance issues
        this.eventBus.on('performance:alert', (event) => {
            if (event.data.severity === 'error') {
                this.handleError(event.data.componentId, {
                    type: this.errorTypes.PERFORMANCE_ERROR,
                    message: event.data.message,
                    details: event.data,
                    source: 'performance-monitor'
                });
            }
        });
    }

    /**
     * Create error boundary for component
     */
    createErrorBoundary(componentData) {
        const componentId = componentData.id;
        const boundary = {
            componentId,
            componentType: componentData.type,
            created: Date.now(),
            errorCount: 0,
            lastError: null,
            isIsolated: false,
            retryCount: 0,
            maxRetries: 3,
            fallbackContent: null,
            recoveryStrategy: this.recoveryStrategies.RETRY,
            errorCallbacks: [],
            recoveryCallbacks: []
        };

        this.errorBoundaries.set(componentId, boundary);

        // Wrap component methods with error handling
        this.wrapComponentMethods(componentId);

        this.emitEvent('error-boundary:created', {
            componentId,
            boundary
        });

        return boundary;
    }

    /**
     * Remove error boundary
     */
    removeErrorBoundary(componentId) {
        const boundary = this.errorBoundaries.get(componentId);
        if (boundary) {
            this.errorBoundaries.delete(componentId);
            
            this.emitEvent('error-boundary:removed', {
                componentId,
                finalState: boundary
            });
        }
    }

    /**
     * Wrap component methods with error handling
     */
    wrapComponentMethods(componentId) {
        // This would typically wrap DOM manipulation methods
        // For now, we'll set up monitoring
        const boundary = this.errorBoundaries.get(componentId);
        if (!boundary) return;

        // Monitor DOM mutations for this component
        const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
        if (componentElement) {
            this.setupDOMErrorMonitoring(componentId, componentElement);
        }
    }

    /**
     * Setup DOM error monitoring
     */
    setupDOMErrorMonitoring(componentId, element) {
        // Monitor for DOM errors
        const observer = new MutationObserver((mutations) => {
            try {
                mutations.forEach((mutation) => {
                    // Check for potential issues in mutations
                    this.validateDOMMutation(componentId, mutation);
                });
            } catch (error) {
                this.handleError(componentId, {
                    type: this.errorTypes.RENDER_ERROR,
                    message: 'DOM mutation error',
                    error,
                    source: 'dom-observer'
                });
            }
        });

        observer.observe(element, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });

        // Store observer for cleanup
        const boundary = this.errorBoundaries.get(componentId);
        if (boundary) {
            boundary.domObserver = observer;
        }
    }

    /**
     * Validate DOM mutation
     */
    validateDOMMutation(componentId, mutation) {
        // Check for common DOM issues
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check for invalid nesting
                    this.validateElementNesting(componentId, node);
                    
                    // Check for accessibility issues
                    this.validateAccessibility(componentId, node);
                }
            });
        }
    }

    /**
     * Validate element nesting
     */
    validateElementNesting(componentId, element) {
        // Check for invalid HTML nesting
        const tagName = element.tagName?.toLowerCase();
        const parent = element.parentElement;
        
        if (parent && tagName) {
            const parentTag = parent.tagName?.toLowerCase();
            
            // Check for common invalid nesting patterns
            const invalidNesting = [
                { parent: 'p', child: 'div' },
                { parent: 'span', child: 'div' },
                { parent: 'a', child: 'a' }
            ];

            const isInvalid = invalidNesting.some(rule => 
                rule.parent === parentTag && rule.child === tagName
            );

            if (isInvalid) {
                this.handleError(componentId, {
                    type: this.errorTypes.RENDER_ERROR,
                    message: `Invalid HTML nesting: ${tagName} inside ${parentTag}`,
                    details: { element, parent },
                    source: 'nesting-validation',
                    severity: 'warning'
                });
            }
        }
    }

    /**
     * Validate accessibility
     */
    validateAccessibility(componentId, element) {
        const issues = [];

        // Check for missing alt text on images
        if (element.tagName === 'IMG' && !element.alt) {
            issues.push('Image missing alt attribute');
        }

        // Check for missing labels on form controls
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
            const hasLabel = element.labels && element.labels.length > 0;
            const hasAriaLabel = element.hasAttribute('aria-label');
            const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');

            if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
                issues.push('Form control missing label');
            }
        }

        // Check for heading hierarchy
        if (element.tagName?.match(/^H[1-6]$/)) {
            // This would need more complex logic to check heading hierarchy
            // For now, just note that it's a heading
        }

        if (issues.length > 0) {
            this.handleError(componentId, {
                type: this.errorTypes.VALIDATION_ERROR,
                message: 'Accessibility issues detected',
                details: { issues, element },
                source: 'accessibility-validation',
                severity: 'warning'
            });
        }
    }

    /**
     * Handle component error
     */
    handleError(componentId, errorInfo) {
        const boundary = this.errorBoundaries.get(componentId);
        if (!boundary) {
            // Create boundary if it doesn't exist
            this.createErrorBoundary({ id: componentId, type: 'unknown' });
            return this.handleError(componentId, errorInfo);
        }

        // Enhance error info
        const enhancedError = {
            ...errorInfo,
            componentId,
            timestamp: Date.now(),
            id: this.generateId(),
            boundary: boundary.componentId,
            context: this.getErrorContext(componentId)
        };

        // Update boundary
        boundary.errorCount++;
        boundary.lastError = enhancedError;

        // Add to history
        this.errorHistory.push(enhancedError);
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
        }

        // Execute recovery strategy
        this.executeRecoveryStrategy(componentId, enhancedError);

        // Notify callbacks
        boundary.errorCallbacks.forEach(callback => {
            try {
                callback(enhancedError);
            } catch (callbackError) {
                console.error('Error in error callback:', callbackError);
            }
        });

        // Emit event
        this.emitEvent('error-boundary:error', enhancedError);

        // Update performance metrics
        if (this.performanceMonitor) {
            const metrics = this.performanceMonitor.getMetrics(componentId);
            if (metrics) {
                metrics.errorCount = boundary.errorCount;
            }
        }

        return enhancedError;
    }

    /**
     * Get error context
     */
    getErrorContext(componentId) {
        const context = {
            componentId,
            timestamp: Date.now()
        };

        // Add state information
        if (this.stateManager) {
            context.state = this.stateManager.getState(componentId);
        }

        // Add performance information
        if (this.performanceMonitor) {
            context.performance = this.performanceMonitor.getMetrics(componentId);
        }

        // Add DOM information
        const element = document.querySelector(`[data-component-id="${componentId}"]`);
        if (element) {
            context.dom = {
                tagName: element.tagName,
                className: element.className,
                id: element.id,
                childCount: element.children.length,
                hasParent: !!element.parentElement
            };
        }

        return context;
    }

    /**
     * Execute recovery strategy
     */
    executeRecoveryStrategy(componentId, errorInfo) {
        const boundary = this.errorBoundaries.get(componentId);
        if (!boundary) return;

        switch (boundary.recoveryStrategy) {
            case this.recoveryStrategies.RETRY:
                this.retryComponent(componentId, errorInfo);
                break;

            case this.recoveryStrategies.FALLBACK:
                this.showFallbackContent(componentId, errorInfo);
                break;

            case this.recoveryStrategies.ISOLATE:
                this.isolateComponent(componentId, errorInfo);
                break;

            case this.recoveryStrategies.REMOVE:
                this.removeComponent(componentId, errorInfo);
                break;

            case this.recoveryStrategies.RESET:
                this.resetComponent(componentId, errorInfo);
                break;

            default:
                console.warn('Unknown recovery strategy:', boundary.recoveryStrategy);
        }
    }

    /**
     * Retry component operation
     */
    retryComponent(componentId, errorInfo) {
        const boundary = this.errorBoundaries.get(componentId);
        if (!boundary) return;

        if (boundary.retryCount >= boundary.maxRetries) {
            // Switch to fallback strategy
            boundary.recoveryStrategy = this.recoveryStrategies.FALLBACK;
            this.showFallbackContent(componentId, errorInfo);
            return;
        }

        boundary.retryCount++;

        // Attempt retry after delay
        setTimeout(() => {
            try {
                this.emitEvent('error-boundary:retry', {
                    componentId,
                    retryCount: boundary.retryCount,
                    errorInfo
                });

                // Reset error state if retry succeeds
                boundary.lastError = null;
                
            } catch (retryError) {
                this.handleError(componentId, {
                    type: this.errorTypes.LIFECYCLE_ERROR,
                    message: 'Retry failed',
                    error: retryError,
                    source: 'error-recovery'
                });
            }
        }, 1000 * boundary.retryCount); // Exponential backoff
    }

    /**
     * Show fallback content
     */
    showFallbackContent(componentId, errorInfo) {
        const boundary = this.errorBoundaries.get(componentId);
        if (!boundary) return;

        const element = document.querySelector(`[data-component-id="${componentId}"]`);
        if (element) {
            // Store original content
            if (!boundary.originalContent) {
                boundary.originalContent = element.innerHTML;
            }

            // Show fallback
            const fallbackContent = boundary.fallbackContent || this.getDefaultFallbackContent(errorInfo);
            element.innerHTML = fallbackContent;
            element.classList.add('error-boundary-fallback');

            this.emitEvent('error-boundary:fallback-shown', {
                componentId,
                errorInfo
            });
        }
    }

    /**
     * Get default fallback content
     */
    getDefaultFallbackContent(errorInfo) {
        return `
            <div class="error-boundary-message bg-red-50 border border-red-200 rounded-md p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">Component Error</h3>
                        <div class="mt-2 text-sm text-red-700">
                            <p>This component encountered an error and is temporarily unavailable.</p>
                            ${errorInfo.type !== this.errorTypes.PERFORMANCE_ERROR ? 
                                '<button class="mt-2 text-sm text-red-600 hover:text-red-500 underline" onclick="window.errorBoundary.recoverComponent(\'' + errorInfo.componentId + '\')">Try Again</button>' : 
                                ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Isolate component
     */
    isolateComponent(componentId, errorInfo) {
        const boundary = this.errorBoundaries.get(componentId);
        if (!boundary) return;

        boundary.isIsolated = true;

        const element = document.querySelector(`[data-component-id="${componentId}"]`);
        if (element) {
            element.classList.add('error-boundary-isolated');
            element.style.pointerEvents = 'none';
            element.style.opacity = '0.5';
        }

        this.emitEvent('error-boundary:isolated', {
            componentId,
            errorInfo
        });
    }

    /**
     * Remove component
     */
    removeComponent(componentId, errorInfo) {
        const element = document.querySelector(`[data-component-id="${componentId}"]`);
        if (element) {
            element.remove();
        }

        // Remove from state manager
        if (this.stateManager) {
            this.stateManager.removeState(componentId);
        }

        this.removeErrorBoundary(componentId);

        this.emitEvent('error-boundary:removed-component', {
            componentId,
            errorInfo
        });
    }

    /**
     * Reset component
     */
    resetComponent(componentId, errorInfo) {
        const boundary = this.errorBoundaries.get(componentId);
        if (!boundary) return;

        // Reset boundary state
        boundary.errorCount = 0;
        boundary.retryCount = 0;
        boundary.lastError = null;
        boundary.isIsolated = false;

        // Reset component state
        if (this.stateManager) {
            const state = this.stateManager.getState(componentId);
            if (state) {
                // Reset to initial state
                this.stateManager.setState(componentId, {
                    hasError: false,
                    errorMessage: null,
                    isVisible: true
                });
            }
        }

        // Reset DOM
        const element = document.querySelector(`[data-component-id="${componentId}"]`);
        if (element) {
            element.classList.remove('error-boundary-fallback', 'error-boundary-isolated');
            element.style.pointerEvents = '';
            element.style.opacity = '';

            if (boundary.originalContent) {
                element.innerHTML = boundary.originalContent;
            }
        }

        this.emitEvent('error-boundary:reset', {
            componentId,
            errorInfo
        });
    }

    /**
     * Recover component (public method for manual recovery)
     */
    recoverComponent(componentId) {
        const boundary = this.errorBoundaries.get(componentId);
        if (!boundary) return false;

        try {
            this.resetComponent(componentId, boundary.lastError);
            return true;
        } catch (error) {
            this.handleError(componentId, {
                type: this.errorTypes.LIFECYCLE_ERROR,
                message: 'Manual recovery failed',
                error,
                source: 'manual-recovery'
            });
            return false;
        }
    }

    /**
     * Handle global errors
     */
    handleGlobalError(event) {
        let errorInfo = {
            type: this.errorTypes.UNKNOWN_ERROR,
            message: 'Global error',
            source: 'global-handler'
        };

        if (event.error) {
            errorInfo.error = event.error;
            errorInfo.message = event.error.message || errorInfo.message;
        } else if (event.reason) {
            errorInfo.error = event.reason;
            errorInfo.message = event.reason.message || errorInfo.message;
        }

        // Try to find associated component
        const componentId = this.findComponentFromError(event);
        
        if (componentId) {
            this.handleError(componentId, errorInfo);
        } else {
            // Log global error
            this.errorHistory.push({
                ...errorInfo,
                timestamp: Date.now(),
                id: this.generateId(),
                global: true
            });

            this.emitEvent('error-boundary:global-error', errorInfo);
        }
    }

    /**
     * Handle console errors
     */
    handleConsoleError(args) {
        // Extract component information from console error if possible
        const message = args.join(' ');
        const componentId = this.extractComponentIdFromMessage(message);

        if (componentId) {
            this.handleError(componentId, {
                type: this.errorTypes.UNKNOWN_ERROR,
                message: 'Console error',
                details: { args },
                source: 'console'
            });
        }
    }

    /**
     * Find component from error event
     */
    findComponentFromError(event) {
        // Try to extract component ID from stack trace or target element
        if (event.target && event.target.closest) {
            const componentElement = event.target.closest('[data-component-id]');
            if (componentElement) {
                return componentElement.getAttribute('data-component-id');
            }
        }

        return null;
    }

    /**
     * Extract component ID from error message
     */
    extractComponentIdFromMessage(message) {
        // Look for component ID patterns in the message
        const match = message.match(/component[:\s]+([a-zA-Z0-9-_]+)/i);
        return match ? match[1] : null;
    }

    /**
     * Subscribe to error events
     */
    onError(componentId, callback) {
        const boundary = this.errorBoundaries.get(componentId);
        if (boundary) {
            boundary.errorCallbacks.push(callback);

            // Return unsubscribe function
            return () => {
                const index = boundary.errorCallbacks.indexOf(callback);
                if (index >= 0) {
                    boundary.errorCallbacks.splice(index, 1);
                }
            };
        }

        return () => {}; // No-op unsubscribe
    }

    /**
     * Subscribe to recovery events
     */
    onRecovery(componentId, callback) {
        const boundary = this.errorBoundaries.get(componentId);
        if (boundary) {
            boundary.recoveryCallbacks.push(callback);

            return () => {
                const index = boundary.recoveryCallbacks.indexOf(callback);
                if (index >= 0) {
                    boundary.recoveryCallbacks.splice(index, 1);
                }
            };
        }

        return () => {};
    }

    /**
     * Set fallback content for component
     */
    setFallbackContent(componentId, content) {
        const boundary = this.errorBoundaries.get(componentId);
        if (boundary) {
            boundary.fallbackContent = content;
        }
    }

    /**
     * Set recovery strategy for component
     */
    setRecoveryStrategy(componentId, strategy) {
        const boundary = this.errorBoundaries.get(componentId);
        if (boundary && Object.values(this.recoveryStrategies).includes(strategy)) {
            boundary.recoveryStrategy = strategy;
        }
    }

    /**
     * Get error statistics
     */
    getErrorStatistics() {
        const boundaries = Array.from(this.errorBoundaries.values());
        
        return {
            totalBoundaries: boundaries.length,
            totalErrors: this.errorHistory.length,
            errorsByType: this.errorHistory.reduce((acc, error) => {
                acc[error.type] = (acc[error.type] || 0) + 1;
                return acc;
            }, {}),
            componentsWithErrors: boundaries.filter(b => b.errorCount > 0).length,
            isolatedComponents: boundaries.filter(b => b.isIsolated).length,
            averageErrorsPerComponent: boundaries.length > 0 ? 
                boundaries.reduce((sum, b) => sum + b.errorCount, 0) / boundaries.length : 0
        };
    }

    /**
     * Get error history
     */
    getErrorHistory(componentId = null, limit = 100) {
        let history = this.errorHistory;
        
        if (componentId) {
            history = history.filter(error => error.componentId === componentId);
        }

        return history.slice(-limit);
    }

    /**
     * Clear error history
     */
    clearErrorHistory(componentId = null) {
        if (componentId) {
            this.errorHistory = this.errorHistory.filter(error => error.componentId !== componentId);
        } else {
            this.errorHistory = [];
        }
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
                source: 'error-boundary',
                data,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Export error boundary data
     */
    exportData() {
        return {
            boundaries: Array.from(this.errorBoundaries.entries()),
            errorHistory: this.errorHistory.slice(-100),
            statistics: this.getErrorStatistics(),
            exported: Date.now()
        };
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        // Remove global error handlers
        window.removeEventListener('error', this.globalErrorHandler);
        window.removeEventListener('unhandledrejection', this.globalErrorHandler);

        // Disconnect DOM observers
        this.errorBoundaries.forEach(boundary => {
            if (boundary.domObserver) {
                boundary.domObserver.disconnect();
            }
        });

        this.errorBoundaries.clear();
        this.errorHistory = [];
    }
}

// Make available globally for fallback content
if (typeof window !== 'undefined') {
    window.ComponentErrorBoundary = ComponentErrorBoundary;
    window.errorBoundary = null; // Will be set by the main system
}

export default ComponentErrorBoundary;