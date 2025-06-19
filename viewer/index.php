<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind UI Blocks Library</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/@heroicons/react@2.0.18/24/outline/index.js" type="module"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/editor/editor.main.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js"></script>
    <style>
        .component-preview {
            transition: all 0.3s ease;
        }

        .dark .component-preview {
            background-color: #1f2937;
        }

        .sidebar-transition {
            transition: transform 0.3s ease;
        }

        .breakpoint-container {
            transition: width 0.3s ease, margin 0.3s ease;
        }
    </style>
</head>

<body class="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <?php
    // Include helper functions
    include_once 'includes/functions.php';

    // Get current component and category from URL
    $category = $_GET['category'] ?? 'marketing';
    $subcategory = $_GET['subcategory'] ?? 'heroes';
    $component = $_GET['component'] ?? null;
    $theme = $_GET['theme'] ?? 'light';
    $breakpoint = $_GET['breakpoint'] ?? 'desktop';

    // Get component data
    $components = getComponentTree();
    $currentComponent = $component ? getComponent($category, $subcategory, $component) : null;

    ?>

    <div class="flex h-screen overflow-hidden">
        <!-- Sidebar -->
        <div id="sidebar" class="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col sidebar-transition">
            <!-- Header -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <h1 class="text-xl font-bold text-gray-900 dark:text-white"><a href="/viewer/">Tailwind UI Blocks</a></h1>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Component Library</p>
                
                <!-- Navigation Links -->
                <div class="flex space-x-2 mt-4">
                    <a href="index.php" class="px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg">
                        Components
                    </a>
                    <a href="page-builder.php" class="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        Page Builder
                    </a>
                </div>
            </div>

            <!-- Search -->
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="relative">
                    <input type="text" id="search-input" placeholder="Search components..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Component Tree -->
            <div class="flex-1 overflow-y-auto">
                <nav class="p-4 space-y-4">
                    <!-- Favorites Section -->
                    <div class="space-y-1">
                        <button class="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider py-1 subcategory-toggle"
                            data-target="favorites-list-content">
                            <span>Favorites</span>
                            <svg class="w-4 h-4 transform transition-transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        <div id="favorites-list-content" class="ml-4 mt-1 space-y-1">
                            <!-- Favorite items will be populated by JS -->
                            <p class="text-xs text-gray-500 dark:text-gray-400 hidden" id="no-favorites-message">No favorites yet. Click the star to add.</p>
                        </div>
                    </div>

                    <?php foreach ($components as $cat => $subcategories): ?>
                        <div class="space-y-1">
                            <h3 class="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider">
                                <?php echo ucfirst(str_replace('-', ' ', $cat)); ?>
                            </h3>
                            <?php foreach ($subcategories as $subcat => $items): ?>
                                <div class="ml-3">
                                    <button class="flex items-center justify-between w-full text-left text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-1 subcategory-toggle"
                                        data-target="<?php echo $cat . '-' . $subcat; ?>">
                                        <span><?php echo ucfirst(str_replace('-', ' ', $subcat)); ?></span>
                                        <svg class="w-4 h-4 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    <div id="<?php echo $cat . '-' . $subcat; ?>" class="ml-4 mt-1 space-y-1 hidden">
                                        <?php foreach ($items as $item): ?>
                                            <div class="flex items-center justify-between group">
                                                <a href="?category=<?php echo $cat; ?>&subcategory=<?php echo $subcat; ?>&component=<?php echo $item['slug']; ?>&theme=<?php echo $theme; ?>&breakpoint=<?php echo $breakpoint; ?>"
                                                    class="component-link flex-grow text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 py-1 px-2 rounded <?php echo ($component === $item['slug']) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''; ?>"
                                                    data-category="<?php echo $cat; ?>"
                                                    data-subcategory="<?php echo $subcat; ?>"
                                                    data-component="<?php echo $item['slug']; ?>">
                                                    <?php echo $item['name']; ?>
                                                </a>
                                                <button class="favorite-toggle p-1 rounded-md text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                                    data-category="<?php echo $cat; ?>"
                                                    data-subcategory="<?php echo $subcat; ?>"
                                                    data-component-slug="<?php echo $item['slug']; ?>"
                                                    title="Toggle favorite">
                                                    <!-- Star icon will be filled by JS if favorited -->
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.846 5.671a1 1 0 00.95.69h5.969c.969 0 1.371 1.24.588 1.81l-4.828 3.522a1 1 0 00-.364 1.118l1.846 5.671c.3.921-.755 1.688-1.54 1.118l-4.828-3.522a1 1 0 00-1.176 0l-4.828 3.522c-.784.57-1.838-.197-1.539-1.118l1.846-5.671a1 1 0 00-.364-1.118L2.28 11.1c-.783-.57-.38-1.81.588-1.81h5.969a1 1 0 00.95-.69L11.049 2.927z"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endforeach; ?>
                </nav>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Top Bar -->
            <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <button id="sidebar-toggle" class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        <?php if ($currentComponent): ?>
                            <div>
                                <h2 class="text-lg font-semibold text-gray-900 dark:text-white"><?php echo $currentComponent['metadata']['name']; ?></h2>
                                <p class="text-sm text-gray-500 dark:text-gray-400"><?php echo $currentComponent['metadata']['description']; ?></p>
                            </div>
                        <?php else: ?>
                            <div>
                                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Welcome to Tailwind UI Blocks</h2>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Select a component to get started</p>
                            </div>
                        <?php endif; ?>
                    </div>


                </div>
            </div>

            <!-- Content Area -->
            <div class="flex-1 overflow-hidden">
                <!-- Breakpoint and Size Display -->
                <!-- Use PHP to conditionally hide this if no component is selected -->
                <div id="breakpoint-info" class="flex flex-row flex-wrap px-6 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 <?php echo !$currentComponent ? 'hidden' : ''; ?>">
                    <div class="flex-none flex items-center gap-2"><span id="current-breakpoint">Desktop</span> • <span id="current-width">1200px</span></div>
                    <div class="flex-auto"></div>
                    <div class="flex flex-wrap items-center gap-2 justify-center">
                        <div class="flex items-center space-x-4">
                            <!-- Theme Toggle -->
                            <button id="theme-toggle" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200" title="Toggle theme">
                                <!-- Sun icon for dark mode (shows when dark mode is active) -->
                                <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                                <!-- Moon icon for light mode (shows when light mode is active) -->
                                <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                                </svg>
                            </button>

                            <!-- Breakpoint Selector -->
                            <div class="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button class="breakpoint-btn px-3 py-1 text-sm rounded-md <?php echo $breakpoint === 'mobile' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'; ?>"
                                    data-breakpoint="mobile" data-width="375">
                                    Mobile
                                </button>
                                <button class="breakpoint-btn px-3 py-1 text-sm rounded-md <?php echo $breakpoint === 'tablet' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'; ?>"
                                    data-breakpoint="tablet" data-width="768">
                                    Tablet
                                </button>
                                <button class="breakpoint-btn px-3 py-1 text-sm rounded-md <?php echo $breakpoint === 'desktop' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'; ?>"
                                    data-breakpoint="desktop" data-width="1200">
                                    Desktop
                                </button>
                            </div>

                            <!-- Width Adjuster -->
                            <div class="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                                <label for="width-slider" class="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">Width:</label>
                                <input type="range" id="width-slider" min="320" max="1400" value="1200"
                                    class="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600">
                                <span id="width-display" class="text-xs text-gray-600 dark:text-gray-300 font-mono min-w-[3rem]">
                                    1200px
                                </span>
                            </div>

                            <!-- View Toggle -->
                            <div class="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button id="preview-tab" class="view-tab px-3 py-1 text-sm rounded-md text-gray-600 dark:text-gray-300" title="Preview only">
                                    Preview
                                </button>
                                <button id="code-tab" class="view-tab px-3 py-1 text-sm rounded-md text-gray-600 dark:text-gray-300" title="Code only">
                                    Code
                                </button>
                                <button id="split-tab" class="view-tab px-3 py-1 text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" title="Preview + Code">
                                    Split
                                </button>
                                <button id="examples-tab" class="view-tab px-3 py-1 text-sm rounded-md text-gray-600 dark:text-gray-300" title="Usage Examples">
                                    Examples
                                </button>
                            </div>

                            <!-- Split View Controls (only visible in split view) -->
                            <div id="split-controls" class="hidden flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button id="horizontal-split" class="split-orientation-btn px-2 py-1 text-xs rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" title="Horizontal split">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 18h16"></path>
                                    </svg>
                                </button>
                                <button id="vertical-split" class="split-orientation-btn px-2 py-1 text-xs rounded-md text-gray-600 dark:text-gray-300" title="Vertical split">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4v16M18 4v16"></path>
                                    </svg>
                                </button>
                            </div>

                            <!-- Component Actions -->
                            <div class="flex items-center space-x-2">
                                <button id="save-component" class="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200" title="Save component">
                                    Save
                                </button>
                                <button id="save-as-component" class="px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200" title="Save as new component">
                                    Save As
                                </button>
                            </div>

                            <!-- Editor Theme Toggle (only visible in code/split view) -->
                            <button id="editor-theme-toggle" class="hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200" title="Toggle editor theme">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </button>

                            <!-- Copy Button -->
                            <?php if ($currentComponent): ?>
                                <button id="copy-code" class="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors duration-200" title="Copy HTML code">
                                    Copy Code
                                </button>
                                <button id="download-html" class="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors duration-200" title="Download component HTML">
                                    Download
                                </button>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>

                <!-- ALWAYS RENDER THE VIEW CONTAINERS -->

                <!-- Preview View -->
                <div id="preview-view" class="h-full flex items-center justify-center p-8 <?php echo !$currentComponent ? 'hidden' : ''; ?>">
                    <div id="component-container" class="breakpoint-container bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                        style="width: 100%; max-width: 100%; height: calc(100vh - 200px);">
                        <iframe id="component-frame" src="<?php echo $currentComponent ? 'api/render.php?category=' . $category . '&subcategory=' . $subcategory . '&component=' . $component . '&theme=' . $theme : 'about:blank'; ?>"
                            class="w-full h-full border-0"></iframe>
                    </div>
                </div>

                <!-- Code View -->
                <div id="code-view" class="h-full hidden">
                    <div id="code-editor" class="h-full"></div>
                </div>

                <!-- Split View -->
                <div id="split-view" class="h-full flex flex-col <?php echo empty($currentComponent) ? 'hidden' : ''; ?>">
                    <!-- Horizontal Split -->
                    <div id="horizontal-split-container" class="h-full flex flex-col">
                        <div id="preview-section" class="flex-1 flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-700 min-h-0" style="flex: 1 1 50%;">
                            <div id="split-component-container" class="breakpoint-container bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                                style="width: 100%; max-width: 100%; height: 100%;">
                                <iframe id="split-component-frame" src="<?php echo $currentComponent ? 'api/render.php?category=' . $category . '&subcategory=' . $subcategory . '&component=' . $component . '&theme=' . $theme : 'about:blank'; ?>"
                                    class="w-full h-full border-0"></iframe>
                            </div>
                        </div>
                        <div id="horizontal-resizer" class="h-1 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 cursor-row-resize"></div>
                        <div id="code-section" class="flex-1 min-h-0" style="flex: 1 1 50%;">
                            <div id="split-code-editor" class="h-full"></div>
                        </div>
                    </div>
                    <!-- Vertical Split (initially hidden) -->
                    <div id="vertical-split-container" class="h-full flex flex-row hidden">
                        <div id="preview-section-vertical" class="relative flex-shrink-0 p-4 border-r border-gray-200 dark:border-gray-700 min-w-0" style="flex-basis: 50%;">
                            <div id="split-component-container-vertical" class="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                                <iframe id="split-component-frame-vertical" src="<?php echo $currentComponent ? 'api/render.php?category=' . $category . '&subcategory=' . $subcategory . '&component=' . $component . '&theme=' . $theme : 'about:blank'; ?>" class="w-full h-full border-0"></iframe>
                            </div>
                        </div>
                        <!-- Vertical Resizer -->
                        <div id="vertical-resizer" class="flex-shrink-0 w-1 bg-gray-300 dark:bg-gray-600 hover:bg-blue-500 cursor-col-resize transition-colors duration-200"></div>

                        <!-- Code Section: This is the critical part. -->
                        <!-- It should grow to fill space and be allowed to shrink to zero. -->
                        <div id="code-section-vertical" class="flex-grow min-w-0 relative">
                            <div id="split-code-editor-vertical" class="absolute inset-0"></div>
                        </div>
                    </div>
                </div>

                <!-- Examples View -->
                <div id="examples-view" class="h-full hidden p-4 md:p-8 overflow-y-auto">
                    <!-- ... content ... -->
                </div>

                <!-- Welcome Screen -->
                <!-- Use PHP to conditionally show this if no component is selected -->
                <div id="welcome-screen" class="h-full flex items-center justify-center <?php echo $currentComponent ? 'hidden' : ''; ?>">
                    <!-- Welcome Screen -->
                    <div class="h-full flex items-center justify-center">
                        <div class="text-center">
                            <div class="w-24 h-24 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                <svg class="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                            </div>
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Component</h3>
                            <p class="text-gray-500 dark:text-gray-400 max-w-sm">Choose a component from the sidebar to view its preview and code.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Component Save Modal -->
    <div id="save-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 id="save-modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">Save Component</h3>
                <button id="close-save-modal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <form id="save-component-form" class="space-y-4">
                <div>
                    <label for="component-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Component Name</label>
                    <input type="text" id="component-name" name="name" required
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                </div>

                <div>
                    <label for="component-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea id="component-description" name="description" rows="3"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="component-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select id="component-category" name="category" required
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                            <option value="marketing">Marketing</option>
                            <option value="application-ui">Application UI</option>
                            <option value="ecommerce">Ecommerce</option>
                        </select>
                    </div>

                    <div>
                        <label for="component-subcategory" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subcategory</label>
                        <select id="component-subcategory" name="subcategory" required
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                            <!-- Options will be populated dynamically -->
                        </select>
                    </div>
                </div>

                <div>
                    <label for="component-tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
                    <input type="text" id="component-tags" name="tags"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="hero, landing, cta">
                </div>

                <div class="flex items-center space-x-4">
                    <label class="flex items-center">
                        <input type="checkbox" id="component-responsive" name="responsive" checked
                            class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                        <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Responsive</span>
                    </label>

                    <label class="flex items-center">
                        <input type="checkbox" id="component-dark-mode" name="darkMode" checked
                            class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                        <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
                    </label>
                </div>

                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" id="cancel-save" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        Save Component
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script type="module" src="js/main.js"></script>
    <script>
        // Initialize with current component data
        <?php if ($currentComponent): ?>
            window.currentComponent = <?php echo json_encode($currentComponent); ?>;
        <?php endif; ?>
    </script>
</body>

</html>