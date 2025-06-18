class ComponentViewer {
    constructor() {
        this.currentComponent = null;
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.currentView = localStorage.getItem('view') || 'split';
        this.currentBreakpoint = localStorage.getItem('breakpoint') || 'desktop';
        this.currentWidth = parseInt(localStorage.getItem('width')) || 1200;
        this.editor = null;
        this.splitEditor = null;
        this.splitEditorVertical = null;
        this.editorTheme = localStorage.getItem('editorTheme') || 'vs';
        this.splitOrientation = localStorage.getItem('splitOrientation') || 'horizontal';
        this.isComponentModified = false;
        this.previewSectionSize = localStorage.getItem('previewSectionSize') || '50';
        this.scrollPosition = 0;
        this.updateTimeout = null;
        
        this.init();
    }
    
    init() {
        // Apply initial theme
        this.applyTheme();
        
        // Initialize all components
        this.initThemeToggle();
        this.initSearch();
        this.initBreakpointButtons();
        this.initWidthAdjuster();
        this.initViewTabs();
        this.initSplitView();
        this.initMonacoEditor();
        this.initResizers();
        this.initComponentActions();
        
        // Load initial component if specified in URL
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const subcategory = urlParams.get('subcategory');
        const component = urlParams.get('component');
        
        if (category && subcategory && component) {
            this.loadComponent(category, subcategory, component);
        }
        
        // Set initial view
        this.switchView(this.currentView);
        
        // Restore split orientation
        this.setSplitOrientation(this.splitOrientation);
    }
    
    applyTheme() {
        if (this.currentTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('#theme-toggle svg');
        if (themeIcon) {
            if (this.currentTheme === 'dark') {
                themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
            } else {
                themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>';
            }
        }
    }
    
    initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
                localStorage.setItem('theme', this.currentTheme);
                this.applyTheme();
                this.updateComponentPreview();
            });
        }
    }
    
    initSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchComponents(e.target.value);
            });
        }
    }
    
    async searchComponents(query) {
        if (query.length < 2) {
            // Show all components
            this.loadComponentList();
            return;
        }
        
        try {
            const response = await fetch(`api/search.php?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        }
    }
    
    displaySearchResults(results) {
        const sidebar = document.querySelector('.sidebar-content');
        if (!sidebar) return;
        
        let html = '<div class="p-4"><h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Search Results</h3>';
        
        if (results.length === 0) {
            html += '<p class="text-sm text-gray-500 dark:text-gray-400">No components found.</p>';
        } else {
            results.forEach(result => {
                html += `
                    <div class="mb-2">
                        <button class="component-link w-full text-left p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                data-category="${result.category}" data-subcategory="${result.subcategory}" data-component="${result.component}">
                            <div class="font-medium">${result.title}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">${result.category}/${result.subcategory}</div>
                        </button>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        sidebar.innerHTML = html;
        
        // Reattach event listeners
        this.attachComponentLinks();
    }
    
    attachComponentLinks() {
        document.querySelectorAll('.component-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.dataset.category;
                const subcategory = link.dataset.subcategory;
                const component = link.dataset.component;
                this.loadComponent(category, subcategory, component);
            });
        });
    }
    
    initBreakpointButtons() {
        document.querySelectorAll('.breakpoint-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const breakpoint = btn.dataset.breakpoint;
                this.setBreakpoint(breakpoint);
            });
        });
    }
    
    setBreakpoint(breakpoint) {
        this.currentBreakpoint = breakpoint;
        localStorage.setItem('breakpoint', breakpoint);
        
        // Update width based on breakpoint
        const widths = { mobile: 375, tablet: 768, desktop: 1200 };
        this.currentWidth = widths[breakpoint];
        localStorage.setItem('width', this.currentWidth);
        
        // Update container widths
        this.updateContainerWidths();
        this.updateBreakpointDisplay();
        
        // Update URL
        this.updateURL({ breakpoint });
    }
    
    initWidthAdjuster() {
        const widthSlider = document.getElementById('width-slider');
        if (widthSlider) {
            widthSlider.addEventListener('input', (e) => {
                this.currentWidth = parseInt(e.target.value);
                localStorage.setItem('width', this.currentWidth);
                this.updateBreakpointFromWidth();
                this.updateContainerWidths();
                this.updateBreakpointDisplay();
            });
        }
    }
    
    updateBreakpointFromWidth() {
        let newBreakpoint;
        if (this.currentWidth < 640) {
            newBreakpoint = 'mobile';
        } else if (this.currentWidth < 1024) {
            newBreakpoint = 'tablet';
        } else {
            newBreakpoint = 'desktop';
        }
        
        if (newBreakpoint !== this.currentBreakpoint) {
            this.currentBreakpoint = newBreakpoint;
            localStorage.setItem('breakpoint', this.currentBreakpoint);
            this.updateBreakpointButtons();
        }
    }
    
    updateBreakpointFromPreviewSize(customWidth = null) {
        let containerWidth = customWidth;
        
        // If no custom width provided, get the actual preview container size
        if (!containerWidth) {
            let previewContainer = null;
            if (this.splitOrientation === 'horizontal') {
                previewContainer = document.getElementById('split-component-container');
            } else {
                previewContainer = document.getElementById('split-component-container-vertical');
            }
            
            if (previewContainer) {
                containerWidth = previewContainer.getBoundingClientRect().width;
            }
        }
        
        if (containerWidth) {
            // Update current width based on actual container size
            const newWidth = Math.round(containerWidth);
            if (Math.abs(newWidth - this.currentWidth) > 10) {
                this.currentWidth = newWidth;
                localStorage.setItem('width', this.currentWidth);
                
                // Update breakpoint based on new width
                this.updateBreakpointFromWidth();
                this.updateBreakpointDisplay();
                
                // Update width slider
                const widthSlider = document.getElementById('width-slider');
                if (widthSlider) {
                    widthSlider.value = this.currentWidth;
                }
            }
        }
    }
    
    updateBreakpointButtons() {
        // Update active button
        document.querySelectorAll('.breakpoint-btn').forEach(btn => {
            btn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
            btn.classList.add('text-gray-600', 'dark:text-gray-300');
        });
        
        const activeButton = document.querySelector(`[data-breakpoint="${this.currentBreakpoint}"]`);
        if (activeButton) {
            activeButton.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
            activeButton.classList.remove('text-gray-600', 'dark:text-gray-300');
        }
    }
    
    updateContainerWidths() {
        const containers = [
            document.getElementById('component-container'),
            document.getElementById('split-component-container'),
            document.getElementById('split-component-container-vertical')
        ];
        
        containers.forEach(container => {
            if (container) {
                if (this.currentBreakpoint === 'desktop' && this.currentWidth >= 1200) {
                    container.style.width = '100%';
                } else {
                    container.style.width = this.currentWidth + 'px';
                }
            }
        });
    }
    
    updateBreakpointDisplay() {
        const currentBreakpoint = document.getElementById('current-breakpoint');
        const currentWidth = document.getElementById('current-width');
        const widthDisplay = document.getElementById('width-display');
        
        if (currentBreakpoint) {
            currentBreakpoint.textContent = this.currentBreakpoint.charAt(0).toUpperCase() + this.currentBreakpoint.slice(1);
        }
        
        if (currentWidth) {
            currentWidth.textContent = `${this.currentWidth}px`;
        }
        
        if (widthDisplay) {
            widthDisplay.textContent = `${this.currentWidth}px`;
        }
        
        // Update width slider
        const widthSlider = document.getElementById('width-slider');
        if (widthSlider) {
            widthSlider.value = this.currentWidth;
        }
    }
    
    initViewTabs() {
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const view = tab.id.replace('-tab', '');
                this.switchView(view);
            });
        });
    }
    
    switchView(view) {
        this.currentView = view;
        localStorage.setItem('view', view);
        
        const previewView = document.getElementById('preview-view');
        const codeView = document.getElementById('code-view');
        const splitView = document.getElementById('split-view');
        const previewTab = document.getElementById('preview-tab');
        const codeTab = document.getElementById('code-tab');
        const splitTab = document.getElementById('split-tab');
        const editorThemeToggle = document.getElementById('editor-theme-toggle');
        const splitControls = document.getElementById('split-controls');
        
        // Hide all views first
        previewView?.classList.add('hidden');
        codeView?.classList.add('hidden');
        splitView?.classList.add('hidden');
        
        // Reset all tab styles
        [previewTab, codeTab, splitTab].forEach(tab => {
            if (tab) {
                tab.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
                tab.classList.add('text-gray-600', 'dark:text-gray-300');
            }
        });
        
        // Show/hide controls based on view
        if (view === 'code' || view === 'split') {
            editorThemeToggle?.classList.remove('hidden');
        } else {
            editorThemeToggle?.classList.add('hidden');
        }
        
        if (view === 'split') {
            splitControls?.classList.remove('hidden');
        } else {
            splitControls?.classList.add('hidden');
        }
        
        if (view === 'preview') {
            previewView?.classList.remove('hidden');
            previewTab?.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
            previewTab?.classList.remove('text-gray-600', 'dark:text-gray-300');
        } else if (view === 'code') {
            codeView?.classList.remove('hidden');
            codeTab?.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
            codeTab?.classList.remove('text-gray-600', 'dark:text-gray-300');
            this.loadCodeInEditor();
        } else if (view === 'split') {
            splitView?.classList.remove('hidden');
            splitTab?.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
            splitTab?.classList.remove('text-gray-600', 'dark:text-gray-300');
            this.loadCodeInSplitEditor();
            this.applySplitOrientation();
        }
    }
    
    toggleEditorTheme() {
        this.editorTheme = this.editorTheme === 'vs' ? 'vs-dark' : 'vs';
        localStorage.setItem('editorTheme', this.editorTheme);
        
        // Update main editor theme
        if (this.editor) {
            this.editor.updateOptions({ theme: this.editorTheme });
        }
        
        // Update split editor themes
        if (this.splitEditor) {
            this.splitEditor.updateOptions({ theme: this.editorTheme });
        }
        
        if (this.splitEditorVertical) {
            this.splitEditorVertical.updateOptions({ theme: this.editorTheme });
        }
    }
    
    initMonacoEditor() {
        if (typeof require !== 'undefined') {
            require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }});
            require(['vs/editor/editor.main'], () => {
                this.createEditor();
            });
        }
    }
    
    createEditor() {
        const editorContainer = document.getElementById('code-editor');
        if (editorContainer && this.currentComponent) {
            this.editor = monaco.editor.create(editorContainer, {
                value: this.currentComponent.html || '',
                language: 'html',
                theme: this.editorTheme,
                automaticLayout: true,
                minimap: { enabled: false },
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                scrollBeyondLastLine: false
            });
            
            // Add change listener for live preview
            this.editor.onDidChangeModelContent(() => {
                this.isComponentModified = true;
                this.updateLivePreview();
            });
        }
        
        // Initialize editor theme toggle
        const editorThemeToggle = document.getElementById('editor-theme-toggle');
        if (editorThemeToggle) {
            editorThemeToggle.addEventListener('click', () => {
                this.toggleEditorTheme();
            });
        }
    }
    
    loadCodeInEditor() {
        if (this.editor && this.currentComponent) {
            this.editor.setValue(this.currentComponent.html || '');
        }
    }
    
    loadCodeInSplitEditor() {
        // Create editors for the current orientation
        this.createSplitEditors();
        
        // Load content into the appropriate editor
        if (this.currentComponent) {
            if (this.splitOrientation === 'horizontal' && this.splitEditor) {
                this.splitEditor.setValue(this.currentComponent.html || '');
                this.splitEditor.updateOptions({ theme: this.editorTheme });
            } else if (this.splitOrientation === 'vertical' && this.splitEditorVertical) {
                this.splitEditorVertical.setValue(this.currentComponent.html || '');
                this.splitEditorVertical.updateOptions({ theme: this.editorTheme });
            }
        }
    }
    
    updateLivePreview() {
        if (this.currentView === 'split') {
            let code = '';
            let iframe = null;
            
            // Get code from the appropriate editor
            if (this.splitOrientation === 'horizontal' && this.splitEditor) {
                code = this.splitEditor.getValue();
                iframe = document.getElementById('split-component-frame');
            } else if (this.splitOrientation === 'vertical' && this.splitEditorVertical) {
                code = this.splitEditorVertical.getValue();
                iframe = document.getElementById('split-component-frame-vertical');
            }
            
            if (iframe && code) {
                // Store current scroll position
                try {
                    if (iframe.contentWindow && iframe.contentWindow.document) {
                        this.scrollPosition = iframe.contentWindow.scrollY || 0;
                    }
                } catch (e) {
                    // Cross-origin or not loaded yet
                }
                
                // Create a temporary HTML document with the updated code
                const tempDoc = `
                <!DOCTYPE html>
                <html lang="en" class="${this.currentTheme === 'dark' ? 'dark' : ''}">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Live Preview</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <script>
                        tailwind.config = {
                            darkMode: 'class',
                            theme: {
                                extend: {
                                    fontFamily: {
                                        sans: ['Inter', 'system-ui', 'sans-serif'],
                                    }
                                }
                            }
                        }
                        
                        // Restore scroll position after load
                        window.addEventListener('load', function() {
                            if (${this.scrollPosition} > 0) {
                                window.scrollTo(0, ${this.scrollPosition});
                            }
                        });
                    </script>
                    <style>
                        body {
                            font-family: 'Inter', system-ui, sans-serif;
                            /* Prevent flash of unstyled content */
                            opacity: 0;
                            transition: opacity 0.1s ease-in;
                        }
                        body.loaded {
                            opacity: 1;
                        }
                    </style>
                </head>
                <body class="bg-white dark:bg-gray-900 min-h-screen">
                    ${code}
                    <script>
                        // Mark as loaded to prevent flickering
                        document.body.classList.add('loaded');
                        
                        // Restore scroll position
                        if (${this.scrollPosition} > 0) {
                            window.scrollTo(0, ${this.scrollPosition});
                        }
                    </script>
                </body>
                </html>
                `;
                
                // Use a debounced update to reduce flickering
                clearTimeout(this.updateTimeout);
                this.updateTimeout = setTimeout(() => {
                    iframe.srcdoc = tempDoc;
                }, 150);
            }
        }
    }
    
    async copyCode() {
        let code = '';
        
        if (this.currentView === 'code' && this.editor) {
            code = this.editor.getValue();
        } else if (this.currentComponent) {
            code = this.currentComponent.html || '';
        }
        
        try {
            await navigator.clipboard.writeText(code);
            this.showToast('Code copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy code:', error);
            this.showToast('Failed to copy code', 'error');
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 transition-opacity duration-300 ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    updateComponentPreview() {
        const frames = [
            document.getElementById('component-frame'),
            document.getElementById('split-component-frame'),
            document.getElementById('split-component-frame-vertical')
        ];
        
        frames.forEach(frame => {
            if (frame && frame.src) {
                const url = new URL(frame.src);
                url.searchParams.set('theme', this.currentTheme);
                frame.src = url.toString();
            }
        });
    }
    
    async loadComponent(category, subcategory, component) {
        try {
            const response = await fetch(`api/component-data.php?category=${category}&subcategory=${subcategory}&component=${component}`);
            const data = await response.json();
            
            if (data.success) {
                this.currentComponent = data.component;
                this.updateComponentDisplay();
                this.updateURL({ category, subcategory, component });
            } else {
                console.error('Failed to load component:', data.message);
            }
        } catch (error) {
            console.error('Error loading component:', error);
        }
    }
    
    updateComponentDisplay() {
        // Update component frames
        this.updateComponentPreview();
        
        // Update editors if they exist
        if (this.editor) {
            this.editor.setValue(this.currentComponent.html || '');
        }
        
        if (this.splitEditor) {
            this.splitEditor.setValue(this.currentComponent.html || '');
        }
        
        if (this.splitEditorVertical) {
            this.splitEditorVertical.setValue(this.currentComponent.html || '');
        }
        
        // Update container widths
        this.updateContainerWidths();
        this.updateBreakpointDisplay();
    }
    
    // Split view methods
    initSplitView() {
        const horizontalSplit = document.getElementById('horizontal-split');
        const verticalSplit = document.getElementById('vertical-split');
        
        if (horizontalSplit) {
            horizontalSplit.addEventListener('click', () => this.setSplitOrientation('horizontal'));
        }
        
        if (verticalSplit) {
            verticalSplit.addEventListener('click', () => this.setSplitOrientation('vertical'));
        }
    }

    setSplitOrientation(orientation) {
        this.splitOrientation = orientation;
        localStorage.setItem('splitOrientation', orientation);
        
        // Update button states
        const horizontalBtn = document.getElementById('horizontal-split');
        const verticalBtn = document.getElementById('vertical-split');
        
        [horizontalBtn, verticalBtn].forEach(btn => {
            if (btn) {
                btn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
                btn.classList.add('text-gray-600', 'dark:text-gray-300');
            }
        });
        
        const activeBtn = orientation === 'horizontal' ? horizontalBtn : verticalBtn;
        if (activeBtn) {
            activeBtn.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
            activeBtn.classList.remove('text-gray-600', 'dark:text-gray-300');
        }

        this.applySplitOrientation();
    }

    applySplitOrientation() {
        const horizontalContainer = document.getElementById('horizontal-split-container');
        const verticalContainer = document.getElementById('vertical-split-container');
        
        if (this.splitOrientation === 'horizontal') {
            horizontalContainer?.classList.remove('hidden');
            horizontalContainer?.classList.add('flex', 'flex-col');
            verticalContainer?.classList.add('hidden');
            verticalContainer?.classList.remove('flex', 'flex-row');
        } else {
            verticalContainer?.classList.remove('hidden');
            verticalContainer?.classList.add('flex', 'flex-row');
            horizontalContainer?.classList.add('hidden');
            horizontalContainer?.classList.remove('flex', 'flex-col');
        }
        
        // Recreate editors for the active orientation
        this.createSplitEditors();
    }
    
    createSplitEditors() {
        // Check if Monaco is available
        if (typeof monaco === 'undefined') {
            console.warn('Monaco editor not available');
            return;
        }
        
        // Dispose of existing editors first
        if (this.splitEditor) {
            this.splitEditor.dispose();
            this.splitEditor = null;
        }
        
        if (this.splitEditorVertical) {
            this.splitEditorVertical.dispose();
            this.splitEditorVertical = null;
        }
        
        if (this.splitOrientation === 'horizontal') {
            // Create horizontal split editor
            const editorContainer = document.getElementById('split-code-editor');
            if (editorContainer) {
                try {
                    this.splitEditor = monaco.editor.create(editorContainer, {
                        value: this.currentComponent?.html || '',
                        language: 'html',
                        theme: this.editorTheme,
                        automaticLayout: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on'
                    });
                    
                    this.splitEditor.onDidChangeModelContent(() => {
                        this.isComponentModified = true;
                        this.updateLivePreview();
                    });
                } catch (error) {
                    console.error('Failed to create horizontal split editor:', error);
                }
            }
        } else {
            // Create vertical split editor
            const editorContainer = document.getElementById('split-code-editor-vertical');
            if (editorContainer) {
                try {
                    this.splitEditorVertical = monaco.editor.create(editorContainer, {
                        value: this.currentComponent?.html || '',
                        language: 'html',
                        theme: this.editorTheme,
                        automaticLayout: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on'
                    });
                    
                    this.splitEditorVertical.onDidChangeModelContent(() => {
                        this.isComponentModified = true;
                        this.updateLivePreview();
                    });
                } catch (error) {
                    console.error('Failed to create vertical split editor:', error);
                }
            }
        }
    }
    
    initResizers() {
        // Horizontal resizer
        const horizontalResizer = document.getElementById('horizontal-resizer');
        if (horizontalResizer) {
            this.initHorizontalResizer(horizontalResizer);
        }
        
        // Vertical resizer
        const verticalResizer = document.getElementById('vertical-resizer');
        if (verticalResizer) {
            this.initVerticalResizer(verticalResizer);
        }
    }
    
    initHorizontalResizer(resizer) {
        let isResizing = false;
        let startY = 0;
        let startTopHeight = 0;
        
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
            
            const container = document.getElementById('horizontal-split-container');
            if (!container) return;
            
            startY = e.clientY;
            const previewSection = document.getElementById('preview-section');
            
            if (previewSection) {
                const previewRect = previewSection.getBoundingClientRect();
                startTopHeight = previewRect.height;
            }
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const container = document.getElementById('horizontal-split-container');
            if (!container) return;
            
            const deltaY = e.clientY - startY;
            const containerRect = container.getBoundingClientRect();
            const newTopHeight = Math.max(containerRect.height * 0.2, Math.min(containerRect.height * 0.8, startTopHeight + deltaY));
            const percentage = (newTopHeight / containerRect.height) * 100;
            
            const previewSection = document.getElementById('preview-section');
            const codeSection = document.getElementById('code-section');
            
            if (previewSection && codeSection) {
                previewSection.style.flex = `0 0 ${newTopHeight}px`;
                codeSection.style.flex = `1 1 auto`;
                this.previewSectionSize = percentage.toString();
                localStorage.setItem('previewSectionSize', this.previewSectionSize);
            }
        });