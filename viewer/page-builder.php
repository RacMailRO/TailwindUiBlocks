<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Builder - Tailwind UI Blocks Library</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/@heroicons/react@2.0.18/24/outline/index.js" type="module"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/editor/editor.main.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js"></script>
    <style>
        html, body {
            height: 100%;
            overflow: hidden;
        }
        
        .drag-over {
            background-color: rgba(59, 130, 246, 0.1);
            border-color: #3b82f6;
        }
        
        .dragging {
            opacity: 0.5;
            transform: rotate(5deg);
        }
        
        .drop-zone {
            transition: all 0.2s ease;
        }
        
        .drop-zone-active {
            background-color: rgba(34, 197, 94, 0.1);
            border-color: #22c55e;
            border-width: 2px;
        }
        
        .component-palette {
            scrollbar-width: thin;
            scrollbar-color: #d1d5db #f9fafb;
        }
        
        .component-palette::-webkit-scrollbar {
            width: 6px;
        }
        
        .component-palette::-webkit-scrollbar-track {
            background: #f9fafb;
        }
        
        .component-palette::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 3px;
        }
        
        .component-wrapper:hover {
            outline: 2px dashed #3b82f6;
            outline-offset: 2px;
        }
        
        .component-controls {
            z-index: 10;
        }
        
        .selected-element {
            outline: 2px solid #3b82f6 !important;
            outline-offset: 2px;
        }
    </style>
</head>

<body class="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <?php
    // Include helper functions
    include_once 'includes/functions.php';

    // Get current page data if editing
    $pageId = $_GET['page'] ?? null;
    $currentPage = $pageId ? loadPage($pageId) : null;

    // Get component data
    $components = getComponentTree();
    ?>

    <div class="flex h-screen overflow-hidden">
        <!-- Component Palette Sidebar -->
        <div class="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Page Builder</h1>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Drag & drop components</p>
                    </div>
                </div>
                <button class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onclick="togglePalette()">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
                    </svg>
                </button>
            </div>

            <!-- Search -->
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="relative">
                    <input type="text" 
                           id="component-search" 
                           placeholder="Search components..." 
                           class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
            </div>

            <!-- Component Categories -->
            <div class="flex-1 overflow-y-auto component-palette">
                <!-- Container Components -->
                <div class="p-4">
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Container Components</h3>
                    <div class="space-y-2">
                        <div class="component-item group p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                             draggable="true"
                             data-component-type="container"
                             data-component="section"
                             data-category="layout"
                             data-subcategory="containers"
                             onclick="handleComponentClick(this, event)">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                                    <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-900 dark:text-white">Section</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Full-width wrapper</p>
                                </div>
                                <button class="add-component-btn opacity-0 group-hover:opacity-100 p-1 rounded text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all"
                                        onclick="event.stopPropagation(); addComponentToCanvas(this.parentElement.parentElement.parentElement)"
                                        title="Click to add">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div class="component-item p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" 
                             draggable="true" 
                             data-component-type="container"
                             data-component="container"
                             data-category="layout"
                             data-subcategory="containers">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                                    <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                    </svg>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-900 dark:text-white">Container</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Max-width centered</p>
                                </div>
                            </div>
                        </div>

                        <div class="component-item p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" 
                             draggable="true" 
                             data-component-type="container"
                             data-component="grid"
                             data-category="layout"
                             data-subcategory="containers">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded flex items-center justify-center">
                                    <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-900 dark:text-white">Grid</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">CSS Grid layout</p>
                                </div>
                            </div>
                        </div>

                        <div class="component-item p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" 
                             draggable="true" 
                             data-component-type="container"
                             data-component="flex-row"
                             data-category="layout"
                             data-subcategory="containers">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded flex items-center justify-center">
                                    <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                    </svg>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-900 dark:text-white">Flex Row</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Horizontal flex</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation Components -->
                <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Navigation</h3>
                    <div class="space-y-2">
                        <div class="component-item p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                             draggable="true"
                             data-component-type="component"
                             data-component="top-navigation"
                             data-category="navigation"
                             data-subcategory="navigation"
                             onclick="handleComponentClick(this, event)">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded flex items-center justify-center">
                                    <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                    </svg>
                                </div>
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-gray-900 dark:text-white">Top Navigation</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Navigation</p>
                                </div>
                                <button class="add-component-btn opacity-0 group-hover:opacity-100 p-1 rounded text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all"
                                        onclick="event.stopPropagation(); addComponentToCanvas(this.parentElement.parentElement.parentElement)"
                                        title="Click to add">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Existing Components -->
                <?php foreach ($components as $category => $subcategories): ?>
                <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3 capitalize"><?= str_replace('-', ' ', $category) ?></h3>
                    <?php foreach ($subcategories as $subcategory => $componentList): ?>
                    <div class="mb-4">
                        <h4 class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 capitalize"><?= str_replace('-', ' ', $subcategory) ?></h4>
                        <div class="space-y-2">
                            <?php foreach ($componentList as $comp): ?>
                            <div class="component-item p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" 
                                 draggable="true" 
                                 data-component-type="component"
                                 data-component="<?= $comp['slug'] ?>"
                                 data-category="<?= $category ?>"
                                 data-subcategory="<?= $subcategory ?>">
                                <div class="flex items-center space-x-3">
                                    <div class="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded flex items-center justify-center">
                                        <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-gray-900 dark:text-white"><?= $comp['name'] ?></p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400"><?= ucfirst($subcategory) ?></p>
                                    </div>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 flex">
            <!-- Canvas Area -->
            <div class="flex-1 flex flex-col">
                <!-- Top Toolbar -->
                <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <a href="index.php" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                ← Back to Viewer
                            </a>
                            <div class="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                            <div>
                                <input type="text"
                                       id="page-name"
                                       placeholder="Untitled Page"
                                       value="<?= $currentPage['name'] ?? 'Untitled Page' ?>"
                                       class="text-lg font-medium bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400">
                            </div>
                        </div>
                        <div class="flex items-center space-x-3">
                            <button class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" onclick="previewPage()">
                                Preview
                            </button>
                            <button class="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors" onclick="showCodeEditor()">
                                Code Editor
                            </button>
                            <button class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onclick="savePage()">
                                Save Page
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Canvas Area -->
                <div class="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-6">
                    <div class="max-w-6xl mx-auto">
                        <div id="page-canvas" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-screen" data-drop-zone="page">
                            <!-- Page content will be built here -->
                            <div class="min-h-[400px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 m-8" data-placeholder="page">
                                <div class="text-center">
                                    <svg class="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                    <h3 class="text-xl font-medium mb-2">Start Building Your Page</h3>
                                    <p class="text-sm">Drag components from the sidebar to build your page</p>
                                    <p class="text-xs mt-2">Try starting with a Header container</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Properties Panel -->
            <div id="properties-panel" class="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 hidden">
                <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Properties</h3>
                        <button onclick="hidePropertiesPanel()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div id="properties-content" class="p-4 space-y-4">
                    <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                        <svg class="mx-auto h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <p class="text-sm">Select a component to edit its properties</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- JavaScript -->
    <script src="js/modules/pageBuilder.js"></script>
    <script src="js/modules/dragDrop.js"></script>
    <script>
        // Initialize page builder
        document.addEventListener('DOMContentLoaded', function() {
            const pageBuilder = new PageBuilder();
            pageBuilder.init();
            
            // Make pageBuilder globally accessible
            window.pageBuilder = pageBuilder;
        });

        // Global functions for UI interactions
        function hidePropertiesPanel() {
            document.getElementById('properties-panel').classList.add('hidden');
        }

        function showPropertiesPanel() {
            document.getElementById('properties-panel').classList.remove('hidden');
        }

        // Handle component click with drag detection
        let isDragging = false;
        let dragStartTime = 0;
        let isProcessingComponent = false;
        
        function handleComponentClick(element, event) {
            // Prevent click if we just finished dragging or already processing
            const timeSinceDragStart = Date.now() - dragStartTime;
            if (isDragging || timeSinceDragStart < 200 || isProcessingComponent) {
                event.preventDefault();
                console.log('Click prevented - drag state:', isDragging, 'time since drag:', timeSinceDragStart, 'processing:', isProcessingComponent);
                return;
            }
            
            addComponentToCanvas(element);
        }
        
        // Click-to-add functionality
        function addComponentToCanvas(element) {
            // Prevent duplicate additions
            if (isProcessingComponent) {
                console.warn('Component addition already in progress, skipping');
                return;
            }
            
            isProcessingComponent = true;
            console.log('Processing component addition...');
            
            try {
                const componentData = {
                    type: element.getAttribute('data-component-type'),
                    component: element.getAttribute('data-component'),
                    category: element.getAttribute('data-category'),
                    subcategory: element.getAttribute('data-subcategory')
                };
                
                const canvas = document.getElementById('page-canvas');
                window.pageBuilder.addComponent(componentData, canvas);
                
                console.log('Component added successfully');
            } catch (error) {
                console.error('Error adding component:', error);
            } finally {
                // Reset processing flag after a delay
                setTimeout(() => {
                    isProcessingComponent = false;
                    console.log('Component processing complete');
                }, 250);
            }
        }
        
        // Track drag state to prevent click conflicts
        document.addEventListener('dragstart', function(e) {
            if (e.target.closest('.component-palette')) {
                isDragging = true;
                dragStartTime = Date.now();
            }
        });
        
        document.addEventListener('dragend', function(e) {
            if (e.target.closest('.component-palette')) {
                // Delay resetting to prevent immediate click
                setTimeout(() => {
                    isDragging = false;
                }, 200);
            }
        });
        
        // Component reordering functions
        function moveComponentUp(element) {
            const parent = element.parentElement;
            const previousSibling = element.previousElementSibling;
            
            if (previousSibling && (previousSibling.hasAttribute('data-component') || previousSibling.hasAttribute('data-container'))) {
                parent.insertBefore(element, previousSibling);
                showPositionFeedback(element, 'Moved up');
            }
        }
        
        function moveComponentDown(element) {
            const parent = element.parentElement;
            const nextSibling = element.nextElementSibling;
            
            if (nextSibling && (nextSibling.hasAttribute('data-component') || nextSibling.hasAttribute('data-container'))) {
                parent.insertBefore(nextSibling, element);
                showPositionFeedback(element, 'Moved down');
            }
        }
        
        function deleteComponent(element) {
            if (confirm('Are you sure you want to delete this component?')) {
                const parent = element.parentElement;
                element.remove();
                
                // Check if parent needs placeholder
                if (window.pageBuilder && window.pageBuilder.checkForPlaceholder) {
                    window.pageBuilder.checkForPlaceholder(parent);
                }
                showPositionFeedback(parent, 'Component deleted');
            }
        }
        
        function showPositionFeedback(element, message) {
            // Create feedback element
            const feedback = document.createElement('div');
            feedback.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all';
            feedback.textContent = message;
            
            document.body.appendChild(feedback);
            
            // Remove after 2 seconds
            setTimeout(() => {
                feedback.classList.add('opacity-0');
                setTimeout(() => feedback.remove(), 300);
            }, 2000);
        }
        
        // Save page functionality
        function savePage() {
            const pageName = document.getElementById('page-name')?.value || 'Untitled Page';
            const pageStructure = window.pageBuilder.getPageStructure();
            
            const pageData = {
                name: pageName,
                structure: pageStructure,
                category: 'landing-pages',
                tags: ['page-builder'],
                description: `Page created with Page Builder: ${pageName}`
            };
            
            // Show loading state
            const saveBtn = document.querySelector('button[onclick="savePage()"]');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
            
            fetch('./api/save-page.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pageData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showPositionFeedback(document.body, `Page "${pageName}" saved successfully!`);
                    console.log('Page saved:', data);
                } else {
                    throw new Error(data.error || 'Failed to save page');
                }
            })
            .catch(error => {
                console.error('Save error:', error);
                showPositionFeedback(document.body, `Error saving page: ${error.message}`);
            })
            .finally(() => {
                // Reset button state
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
            });
        }
        
        // Show code editor modal
        function showCodeEditor() {
            const pageStructure = window.pageBuilder.getPageStructure();
            const generatedHTML = window.pageBuilder.generateHTML();
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col m-4">
                    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Page Code Editor</h2>
                        <div class="flex space-x-2">
                            <button id="tab-html" class="px-3 py-1 text-sm bg-blue-600 text-white rounded">HTML</button>
                            <button id="tab-json" class="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded">JSON</button>
                            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="flex-1 p-4">
                        <div id="code-editor" class="w-full h-full border border-gray-300 dark:border-gray-600 rounded"></div>
                    </div>
                    <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                        <div class="text-sm text-gray-500">
                            <span id="editor-info">Read-only HTML output</span>
                        </div>
                        <div class="space-x-2">
                            <button onclick="copyToClipboard()" class="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                                Copy to Clipboard
                            </button>
                            <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Initialize Monaco Editor
            require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });
            require(['vs/editor/editor.main'], function () {
                let currentContent = generatedHTML;
                let currentLanguage = 'html';
                
                const editor = monaco.editor.create(document.getElementById('code-editor'), {
                    value: generatedHTML,
                    language: 'html',
                    theme: 'vs-dark',
                    readOnly: true,
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false
                });
                
                // Tab switching
                document.getElementById('tab-html').onclick = () => {
                    currentContent = generatedHTML;
                    currentLanguage = 'html';
                    editor.setValue(currentContent);
                    monaco.editor.setModelLanguage(editor.getModel(), currentLanguage);
                    document.getElementById('tab-html').className = 'px-3 py-1 text-sm bg-blue-600 text-white rounded';
                    document.getElementById('tab-json').className = 'px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded';
                    document.getElementById('editor-info').textContent = 'Read-only HTML output';
                };
                
                document.getElementById('tab-json').onclick = () => {
                    currentContent = JSON.stringify(pageStructure, null, 2);
                    currentLanguage = 'json';
                    editor.setValue(currentContent);
                    monaco.editor.setModelLanguage(editor.getModel(), currentLanguage);
                    document.getElementById('tab-json').className = 'px-3 py-1 text-sm bg-blue-600 text-white rounded';
                    document.getElementById('tab-html').className = 'px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded';
                    document.getElementById('editor-info').textContent = 'Read-only JSON structure';
                };
                
                // Copy to clipboard function
                window.copyToClipboard = () => {
                    navigator.clipboard.writeText(editor.getValue()).then(() => {
                        showPositionFeedback(document.body, 'Code copied to clipboard!');
                    }).catch(err => {
                        console.error('Failed to copy: ', err);
                        showPositionFeedback(document.body, 'Failed to copy code');
                    });
                };
            });
        }
        
        // Global functions
        window.handleComponentClick = handleComponentClick;
        window.addComponentToCanvas = addComponentToCanvas;
        window.moveComponentUp = moveComponentUp;
        window.moveComponentDown = moveComponentDown;
        window.deleteComponent = deleteComponent;
        window.showPositionFeedback = showPositionFeedback;
        window.savePage = savePage;
        window.showCodeEditor = showCodeEditor;
    </script>
</body>

</html>