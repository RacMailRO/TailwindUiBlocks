/**
 * Drag and Drop Module for Page Builder
 * Handles all drag and drop functionality for components and containers
 */
class DragDrop {
    constructor(pageBuilder) {
        this.pageBuilder = pageBuilder;
        this.draggedElement = null;
        this.draggedData = null;
        this.dropZones = [];
        this.dragOverlay = null;
        this.isProcessingDrop = false;
    }

    /**
     * Initialize drag and drop functionality
     */
    init() {
        console.log('Initializing Drag & Drop...');
        
        this.initDraggableComponents();
        this.initDropZones();
        this.createDragOverlay();
        this.setupCanvasDragEvents();
        
        console.log('Drag & Drop initialized');
    }

    /**
     * Initialize draggable components in the palette
     */
    initDraggableComponents() {
        const componentItems = document.querySelectorAll('.component-item[draggable="true"]');
        
        componentItems.forEach(item => {
            item.addEventListener('dragstart', (e) => this.handleDragStart(e));
            item.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });
    }

    /**
     * Initialize drop zones
     */
    initDropZones() {
        this.updateDropZones();
        
        // Add debounced observer to prevent infinite loops
        let observerTimeout;
        const observer = new MutationObserver(() => {
            // Skip updates during drag operations or processing
            if (this.draggedElement || this.isProcessingDrop) {
                return;
            }
            
            // Debounce updates to prevent rapid firing
            clearTimeout(observerTimeout);
            observerTimeout = setTimeout(() => {
                this.updateDropZones();
            }, 100);
        });
        
        observer.observe(this.pageBuilder.canvas, {
            childList: true,
            subtree: true,
            attributes: false, // Don't watch attribute changes
            characterData: false // Don't watch text changes
        });
        
        // Store observer for cleanup
        this.observer = observer;
    }

    /**
     * Set up drag events for canvas components
     */
    setupCanvasDragEvents() {
        // Use event delegation to handle drag events for dynamically added components
        document.addEventListener('dragstart', (e) => {
            // Check if the dragged element is a canvas component (not from palette)
            if (e.target.draggable && e.target.closest('#page-canvas') && !e.target.closest('.component-palette')) {
                this.handleDragStart(e);
            }
        });
        
        document.addEventListener('dragend', (e) => {
            // Check if the dragged element is a canvas component
            if (e.target.draggable && e.target.closest('#page-canvas') && !e.target.closest('.component-palette')) {
                this.handleDragEnd(e);
            }
        });
    }

    /**
     * Update drop zones when DOM changes
     */
    updateDropZones() {
        // Remove old event listeners
        this.dropZones.forEach(zone => {
            zone.removeEventListener('dragover', this.handleDragOver);
            zone.removeEventListener('dragenter', this.handleDragEnter);
            zone.removeEventListener('dragleave', this.handleDragLeave);
            zone.removeEventListener('drop', this.handleDrop);
        });
        
        // Find all drop zones
        this.dropZones = [
            this.pageBuilder.canvas,
            ...document.querySelectorAll('[data-drop-zone="true"]')
        ];
        
        // Add event listeners to drop zones
        this.dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => this.handleDragOver(e));
            zone.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            zone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            zone.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }

    /**
     * Handle drag start
     */
    handleDragStart(e) {
        this.draggedElement = e.target;
        
        // Check if this is a component being reordered or a new component from palette
        const isFromPalette = e.target.closest('.component-palette');
        const isExistingComponent = e.target.closest('[data-component]') && !isFromPalette;
        
        if (isExistingComponent) {
            // This is reordering an existing component
            this.draggedData = 'reorder';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', 'reorder');
        } else {
            // This is a new component from palette
            this.draggedData = {
                type: e.target.getAttribute('data-component-type'),
                component: e.target.getAttribute('data-component'),
                category: e.target.getAttribute('data-category'),
                subcategory: e.target.getAttribute('data-subcategory')
            };
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/plain', JSON.stringify(this.draggedData));
        }
        
        // Add dragging class
        e.target.classList.add('dragging');
        
        // Show drop zones
        this.showDropZones();
        
        // Show drag overlay
        this.showDragOverlay(e);
        
        console.log('Drag started:', this.draggedData);
    }

    /**
     * Handle drag end
     */
    handleDragEnd(e) {
        // Remove dragging class
        e.target.classList.remove('dragging');
        
        // Hide drop zones
        this.hideDropZones();
        
        // Hide drag overlay
        this.hideDragOverlay();
        
        // Remove position indicators
        this.removePositionIndicators();
        
        // Reset drag data
        this.draggedElement = null;
        this.draggedData = null;
        
        console.log('Drag ended');
    }

    /**
     * Handle drag over
     */
    handleDragOver(e) {
        e.preventDefault();
        
        const isReorderOperation = this.draggedData === 'reorder';
        e.dataTransfer.dropEffect = isReorderOperation ? 'move' : 'copy';
        
        // Update drag overlay position
        this.updateDragOverlay(e);
        
        // For reordering, show position indicators
        if (isReorderOperation) {
            this.showPositionIndicators(e);
        }
    }

    /**
     * Handle drag enter
     */
    handleDragEnter(e) {
        e.preventDefault();
        
        // Find the actual drop zone
        const dropZone = this.findDropZone(e.target);
        if (dropZone && this.canDropInZone(dropZone)) {
            dropZone.classList.add('drop-zone-active');
        }
    }

    /**
     * Handle drag leave
     */
    handleDragLeave(e) {
        // Only remove active class if we're actually leaving the drop zone
        const dropZone = this.findDropZone(e.target);
        if (dropZone && !dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove('drop-zone-active');
        }
    }

    /**
     * Handle drop
     */
    handleDrop(e) {
        e.preventDefault();
        
        const dropZone = this.findDropZone(e.target);
        if (!dropZone || !this.canDropInZone(dropZone)) {
            return;
        }
        
        // Remove active class
        dropZone.classList.remove('drop-zone-active');
        
        // Check if this is a reorder operation
        const reorderData = e.dataTransfer.getData('text/plain');
        if (reorderData === 'reorder') {
            this.handleReorderDrop(e, dropZone);
            return;
        }
        
        // Get drop data for new component
        let dropData;
        try {
            dropData = JSON.parse(reorderData);
        } catch (error) {
            console.error('Invalid drop data:', error);
            return;
        }
        
        // Add component to the drop zone
        this.addComponentToDropZone(dropData, dropZone, e);
        
        console.log('Component dropped:', dropData, 'in zone:', dropZone);
    }

    /**
     * Handle reordering of existing components
     */
    handleReorderDrop(e, dropZone) {
        const draggedElement = document.querySelector('.dragging');
        if (!draggedElement) return;
        
        // Get drop position
        const position = this.getDropPosition(e, dropZone);
        
        // Move element to new position
        this.insertComponentAtPosition(draggedElement, dropZone, position);
        
        // Remove dragging class
        draggedElement.classList.remove('dragging');
        
        console.log('Component reordered');
    }

    /**
     * Find the appropriate drop zone for a target element
     */
    findDropZone(target) {
        // If target is already a drop zone, return it
        if (target.hasAttribute('data-drop-zone')) {
            return target;
        }
        
        // Look for parent drop zone
        return target.closest('[data-drop-zone]');
    }

    /**
     * Check if component can be dropped in zone
     */
    canDropInZone(dropZone) {
        if (!this.draggedData) return false;
        
        // Page canvas accepts everything
        if (dropZone === this.pageBuilder.canvas) {
            return true;
        }
        
        // Container zones accept components and other containers
        if (dropZone.hasAttribute('data-container')) {
            return true;
        }
        
        // Check container-specific rules
        const containerType = dropZone.getAttribute('data-container');
        const maxChildren = dropZone.getAttribute('data-max-children');
        
        if (maxChildren) {
            const currentChildren = dropZone.querySelectorAll('[data-component], [data-container]').length;
            if (currentChildren >= parseInt(maxChildren)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Add component to drop zone
     */
    addComponentToDropZone(componentData, dropZone, e) {
        // Prevent duplicate additions by checking if we're already processing
        if (this.isProcessingDrop) {
            console.warn('Drop already in progress, skipping duplicate');
            return;
        }
        
        this.isProcessingDrop = true;
        console.log('Processing drop:', componentData);
        
        try {
            // Get drop position for proper insertion
            const position = e ? this.getDropPosition(e, dropZone) : dropZone.children.length;
            
            // Use page builder to add the component
            const newElement = this.pageBuilder.addComponent(componentData, dropZone);
            
            // Insert at correct position if not at end
            if (position < dropZone.children.length - 1) {
                this.insertComponentAtPosition(newElement, dropZone, position);
            }
            
            // Force update drop zones after component is fully added
            setTimeout(() => {
                if (!this.isProcessingDrop) {
                    this.updateDropZones();
                }
            }, 200);
        } catch (error) {
            console.error('Error adding component:', error);
        } finally {
            // Reset the flag after a longer delay to ensure DOM is stable
            setTimeout(() => {
                this.isProcessingDrop = false;
                console.log('Drop processing complete');
            }, 300);
        }
    }

    /**
     * Show drop zones
     */
    showDropZones() {
        this.dropZones.forEach(zone => {
            zone.classList.add('drop-zone');
        });
    }

    /**
     * Hide drop zones
     */
    hideDropZones() {
        this.dropZones.forEach(zone => {
            zone.classList.remove('drop-zone', 'drop-zone-active');
        });
    }

    /**
     * Create drag overlay
     */
    createDragOverlay() {
        this.dragOverlay = document.createElement('div');
        this.dragOverlay.className = 'fixed pointer-events-none z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 hidden';
        this.dragOverlay.innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="w-4 h-4 bg-blue-500 rounded"></div>
                <span class="text-sm font-medium text-gray-900 dark:text-white"></span>
            </div>
        `;
        document.body.appendChild(this.dragOverlay);
    }

    /**
     * Show drag overlay
     */
    showDragOverlay(e) {
        if (!this.dragOverlay || !this.draggedData) return;
        
        const span = this.dragOverlay.querySelector('span');
        span.textContent = this.draggedData.component;
        
        this.dragOverlay.classList.remove('hidden');
        this.updateDragOverlay(e);
    }

    /**
     * Update drag overlay position
     */
    updateDragOverlay(e) {
        if (!this.dragOverlay) return;
        
        this.dragOverlay.style.left = (e.clientX + 10) + 'px';
        this.dragOverlay.style.top = (e.clientY - 10) + 'px';
    }

    /**
     * Hide drag overlay
     */
    hideDragOverlay() {
        if (this.dragOverlay) {
            this.dragOverlay.classList.add('hidden');
        }
    }

    /**
     * Enable sorting within containers
     */
    enableSorting(container) {
        // TODO: Implement sortable functionality for reordering components
        console.log('Enable sorting for container:', container);
    }

    /**
     * Handle internal drag and drop (reordering)
     */
    handleInternalDrag(sourceElement, targetContainer) {
        // TODO: Implement internal drag and drop for reordering
        console.log('Internal drag from:', sourceElement, 'to:', targetContainer);
    }

    /**
     * Show position indicators during reordering
     */
    showPositionIndicators(e) {
        // Remove existing indicators
        this.removePositionIndicators();
        
        const target = e.target;
        const dropZone = this.findDropZone(target);
        
        if (!dropZone) return;
        
        const components = Array.from(dropZone.children).filter(child =>
            child.hasAttribute('data-component') && !child.classList.contains('dragging')
        );
        
        if (components.length === 0) return;
        
        const mouseY = e.clientY;
        
        // Find the best insertion point
        let insertionIndex = 0;
        let insertionElement = null;
        
        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            const rect = component.getBoundingClientRect();
            const componentCenter = rect.top + rect.height / 2;
            
            if (mouseY < componentCenter) {
                insertionIndex = i;
                insertionElement = component;
                break;
            } else {
                insertionIndex = i + 1;
            }
        }
        
        // Create position indicator
        const indicator = document.createElement('div');
        indicator.className = 'position-indicator';
        indicator.style.cssText = `
            height: 3px;
            background: #3b82f6;
            margin: 4px 0;
            border-radius: 2px;
            opacity: 0.8;
            box-shadow: 0 0 6px rgba(59, 130, 246, 0.5);
            position: relative;
            z-index: 1000;
        `;
        
        // Insert indicator at the correct position
        if (insertionElement) {
            dropZone.insertBefore(indicator, insertionElement);
        } else {
            dropZone.appendChild(indicator);
        }
    }
    
    /**
     * Remove position indicators
     */
    removePositionIndicators() {
        const indicators = document.querySelectorAll('.position-indicator');
        indicators.forEach(indicator => indicator.remove());
    }

    /**
     * Get drop position within container
     */
    getDropPosition(e, container) {
        const children = Array.from(container.children).filter(child => 
            child.hasAttribute('data-component') || child.hasAttribute('data-container')
        );
        
        if (children.length === 0) {
            return 0;
        }
        
        const mouseY = e.clientY;
        
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const rect = child.getBoundingClientRect();
            const childCenter = rect.top + rect.height / 2;
            
            if (mouseY < childCenter) {
                return i;
            }
        }
        
        return children.length;
    }

    /**
     * Insert component at specific position
     */
    insertComponentAtPosition(componentElement, container, position) {
        const children = Array.from(container.children).filter(child => 
            child.hasAttribute('data-component') || child.hasAttribute('data-container')
        );
        
        if (position >= children.length) {
            container.appendChild(componentElement);
        } else {
            container.insertBefore(componentElement, children[position]);
        }
    }

    /**
     * Cleanup drag and drop
     */
    destroy() {
        // Disconnect observer to prevent memory leaks
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        // Remove event listeners
        this.dropZones.forEach(zone => {
            zone.removeEventListener('dragover', this.handleDragOver);
            zone.removeEventListener('dragenter', this.handleDragEnter);
            zone.removeEventListener('dragleave', this.handleDragLeave);
            zone.removeEventListener('drop', this.handleDrop);
        });
        
        // Remove drag overlay
        if (this.dragOverlay) {
            this.dragOverlay.remove();
        }
        
        // Reset flags
        this.isProcessingDrop = false;
        this.draggedElement = null;
        this.draggedData = null;
        
        console.log('Drag & Drop destroyed');
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.DragDrop = DragDrop;
}