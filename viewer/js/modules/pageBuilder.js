/**
 * Page Builder Main Module
 * Manages the overall page builder functionality
 */
class PageBuilder {
    constructor() {
        this.currentPage = null;
        this.pageStructure = {
            type: 'page',
            children: []
        };
        this.selectedElement = null;
        this.dragDrop = null;
        this.canvas = null;
        this.palette = null;
        this.properties = null;
    }

    /**
     * Initialize the page builder
     */
    init() {
        console.log('Initializing Page Builder...');
        
        this.canvas = document.getElementById('page-canvas');
        this.palette = document.querySelector('.component-palette');
        
        // Initialize drag and drop
        this.dragDrop = new DragDrop(this);
        this.dragDrop.init();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Load existing page if editing
        this.loadExistingPage();
        
        console.log('Page Builder initialized successfully');
    }

    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('component-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterComponents(e.target.value);
            });
        }

        // Page name input
        const pageNameInput = document.getElementById('page-name');
        if (pageNameInput) {
            pageNameInput.addEventListener('blur', (e) => {
                this.updatePageName(e.target.value);
            });
        }

        // Canvas click handler for selection
        this.canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * Filter components based on search query
     */
    filterComponents(query) {
        const componentItems = document.querySelectorAll('.component-item');
        const lowerQuery = query.toLowerCase();

        componentItems.forEach(item => {
            const name = item.querySelector('p').textContent.toLowerCase();
            const category = item.getAttribute('data-category');
            const subcategory = item.getAttribute('data-subcategory');
            
            const searchText = `${name} ${category} ${subcategory}`.toLowerCase();
            
            if (searchText.includes(lowerQuery)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }

    /**
     * Handle canvas clicks for element selection
     */
    handleCanvasClick(e) {
        // Find the closest component or container
        const clickedElement = e.target.closest('[data-component], [data-container]');
        
        if (clickedElement) {
            this.selectElement(clickedElement);
            e.stopPropagation();
        } else {
            this.deselectElement();
        }
    }

    /**
     * Select an element on the canvas
     */
    selectElement(element) {
        // Remove previous selection
        this.deselectElement();
        
        // Add selection styling
        element.classList.add('selected-element');
        element.style.outline = '2px solid #3b82f6';
        element.style.outlineOffset = '2px';
        
        this.selectedElement = element;
        
        // Show properties panel (to be implemented)
        this.showPropertiesPanel(element);
    }

    /**
     * Deselect current element
     */
    deselectElement() {
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected-element');
            this.selectedElement.style.outline = '';
            this.selectedElement.style.outlineOffset = '';
            this.selectedElement = null;
        }
        
        // Hide properties panel
        this.hidePropertiesPanel();
    }

    /**
     * Show properties panel for selected element
     */
    showPropertiesPanel(element, componentData) {
        const panel = document.getElementById('properties-panel');
        const content = document.getElementById('properties-content');
        
        if (!componentData) {
            componentData = {
                component: element.getAttribute('data-component'),
                category: element.getAttribute('data-category'),
                subcategory: element.getAttribute('data-subcategory'),
                type: element.getAttribute('data-component-type')
            };
        }
        
        // Show panel
        panel.classList.remove('hidden');
        
        // Build properties form
        content.innerHTML = `
            <div class="space-y-4">
                <div>
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">${componentData.component}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${componentData.category}/${componentData.subcategory}</p>
                </div>
                
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Component ID</label>
                        <input type="text" value="${element.id || ''}" placeholder="Optional ID"
                               class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                               onchange="this.closest('[data-component]').id = this.value">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CSS Classes</label>
                        <input type="text" value="${element.className.replace('component-wrapper relative group', '').trim()}" placeholder="Additional CSS classes"
                               class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                               onchange="this.closest('[data-component]').className = 'component-wrapper relative group ' + this.value">
                    </div>
                    
                    ${componentData.type === 'container' ? this.buildContainerProperties(componentData) : ''}
                </div>
                
                <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onclick="window.pageBuilder.deleteComponent(this)"
                            class="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm">
                        Delete Component
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Build container-specific properties
     */
    buildContainerProperties(componentData) {
        switch(componentData.component) {
            case 'grid':
                return `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Columns</label>
                        <select class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                            <option value="1">1 Column</option>
                            <option value="2">2 Columns</option>
                            <option value="3" selected>3 Columns</option>
                            <option value="4">4 Columns</option>
                            <option value="5">5 Columns</option>
                            <option value="6">6 Columns</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gap</label>
                        <select class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                            <option value="2">Small (0.5rem)</option>
                            <option value="4">Medium (1rem)</option>
                            <option value="6" selected>Large (1.5rem)</option>
                            <option value="8">Extra Large (2rem)</option>
                        </select>
                    </div>
                `;
            case 'section':
                return `
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Padding</label>
                        <select class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                            <option value="none">None</option>
                            <option value="sm">Small</option>
                            <option value="md" selected>Medium</option>
                            <option value="lg">Large</option>
                            <option value="xl">Extra Large</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background</label>
                        <select class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                            <option value="transparent" selected>Transparent</option>
                            <option value="white">White</option>
                            <option value="gray-50">Light Gray</option>
                            <option value="gray-900">Dark Gray</option>
                        </select>
                    </div>
                `;
            default:
                return '';
        }
    }

    /**
     * Hide properties panel
     */
    hidePropertiesPanel() {
        const panel = document.getElementById('properties-panel');
        panel.classList.add('hidden');
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Delete selected element
        if (e.key === 'Delete' && this.selectedElement) {
            this.deleteSelectedElement();
        }
        
        // Undo/Redo (Ctrl+Z, Ctrl+Y)
        if (e.ctrlKey) {
            if (e.key === 'z' && !e.shiftKey) {
                this.undo();
                e.preventDefault();
            } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                this.redo();
                e.preventDefault();
            }
        }
        
        // Save (Ctrl+S)
        if (e.ctrlKey && e.key === 's') {
            this.savePage();
            e.preventDefault();
        }
    }

    /**
     * Delete selected element
     */
    deleteSelectedElement() {
        if (this.selectedElement) {
            // Show placeholder if parent becomes empty
            const parent = this.selectedElement.parentElement;
            this.selectedElement.remove();
            this.selectedElement = null;
            
            // Check if parent needs placeholder
            this.checkForPlaceholder(parent);
            
            // Update page structure
            this.updatePageStructure();
        }
    }

    /**
     * Check if container needs placeholder
     */
    checkForPlaceholder(container) {
        if (container && container.hasAttribute('data-drop-zone')) {
            const hasComponents = container.querySelector('[data-component], [data-container]');
            if (!hasComponents) {
                this.addPlaceholder(container);
            }
        }
    }

    /**
     * Add placeholder to empty container
     */
    addPlaceholder(container) {
        const placeholder = document.createElement('div');
        placeholder.className = 'min-h-[100px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400';
        placeholder.setAttribute('data-placeholder', 'true');
        
        placeholder.innerHTML = `
            <div class="text-center">
                <svg class="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <p class="text-sm">Drop components here</p>
            </div>
        `;
        
        container.appendChild(placeholder);
    }

    /**
     * Update page name
     */
    updatePageName(name) {
        if (this.currentPage) {
            this.currentPage.name = name;
        }
    }

    /**
     * Load existing page for editing
     */
    loadExistingPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const pageId = urlParams.get('page');
        
        if (pageId) {
            // TODO: Load page data from server
            console.log('Loading page:', pageId);
        }
    }

    /**
     * Update page structure from DOM
     */
    updatePageStructure() {
        // TODO: Traverse DOM and build structure object
        console.log('Updating page structure');
    }

    /**
     * Save page
     */
    savePage() {
        console.log('Saving page...');
        
        // Update structure from current DOM
        this.updatePageStructure();
        
        // Prepare page data
        const pageData = {
            id: this.currentPage?.id || this.generatePageId(),
            name: document.getElementById('page-name').value || 'Untitled Page',
            description: '',
            category: 'landing-pages',
            structure: this.pageStructure,
            created: this.currentPage?.created || new Date().toISOString().split('T')[0],
            updated: new Date().toISOString().split('T')[0]
        };
        
        // TODO: Send to server
        console.log('Page data to save:', pageData);
        
        // Show success message
        this.showNotification('Page saved successfully!', 'success');
    }

    /**
     * Generate unique page ID
     */
    generatePageId() {
        return 'page-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Preview page
     */
    previewPage() {
        // TODO: Open preview in new window
        console.log('Opening page preview...');
    }

    /**
     * Undo last action
     */
    undo() {
        // TODO: Implement undo functionality
        console.log('Undo action');
    }

    /**
     * Redo last undone action
     */
    redo() {
        // TODO: Implement redo functionality
        console.log('Redo action');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // TODO: Implement notification system
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    /**
     * Add component to canvas
     */
    addComponent(componentData, targetContainer) {
        console.log('Adding component:', componentData);
        
        // Remove placeholder if exists
        const placeholder = targetContainer.querySelector('[data-placeholder="true"]');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Create component element
        const componentElement = this.createComponentElement(componentData);
        
        // Add to container
        targetContainer.appendChild(componentElement);
        
        // Make the component draggable within the canvas
        this.makeComponentDraggable(componentElement);
        
        // Update page structure
        this.updatePageStructure();
        
        return componentElement;
    }

    /**
     * Make component draggable within canvas for reordering
     */
    makeComponentDraggable(element) {
        element.draggable = true;
        element.style.cursor = 'move';
        
        // Add visual indicators
        element.addEventListener('mouseenter', () => {
            if (!element.classList.contains('dragging')) {
                element.style.outline = '2px dashed #3b82f6';
                element.style.outlineOffset = '2px';
            }
        });
        
        element.addEventListener('mouseleave', () => {
            if (!element.classList.contains('selected-element')) {
                element.style.outline = '';
                element.style.outlineOffset = '';
            }
        });
        
        // Drag events are handled by the dragDrop module
        // Just mark it as draggable and let dragDrop handle the events
        
        // Add component controls for reordering
        this.addComponentControls(element);
    }

    /**
     * Create component element from data
     */
    createComponentElement(componentData) {
        const element = document.createElement('div');
        element.className = 'component-wrapper relative group';
        element.setAttribute('data-component', componentData.component);
        element.setAttribute('data-category', componentData.category);
        element.setAttribute('data-subcategory', componentData.subcategory);
        element.setAttribute('data-component-type', componentData.type || 'component');
        
        // Add container attributes if it's a container
        if (componentData.type === 'container') {
            element.setAttribute('data-container', componentData.component);
            element.setAttribute('data-drop-zone', 'true');
        }
        
        // Add loading state
        element.innerHTML = `
            <div class="component-loading border-2 border-dashed border-blue-300 rounded-lg p-4 m-2 bg-blue-50 dark:bg-blue-900/20">
                <div class="text-center text-blue-600 dark:text-blue-400">
                    <div class="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <h3 class="font-medium">${componentData.component}</h3>
                    <p class="text-sm">${componentData.category}/${componentData.subcategory}</p>
                    <p class="text-xs mt-1">Loading...</p>
                </div>
            </div>
        `;
        
        // Load actual component HTML
        this.loadComponentHTML(componentData, element);
        
        return element;
    }

    /**
     * Load component HTML from server
     */
    async loadComponentHTML(componentData, element) {
        try {
            const response = await fetch(`api/component-data.php?category=${componentData.category}&subcategory=${componentData.subcategory}&component=${componentData.component}`);
            const data = await response.json();
            
            if (data.html) {
                // Replace loading content with actual component
                element.innerHTML = data.html;
                element.className = 'component-wrapper relative group';
                
                // Add hover controls
                this.addComponentControls(element, componentData);
                
                // If it's a container and it's empty, add placeholder
                if (componentData.type === 'container') {
                    const hasContent = element.querySelector('[data-component], [data-container]');
                    if (!hasContent) {
                        this.addPlaceholder(element);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load component:', error);
            element.innerHTML = `
                <div class="text-center text-red-600 dark:text-red-400 p-4 border border-red-300 dark:border-red-700 rounded-lg">
                    <svg class="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="font-medium">Failed to load component</p>
                    <p class="text-sm">${componentData.component}</p>
                    <button onclick="this.parentElement.parentElement.remove()" class="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded">Remove</button>
                </div>
            `;
        }
    }

    /**
     * Add component controls for hover interactions
     */
    addComponentControls(element, componentData) {
        // Remove existing controls
        const existingControls = element.querySelector('.component-controls');
        if (existingControls) {
            existingControls.remove();
        }
        
        // Create control overlay
        const controls = document.createElement('div');
        controls.className = 'component-controls absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-bl-lg shadow-lg flex z-10';
        controls.innerHTML = `
            <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400" title="Move Up" onclick="window.moveComponentUp(this.closest('[data-component], [data-container]'))">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                </svg>
            </button>
            <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400" title="Move Down" onclick="window.moveComponentDown(this.closest('[data-component], [data-container]'))">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400" title="Edit Properties" onclick="window.pageBuilder.editComponent(this)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
            </button>
            <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400" title="Delete" onclick="window.pageBuilder.deleteComponent(this)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        `;
        
        element.appendChild(controls);
        element.style.position = 'relative';
    }

    /**
     * Edit component properties
     */
    editComponent(button) {
        const component = button.closest('[data-component]');
        const componentData = {
            component: component.getAttribute('data-component'),
            category: component.getAttribute('data-category'),
            subcategory: component.getAttribute('data-subcategory'),
            type: component.getAttribute('data-component-type')
        };
        
        this.showPropertiesPanel(component, componentData);
    }

    /**
     * Delete component
     */
    deleteComponent(button) {
        const component = button.closest('[data-component]');
        const parent = component.parentElement;
        
        component.remove();
        
        // Check if parent needs placeholder
        this.checkForPlaceholder(parent);
        
        // Update page structure
        this.updatePageStructure();
    }

    /**
     * Get page structure for saving
     */
    getPageStructure() {
        const canvas = this.canvas;
        return this.buildStructureFromElement(canvas);
    }

    /**
     * Build structure object from DOM element
     */
    buildStructureFromElement(element) {
        const structure = {
            type: 'page',
            children: []
        };

        // Get all direct children that are components or containers
        const children = Array.from(element.children).filter(child =>
            child.hasAttribute('data-component') || child.hasAttribute('data-container')
        );

        children.forEach(child => {
            const itemStructure = {
                type: child.hasAttribute('data-container') ? 'container' : 'component',
                component: child.getAttribute('data-component') || child.getAttribute('data-container'),
                category: child.getAttribute('data-category'),
                subcategory: child.getAttribute('data-subcategory'),
                id: child.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };

            // If it's a container, recursively get children
            if (child.hasAttribute('data-container')) {
                itemStructure.children = [];
                const containerChildren = Array.from(child.children).filter(grandchild =>
                    grandchild.hasAttribute('data-component') || grandchild.hasAttribute('data-container')
                );
                
                containerChildren.forEach(grandchild => {
                    const childStructure = this.buildStructureFromElement(grandchild);
                    if (childStructure.children && childStructure.children.length > 0) {
                        itemStructure.children.push(...childStructure.children);
                    } else {
                        itemStructure.children.push({
                            type: grandchild.hasAttribute('data-container') ? 'container' : 'component',
                            component: grandchild.getAttribute('data-component') || grandchild.getAttribute('data-container'),
                            category: grandchild.getAttribute('data-category'),
                            subcategory: grandchild.getAttribute('data-subcategory'),
                            id: grandchild.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                        });
                    }
                });
            }

            structure.children.push(itemStructure);
        });

        return structure;
    }

    /**
     * Generate HTML from current page structure
     */
    generateHTML() {
        const structure = this.getPageStructure();
        return this.renderStructureToHTML(structure);
    }

    /**
     * Render structure to HTML string
     */
    renderStructureToHTML(structure) {
        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Builder Generated Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
`;

        if (structure.children && structure.children.length > 0) {
            structure.children.forEach(child => {
                html += this.renderComponentToHTML(child);
            });
        } else {
            html += `    <!-- Empty page - no components added yet -->
    <div class="min-h-screen flex items-center justify-center">
        <div class="text-center text-gray-500">
            <h1 class="text-2xl font-bold mb-4">Page Builder Generated Page</h1>
            <p>This page was created with the Page Builder but has no components yet.</p>
        </div>
    </div>
`;
        }

        html += `
</body>
</html>`;

        return html;
    }

    /**
     * Render individual component to HTML
     */
    renderComponentToHTML(componentStructure) {
        // Get the actual component HTML from the canvas
        const existingElement = document.querySelector(`[data-component="${componentStructure.component}"], [data-container="${componentStructure.component}"]`);
        
        if (existingElement) {
            // Clone the element and clean it up for export
            const clone = existingElement.cloneNode(true);
            
            // Remove page builder specific attributes and controls
            this.cleanElementForExport(clone);
            
            return clone.outerHTML + '\n';
        }

        // Fallback: generate basic HTML structure
        return `<!-- Component: ${componentStructure.component} (${componentStructure.category}/${componentStructure.subcategory}) -->\n<div class="component-placeholder">\n    <p>Component: ${componentStructure.component}</p>\n</div>\n`;
    }

    /**
     * Clean element for HTML export
     */
    cleanElementForExport(element) {
        // Remove page builder controls
        const controls = element.querySelector('.component-controls');
        if (controls) {
            controls.remove();
        }

        // Remove page builder specific attributes
        element.removeAttribute('draggable');
        element.removeAttribute('data-drop-zone');
        element.style.outline = '';
        element.style.outlineOffset = '';
        element.style.cursor = '';

        // Clean all child elements recursively
        const children = element.children;
        for (let i = 0; i < children.length; i++) {
            this.cleanElementForExport(children[i]);
        }
    }
}

// Global functions for toolbar buttons
function togglePalette() {
    const palette = document.querySelector('.component-palette').parentElement;
    palette.classList.toggle('hidden');
}

function previewPage() {
    if (window.pageBuilder) {
        window.pageBuilder.previewPage();
    }
}

function savePage() {
    if (window.pageBuilder) {
        window.pageBuilder.savePage();
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.PageBuilder = PageBuilder;
}