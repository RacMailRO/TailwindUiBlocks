/**
 * Component Nesting System
 * Handles hierarchical component relationships, validation, and management
 */
class ComponentNestingManager {
    constructor() {
        this.maxDepth = 10;
        this.nestingRules = new Map();
        this.componentTree = new Map();
        this.eventBus = null;
        
        this.initializeDefaultRules();
    }

    /**
     * Initialize default nesting rules
     */
    initializeDefaultRules() {
        // Container component rules
        this.addNestingRule({
            id: 'section-rule',
            parentType: 'container',
            parentComponent: 'section',
            allowedChildren: ['container', 'layout', 'content', 'navigation'],
            maxChildren: 20,
            minChildren: 0,
            description: 'Section containers can hold multiple child components'
        });

        this.addNestingRule({
            id: 'grid-rule',
            parentType: 'container',
            parentComponent: 'grid',
            allowedChildren: ['content', 'layout'],
            maxChildren: 12,
            minChildren: 1,
            description: 'Grid containers optimized for content layout'
        });

        this.addNestingRule({
            id: 'flex-row-rule',
            parentType: 'container',
            parentComponent: 'flex-row',
            allowedChildren: ['content', 'layout', 'container'],
            maxChildren: 6,
            minChildren: 1,
            description: 'Flex row for horizontal layouts'
        });

        this.addNestingRule({
            id: 'flex-column-rule',
            parentType: 'container',
            parentComponent: 'flex-column',
            allowedChildren: ['content', 'layout', 'container'],
            maxChildren: 10,
            minChildren: 1,
            description: 'Flex column for vertical layouts'
        });

        // Semantic container rules
        this.addNestingRule({
            id: 'header-rule',
            parentType: 'layout',
            parentComponent: 'header',
            allowedChildren: ['navigation', 'content'],
            maxChildren: 5,
            minChildren: 1,
            description: 'Header semantic container'
        });

        this.addNestingRule({
            id: 'main-rule',
            parentType: 'layout',
            parentComponent: 'main',
            allowedChildren: ['container', 'content', 'layout'],
            maxChildren: 50,
            minChildren: 1,
            description: 'Main content area'
        });

        this.addNestingRule({
            id: 'footer-rule',
            parentType: 'layout',
            parentComponent: 'footer',
            allowedChildren: ['content', 'navigation'],
            maxChildren: 5,
            minChildren: 1,
            description: 'Footer semantic container'
        });

        // Content component rules (leaf nodes)
        this.addNestingRule({
            id: 'navigation-rule',
            parentType: 'navigation',
            parentComponent: 'top-navigation',
            allowedChildren: [],
            maxChildren: 0,
            minChildren: 0,
            description: 'Navigation components are leaf nodes'
        });
    }

    /**
     * Set event bus for communication
     */
    setEventBus(eventBus) {
        this.eventBus = eventBus;
    }

    /**
     * Add a nesting rule
     */
    addNestingRule(rule) {
        this.nestingRules.set(rule.id, rule);
        this.emitEvent('nesting:rule:added', { rule });
    }

    /**
     * Remove a nesting rule
     */
    removeNestingRule(ruleId) {
        const rule = this.nestingRules.get(ruleId);
        if (rule) {
            this.nestingRules.delete(ruleId);
            this.emitEvent('nesting:rule:removed', { ruleId, rule });
        }
    }

    /**
     * Get nesting rules for a component
     */
    getNestingRules(componentType, componentName) {
        return Array.from(this.nestingRules.values()).filter(rule => 
            rule.parentType === componentType && 
            (rule.parentComponent === componentName || !rule.parentComponent)
        );
    }

    /**
     * Check if a component can be nested in a parent
     */
    canNest(parentId, childType, childComponent) {
        try {
            const parent = this.componentTree.get(parentId);
            if (!parent) {
                return {
                    allowed: false,
                    reason: 'Parent component not found',
                    code: 'PARENT_NOT_FOUND'
                };
            }

            // Check depth limit
            const depth = this.getComponentDepth(parentId);
            if (depth >= this.maxDepth) {
                return {
                    allowed: false,
                    reason: `Maximum nesting depth (${this.maxDepth}) exceeded`,
                    code: 'MAX_DEPTH_EXCEEDED'
                };
            }

            // Get nesting rules for parent
            const rules = this.getNestingRules(parent.type, parent.component);
            if (rules.length === 0) {
                return {
                    allowed: false,
                    reason: 'No nesting rules defined for parent component',
                    code: 'NO_RULES_DEFINED'
                };
            }

            // Check against each rule
            for (const rule of rules) {
                const result = this.validateAgainstRule(parent, childType, childComponent, rule);
                if (!result.allowed) {
                    return result;
                }
            }

            return {
                allowed: true,
                reason: 'Component can be nested',
                code: 'NESTING_ALLOWED'
            };

        } catch (error) {
            console.error('Error checking nesting capability:', error);
            return {
                allowed: false,
                reason: 'Internal error during nesting validation',
                code: 'INTERNAL_ERROR'
            };
        }
    }

    /**
     * Validate against a specific nesting rule
     */
    validateAgainstRule(parent, childType, childComponent, rule) {
        // Check if child type is allowed
        if (!rule.allowedChildren.includes(childType)) {
            return {
                allowed: false,
                reason: `Component type '${childType}' not allowed in '${parent.component}'`,
                code: 'TYPE_NOT_ALLOWED'
            };
        }

        // Check maximum children limit
        if (rule.maxChildren && parent.children.length >= rule.maxChildren) {
            return {
                allowed: false,
                reason: `Maximum children limit (${rule.maxChildren}) reached for '${parent.component}'`,
                code: 'MAX_CHILDREN_EXCEEDED'
            };
        }

        // Check conditional rules if any
        if (rule.conditionalRules) {
            for (const conditionalRule of rule.conditionalRules) {
                const conditionResult = this.evaluateCondition(parent, conditionalRule.condition);
                if (conditionResult && !conditionalRule.allowedChildren.includes(childType)) {
                    return {
                        allowed: false,
                        reason: `Conditional rule prevents '${childType}' in current context`,
                        code: 'CONDITIONAL_RULE_VIOLATION'
                    };
                }
            }
        }

        return {
            allowed: true,
            reason: 'Rule validation passed',
            code: 'RULE_VALIDATION_PASSED'
        };
    }

    /**
     * Add component to the tree
     */
    addComponent(componentData, parentId = null) {
        const component = {
            id: componentData.id || this.generateId(),
            type: componentData.type,
            component: componentData.component,
            category: componentData.category,
            subcategory: componentData.subcategory,
            parentId: parentId,
            children: [],
            depth: parentId ? this.getComponentDepth(parentId) + 1 : 0,
            props: componentData.props || {},
            state: {
                isVisible: true,
                isSelected: false,
                isDragging: false,
                hasError: false
            },
            metadata: {
                created: Date.now(),
                updated: Date.now()
            }
        };

        // Validate nesting if parent exists
        if (parentId) {
            const nestingResult = this.canNest(parentId, component.type, component.component);
            if (!nestingResult.allowed) {
                throw new Error(`Nesting validation failed: ${nestingResult.reason}`);
            }

            // Add to parent's children
            const parent = this.componentTree.get(parentId);
            if (parent) {
                parent.children.push(component.id);
                parent.metadata.updated = Date.now();
            }
        }

        this.componentTree.set(component.id, component);
        this.emitEvent('component:added', { component, parentId });

        return component;
    }

    /**
     * Remove component from tree
     */
    removeComponent(componentId) {
        const component = this.componentTree.get(componentId);
        if (!component) {
            throw new Error(`Component ${componentId} not found`);
        }

        // Remove from parent's children
        if (component.parentId) {
            const parent = this.componentTree.get(component.parentId);
            if (parent) {
                parent.children = parent.children.filter(id => id !== componentId);
                parent.metadata.updated = Date.now();
            }
        }

        // Remove all children recursively
        const childrenToRemove = [...component.children];
        for (const childId of childrenToRemove) {
            this.removeComponent(childId);
        }

        this.componentTree.delete(componentId);
        this.emitEvent('component:removed', { componentId, component });
    }

    /**
     * Move component to new parent
     */
    moveComponent(componentId, newParentId, index = -1) {
        const component = this.componentTree.get(componentId);
        if (!component) {
            throw new Error(`Component ${componentId} not found`);
        }

        const oldParentId = component.parentId;

        // Validate nesting in new parent
        if (newParentId) {
            const nestingResult = this.canNest(newParentId, component.type, component.component);
            if (!nestingResult.allowed) {
                throw new Error(`Cannot move component: ${nestingResult.reason}`);
            }
        }

        // Remove from old parent
        if (oldParentId) {
            const oldParent = this.componentTree.get(oldParentId);
            if (oldParent) {
                oldParent.children = oldParent.children.filter(id => id !== componentId);
                oldParent.metadata.updated = Date.now();
            }
        }

        // Add to new parent
        component.parentId = newParentId;
        component.depth = newParentId ? this.getComponentDepth(newParentId) + 1 : 0;
        component.metadata.updated = Date.now();

        if (newParentId) {
            const newParent = this.componentTree.get(newParentId);
            if (newParent) {
                if (index >= 0 && index <= newParent.children.length) {
                    newParent.children.splice(index, 0, componentId);
                } else {
                    newParent.children.push(componentId);
                }
                newParent.metadata.updated = Date.now();
            }
        }

        // Update depth for all descendants
        this.updateComponentDepths(componentId);

        this.emitEvent('component:moved', {
            componentId,
            oldParentId,
            newParentId,
            index
        });
    }

    /**
     * Update component depths recursively
     */
    updateComponentDepths(componentId) {
        const component = this.componentTree.get(componentId);
        if (!component) return;

        const newDepth = component.parentId ? this.getComponentDepth(component.parentId) + 1 : 0;
        component.depth = newDepth;

        // Update children recursively
        for (const childId of component.children) {
            this.updateComponentDepths(childId);
        }
    }

    /**
     * Get component depth in the tree
     */
    getComponentDepth(componentId) {
        const component = this.componentTree.get(componentId);
        if (!component) return -1;

        return component.depth;
    }

    /**
     * Get component path from root
     */
    getComponentPath(componentId) {
        const path = [];
        let current = this.componentTree.get(componentId);

        while (current) {
            path.unshift({
                id: current.id,
                component: current.component,
                type: current.type
            });
            current = current.parentId ? this.componentTree.get(current.parentId) : null;
        }

        return path;
    }

    /**
     * Find common ancestor of two components
     */
    findCommonAncestor(componentId1, componentId2) {
        const path1 = this.getComponentPath(componentId1).map(item => item.id);
        const path2 = this.getComponentPath(componentId2).map(item => item.id);

        let commonAncestor = null;
        const minLength = Math.min(path1.length, path2.length);

        for (let i = 0; i < minLength; i++) {
            if (path1[i] === path2[i]) {
                commonAncestor = path1[i];
            } else {
                break;
            }
        }

        return commonAncestor;
    }

    /**
     * Get component tree structure
     */
    getTreeStructure(rootId = null) {
        const components = Array.from(this.componentTree.values());
        const roots = rootId ? 
            components.filter(comp => comp.id === rootId) :
            components.filter(comp => comp.parentId === null);

        return roots.map(root => this.buildTreeNode(root));
    }

    /**
     * Build tree node with children
     */
    buildTreeNode(component) {
        const node = {
            ...component,
            children: component.children
                .map(childId => this.componentTree.get(childId))
                .filter(child => child)
                .map(child => this.buildTreeNode(child))
        };

        return node;
    }

    /**
     * Validate entire component tree
     */
    validateTree() {
        const errors = [];
        const warnings = [];

        for (const [componentId, component] of this.componentTree) {
            // Check depth limits
            if (component.depth > this.maxDepth) {
                errors.push({
                    type: 'nesting',
                    componentId,
                    message: `Component exceeds maximum depth (${this.maxDepth})`,
                    severity: 'error'
                });
            }

            // Check nesting rules
            if (component.parentId) {
                const nestingResult = this.canNest(component.parentId, component.type, component.component);
                if (!nestingResult.allowed) {
                    errors.push({
                        type: 'nesting',
                        componentId,
                        message: `Nesting rule violation: ${nestingResult.reason}`,
                        severity: 'error'
                    });
                }
            }

            // Check for orphaned children
            for (const childId of component.children) {
                if (!this.componentTree.has(childId)) {
                    errors.push({
                        type: 'children',
                        componentId,
                        message: `Child component ${childId} not found`,
                        severity: 'error'
                    });
                }
            }

            // Performance warnings
            if (component.children.length > 20) {
                warnings.push({
                    type: 'performance',
                    componentId,
                    message: `Component has many children (${component.children.length}), consider restructuring`,
                    severity: 'warning'
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Evaluate condition for conditional rules
     */
    evaluateCondition(component, condition) {
        // Simple condition evaluation - can be extended
        try {
            // Example conditions:
            // "children.length > 5"
            // "props.layout === 'grid'"
            // "depth > 3"
            
            const context = {
                children: component.children,
                props: component.props,
                depth: component.depth,
                type: component.type
            };

            // Basic evaluation - in production, use a proper expression parser
            return new Function('context', `with(context) { return ${condition}; }`)(context);
        } catch (error) {
            console.warn('Error evaluating condition:', condition, error);
            return false;
        }
    }

    /**
     * Generate unique component ID
     */
    generateId() {
        return `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Emit event through event bus
     */
    emitEvent(type, data) {
        if (this.eventBus) {
            this.eventBus.emit({
                type,
                source: 'nesting-manager',
                data,
                timestamp: Date.now(),
                propagate: true
            });
        }
    }

    /**
     * Get statistics about the component tree
     */
    getTreeStatistics() {
        const components = Array.from(this.componentTree.values());
        
        return {
            totalComponents: components.length,
            maxDepth: Math.max(...components.map(c => c.depth), 0),
            avgDepth: components.length > 0 ? 
                components.reduce((sum, c) => sum + c.depth, 0) / components.length : 0,
            componentsByType: components.reduce((acc, c) => {
                acc[c.type] = (acc[c.type] || 0) + 1;
                return acc;
            }, {}),
            rootComponents: components.filter(c => c.parentId === null).length,
            leafComponents: components.filter(c => c.children.length === 0).length
        };
    }

    /**
     * Export tree structure for persistence
     */
    exportTree() {
        return {
            components: Array.from(this.componentTree.entries()),
            rules: Array.from(this.nestingRules.entries()),
            maxDepth: this.maxDepth,
            statistics: this.getTreeStatistics(),
            exported: Date.now()
        };
    }

    /**
     * Import tree structure
     */
    importTree(treeData) {
        this.componentTree.clear();
        this.nestingRules.clear();

        // Import components
        for (const [id, component] of treeData.components) {
            this.componentTree.set(id, component);
        }

        // Import rules
        for (const [id, rule] of treeData.rules) {
            this.nestingRules.set(id, rule);
        }

        this.maxDepth = treeData.maxDepth || 10;

        this.emitEvent('tree:imported', { treeData });
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ComponentNestingManager = ComponentNestingManager;
}

export default ComponentNestingManager;