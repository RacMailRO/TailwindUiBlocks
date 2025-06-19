/**
 * TypeScript interfaces for the TailwindUI Blocks Page Builder
 * Component Nesting and Communication System
 */

// Core component types
export type ComponentType = 'container' | 'layout' | 'content' | 'form' | 'navigation' | 'display';

export interface ComponentMetadata {
    id: string;
    name: string;
    type: ComponentType;
    category: string;
    subcategory: string;
    description: string;
    version: string;
    author: string;
    tags: string[];
    isContainer: boolean;
    allowsChildren: boolean;
    maxChildren?: number;
    allowedChildTypes?: ComponentType[];
    requiredParentTypes?: ComponentType[];
    breakpoints?: ResponsiveBreakpoint[];
}

export interface ResponsiveBreakpoint {
    name: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    minWidth: number;
    classes: string[];
}

// Component nesting system
export interface ComponentNesting {
    parentId: string | null;
    childIds: string[];
    depth: number;
    maxDepth: number;
    allowedChildTypes: ComponentType[];
    nestingRules: NestingRule[];
}

export interface NestingRule {
    parentType: ComponentType;
    allowedChildren: ComponentType[];
    maxChildren?: number;
    minChildren?: number;
    requiredChildren?: ComponentType[];
    conditionalRules?: ConditionalNestingRule[];
}

export interface ConditionalNestingRule {
    condition: string;
    allowedChildren: ComponentType[];
    requiredProps?: Record<string, any>;
}

// Component state management
export interface ComponentState {
    id: string;
    type: ComponentType;
    props: Record<string, any>;
    children: ComponentState[];
    parent: string | null;
    isVisible: boolean;
    isSelected: boolean;
    isDragging: boolean;
    hasError: boolean;
    errorMessage?: string;
    lastModified: number;
}

export interface ComponentContext {
    id: string;
    parentContext?: ComponentContext;
    childContexts: ComponentContext[];
    state: ComponentState;
    eventBus: ComponentEventBus;
    stateManager: ComponentStateManager;
    nestingManager: ComponentNestingManager;
}

// Event system
export interface ComponentEvent {
    type: ComponentEventType;
    source: string;
    target?: string;
    data?: any;
    timestamp: number;
    propagate: boolean;
}

export type ComponentEventType = 
    | 'component:added'
    | 'component:removed'
    | 'component:moved'
    | 'component:selected'
    | 'component:deselected'
    | 'component:props:changed'
    | 'component:state:changed'
    | 'component:error'
    | 'component:validated'
    | 'nesting:changed'
    | 'nesting:validated'
    | 'nesting:error'
    | 'drag:start'
    | 'drag:end'
    | 'drop:success'
    | 'drop:error';

export interface ComponentEventBus {
    emit(event: ComponentEvent): void;
    on(type: ComponentEventType, handler: (event: ComponentEvent) => void): void;
    off(type: ComponentEventType, handler: (event: ComponentEvent) => void): void;
    once(type: ComponentEventType, handler: (event: ComponentEvent) => void): void;
}

// State management
export interface ComponentStateManager {
    getState(componentId: string): ComponentState | null;
    setState(componentId: string, state: Partial<ComponentState>): void;
    getFullTree(): ComponentState[];
    updateProps(componentId: string, props: Record<string, any>): void;
    addChild(parentId: string, childState: ComponentState): void;
    removeChild(parentId: string, childId: string): void;
    moveComponent(componentId: string, newParentId: string, index?: number): void;
    validateState(componentId: string): ValidationResult;
    getHistory(): StateHistoryEntry[];
    undo(): boolean;
    redo(): boolean;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    type: 'nesting' | 'props' | 'children' | 'parent';
    message: string;
    componentId: string;
    severity: 'error' | 'warning';
}

export interface ValidationWarning {
    type: 'performance' | 'accessibility' | 'best-practice';
    message: string;
    componentId: string;
    suggestion?: string;
}

export interface StateHistoryEntry {
    timestamp: number;
    action: string;
    previousState: ComponentState[];
    newState: ComponentState[];
    componentId: string;
}

// Nesting management
export interface ComponentNestingManager {
    canNest(parentId: string, childType: ComponentType): boolean;
    validateNesting(parentId: string, childId: string): ValidationResult;
    getMaxDepth(): number;
    setMaxDepth(depth: number): void;
    getNestingRules(): NestingRule[];
    addNestingRule(rule: NestingRule): void;
    removeNestingRule(ruleId: string): void;
    getComponentDepth(componentId: string): number;
    getComponentPath(componentId: string): string[];
    findCommonAncestor(componentId1: string, componentId2: string): string | null;
}

// Performance monitoring
export interface PerformanceMetrics {
    renderTime: number;
    componentCount: number;
    nestingDepth: number;
    memoryUsage: number;
    eventCount: number;
    lastUpdate: number;
}

export interface PerformanceMonitor {
    startMeasurement(operation: string): string;
    endMeasurement(measurementId: string): number;
    getMetrics(): PerformanceMetrics;
    setPerformanceThresholds(thresholds: PerformanceThresholds): void;
    onPerformanceIssue(handler: (issue: PerformanceIssue) => void): void;
}

export interface PerformanceThresholds {
    maxRenderTime: number;
    maxComponentCount: number;
    maxNestingDepth: number;
    maxMemoryUsage: number;
}

export interface PerformanceIssue {
    type: 'render-slow' | 'memory-high' | 'nesting-deep' | 'event-overflow';
    message: string;
    severity: 'warning' | 'error' | 'critical';
    metrics: PerformanceMetrics;
    suggestions: string[];
}

// Error boundaries
export interface ComponentErrorBoundary {
    componentId: string;
    hasError: boolean;
    errorInfo?: ErrorInfo;
    fallbackComponent?: string;
    onError(error: Error, errorInfo: ErrorInfo): void;
    reset(): void;
}

export interface ErrorInfo {
    componentStack: string;
    errorBoundary: string;
    errorBoundaryStack: string;
    timestamp: number;
}

// Template system
export interface ComponentTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    structure: ComponentState[];
    metadata: TemplateMetadata;
    preview?: string;
}

export interface TemplateMetadata {
    author: string;
    version: string;
    created: string;
    updated: string;
    complexity: 'simple' | 'moderate' | 'complex';
    useCase: string[];
    requirements: ComponentType[];
}

// Page structure
export interface PageStructure {
    id: string;
    name: string;
    description?: string;
    structure: ComponentState[];
    metadata: PageMetadata;
    performance: PerformanceMetrics;
}

export interface PageMetadata {
    created: string;
    updated: string;
    author: string;
    version: string;
    category: string;
    tags: string[];
    isTemplate: boolean;
    complexity: 'simple' | 'moderate' | 'complex';
}

// Advanced component types
export interface SmartContainerConfig {
    autoLayout: boolean;
    responsiveRules: ResponsiveRule[];
    adaptiveSpacing: boolean;
    childAlignment: 'start' | 'center' | 'end' | 'stretch';
    growthStrategy: 'fixed' | 'adaptive' | 'fill';
}

export interface ResponsiveRule {
    breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    layout: 'grid' | 'flex' | 'stack';
    columns?: number;
    spacing?: string;
    direction?: 'row' | 'column';
}

export interface ConditionalComponentConfig {
    conditions: ComponentCondition[];
    defaultVisible: boolean;
    animateTransitions: boolean;
    fallbackComponent?: string;
}

export interface ComponentCondition {
    type: 'viewport' | 'state' | 'data' | 'user';
    operator: 'equals' | 'not-equals' | 'greater' | 'less' | 'contains';
    value: any;
    target?: string;
}

export interface DynamicListConfig {
    itemTemplate: ComponentState;
    dataSource: string;
    maxItems?: number;
    pagination?: PaginationConfig;
    filtering?: FilterConfig;
    sorting?: SortConfig;
}

export interface PaginationConfig {
    enabled: boolean;
    itemsPerPage: number;
    showControls: boolean;
    position: 'top' | 'bottom' | 'both';
}

export interface FilterConfig {
    enabled: boolean;
    fields: string[];
    operators: string[];
    showUI: boolean;
}

export interface SortConfig {
    enabled: boolean;
    defaultField: string;
    defaultDirection: 'asc' | 'desc';
    allowMultiple: boolean;
}