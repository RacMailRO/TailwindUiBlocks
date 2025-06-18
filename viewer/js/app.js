/**
 * Main application JavaScript for Tailwind UI Blocks Viewer
 */

class TailwindUIViewer {
    constructor() {
        this.currentComponent = window.currentComponent || null;
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.currentBreakpoint = localStorage.getItem('breakpoint') || 'desktop';
        this.currentWidth = parseInt(localStorage.getItem('width')) || 1200;
        this.sidebarOpen = true;
        this.currentView = localStorage.getItem('view') || 'split';
        this.splitOrientation = localStorage.getItem('splitOrientation') || 'horizontal';
        this.editor = null;
        this.splitEditor = null;
        this.splitEditorVertical = null;
        this.editorTheme = localStorage.getItem('editorTheme') || 'vs-dark';
        this.scrollPosition = 0;
        this.isComponentModified = false;
        this.previewSectionSize = localStorage.getItem('previewSectionSize') || '50';
        
        this.init();
    }
    
    init() {
        this.initTheme();
        this.initEventListeners();
        this.initSidebar();
        this.initBreakpoints();
        this.initWidthAdjuster();
        this.initSearch();
        this.initMonacoEditor();
        this.initSplitView();
        this.initComponentActions();
        this.initResizers();
        this.restoreSettings();
        this.updateBreakpointDisplay();
    }
    
    restoreSettings() {
        // Restore width slider
        const widthSlider = document.getElementById('width-slider');
        if (widthSlider) {
            widthSlider.value = this.currentWidth;
        }
        
        // Restore breakpoint buttons
        this.updateBreakpointButtons();
        
        // Restore split orientation
        this.setSplitOrientation(this.splitOrientation);
        
        // Restore view
        this.switchView(this.currentView);
        
        // Update containers with saved width
        this.updateContainerWidths();
        
        // Restore split section sizes
        this.restoreSplitSizes();
        
        // Update component preview with saved theme
        this.updateComponentPreview();
    }
    
    restoreSplitSizes() {
        const size = parseFloat(this.previewSectionSize);
        
        // Restore horizontal split sizes
        const previewSection = document.getElementById('preview-section');
        const codeSection = document.getElementById('code-section');
        if (previewSection && codeSection) {
            previewSection.style.flex = `1 1 ${size}%`;
            codeSection.style.flex = `1 1 ${100 - size}%`;
        }
        
        // Restore vertical split sizes - use pixel-based approach for better control
        const previewSectionVertical = document.getElementById('preview-section-vertical');
        const codeSectionVertical = document.getElementById('code-section-vertical');
        if (previewSectionVertical && codeSectionVertical) {
            // Calculate pixel width based on container
            const container = document.getElementById('vertical-split-container');
            if (container) {
                const containerWidth = container.getBoundingClientRect().width;
                const previewWidth = (containerWidth * size) / 100;
                previewSectionVertical.style.flex = `0 0 ${previewWidth}px`;
                codeSectionVertical.style.flex = `1 1 auto`;
            }
        }
    }
    
    initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Apply saved theme
        if (this.currentTheme === 'dark') {
            document.documentElement.classList.add('dark');
        }
        
        // Update theme toggle icon
        this.updateThemeToggleIcon();
    }
    
    toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            this.currentTheme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            this.currentTheme = 'dark';
        }
        
        // Update component preview
        this.updateComponentPreview();
    }
    
    initEventListeners() {
        // Component link handlers
        this.initComponentLinks();
        
        // View toggle buttons
        const previewTab = document.getElementById('preview-tab');
        const codeTab = document.getElementById('code-tab');
        const splitTab = document.getElementById('split-tab');
        
        if (previewTab) {
            previewTab.addEventListener('click', () => this.switchView('preview'));
        }
        
        if (codeTab) {
            codeTab.addEventListener('click', () => this.switchView('code'));
        }
        
        if (splitTab) {
            splitTab.addEventListener('click', () => this.switchView('split'));
        }
        
        // Editor theme toggle
        const editorThemeToggle = document.getElementById('editor-theme-toggle');
        if (editorThemeToggle) {
            editorThemeToggle.addEventListener('click', () => this.toggleEditorTheme());
        }
        
        // Copy code button
        const copyButton = document.getElementById('copy-code');
        if (copyButton) {
            copyButton.addEventListener('click', () => this.copyCode());
        }
        
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
    }
    
    initSidebar() {
        // Subcategory toggles
        const subcategoryToggles = document.querySelectorAll('.subcategory-toggle');
        subcategoryToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = toggle.getAttribute('data-target');
                const target = document.getElementById(targetId);
                const icon = toggle.querySelector('svg');
                
                if (target) {
                    target.classList.toggle('hidden');
                    icon.style.transform = target.classList.contains('hidden') ? 
                        'rotate(0deg)' : 'rotate(180deg)';
                }
            });
        });
        
        // Auto-expand current category
        if (this.currentComponent) {
            const currentCategory = this.currentComponent.category;
            const currentSubcategory = this.currentComponent.subcategory;
            const targetId = `${currentCategory}-${currentSubcategory}`;
            const target = document.getElementById(targetId);
            
            if (target) {
                target.classList.remove('hidden');
                const toggle = document.querySelector(`[data-target="${targetId}"]`);
                if (toggle) {
                    const icon = toggle.querySelector('svg');
                    icon.style.transform = 'rotate(180deg)';
                }
            }
        }
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            if (this.sidebarOpen) {
                sidebar.style.transform = 'translateX(-100%)';
                this.sidebarOpen = false;
            } else {
                sidebar.style.transform = 'translateX(0)';
                this.sidebarOpen = true;
            }
        }
    }
    
    initBreakpoints() {
        const breakpointButtons = document.querySelectorAll('.breakpoint-btn');
        breakpointButtons.forEach(button => {
            button.addEventListener('click', () => {
                const breakpoint = button.getAttribute('data-breakpoint');
                const width = button.getAttribute('data-width');
                this.setBreakpoint(breakpoint, width);
            });
        });
    }
    
    setBreakpoint(breakpoint, width) {
        this.currentBreakpoint = breakpoint;
        this.currentWidth = parseInt(width);
        
        // Save to localStorage
        localStorage.setItem('breakpoint', this.currentBreakpoint);
        localStorage.setItem('width', this.currentWidth);
        
        // Update active button
        document.querySelectorAll('.breakpoint-btn').forEach(btn => {
            btn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
            btn.classList.add('text-gray-600', 'dark:text-gray-300');
        });
        
        const activeButton = document.querySelector(`[data-breakpoint="${breakpoint}"]`);
        if (activeButton) {
            activeButton.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
            activeButton.classList.remove('text-gray-600', 'dark:text-gray-300');
        }
        
        // Update width slider
        const widthSlider = document.getElementById('width-slider');
        if (widthSlider) {
            widthSlider.value = this.currentWidth;
        }
        
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
            document.getElementById('split-component-container')
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
            currentWidth.textContent = this.currentWidth + 'px';
        }
        
        if (widthDisplay) {
            widthDisplay.textContent = this.currentWidth + 'px';
        }
    }
    
    initSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });
        }
    }
    
    async performSearch(query) {
        if (!query.trim()) {
            // Show all components
            this.showAllComponents();
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
    
    showAllComponents() {
        // Show all subcategories and components
        document.querySelectorAll('[id*="-"]').forEach(element => {
            if (element.id.includes('-') && !element.classList.contains('subcategory-toggle')) {
                element.classList.add('hidden');
            }
        });
        
        document.querySelectorAll('.subcategory-toggle svg').forEach(icon => {
            icon.style.transform = 'rotate(0deg)';
        });
    }
    
    displaySearchResults(results) {
        // Hide all components first
        document.querySelectorAll('nav a').forEach(link => {
            link.style.display = 'none';
        });
        
        // Show matching components
        results.forEach(result => {
            const link = document.querySelector(`a[href*="category=${result.category}&subcategory=${result.subcategory}&component=${result.component}"]`);
            if (link) {
                link.style.display = 'block';
                // Expand parent subcategory
                const subcategoryId = `${result.category}-${result.subcategory}`;
                const subcategory = document.getElementById(subcategoryId);
                if (subcategory) {
                    subcategory.classList.remove('hidden');
                    const toggle = document.querySelector(`[data-target="${subcategoryId}"] svg`);
                    if (toggle) {
                        toggle.style.transform = 'rotate(180deg)';
                    }
                }
            }
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
                scrollBeyondLastLine: false,
                fontSize: 14,
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
            });
            
            // Update editor theme when theme changes
            this.editor.onDidChangeModelContent(() => {
                // Auto-save changes (optional)
                // this.saveComponentChanges();
            });
        }
    }
    
    createSplitEditor() {
        const splitEditorContainer = document.getElementById('split-code-editor');
        if (splitEditorContainer && this.currentComponent) {
            this.splitEditor = monaco.editor.create(splitEditorContainer, {
                value: this.currentComponent.html || '',
                language: 'html',
                theme: this.editorTheme,
                automaticLayout: true,
                minimap: { enabled: false },
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                scrollBeyondLastLine: false,
                fontSize: 14,
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
            });
            
            // Live update functionality with debouncing
            let updateTimeout;
            this.splitEditor.onDidChangeModelContent(() => {
                clearTimeout(updateTimeout);
                updateTimeout = setTimeout(() => {
                    this.updateLivePreview();
                }, 300);
            });
        }
    }
    
    loadCodeInEditor() {
        if (this.editor && this.currentComponent) {
            this.editor.setValue(this.currentComponent.html || '');
            this.editor.updateOptions({ theme: this.editorTheme });
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
        if (this.splitEditor && this.currentView === 'split') {
            const code = this.splitEditor.getValue();
            const iframe = document.getElementById('split-component-frame');
            
            if (iframe) {
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
        const iframe = document.getElementById('component-frame');
        const splitIframe = document.getElementById('split-component-frame');
        
        if (iframe && this.currentComponent) {
            const currentSrc = iframe.src;
            const url = new URL(currentSrc);
            url.searchParams.set('theme', this.currentTheme);
            iframe.src = url.toString();
        }
        
        if (splitIframe && this.currentComponent) {
            const currentSrc = splitIframe.src;
            const url = new URL(currentSrc);
            url.searchParams.set('theme', this.currentTheme);
            splitIframe.src = url.toString();
        }
        
        // Update theme toggle icon
        this.updateThemeToggleIcon();
    }
    
    updateThemeToggleIcon() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const sunIcon = themeToggle.querySelector('.sun-icon');
            const moonIcon = themeToggle.querySelector('.moon-icon');
            
            if (this.currentTheme === 'dark') {
                if (sunIcon) sunIcon.style.display = 'none';
                if (moonIcon) moonIcon.style.display = 'block';
            } else {
                if (sunIcon) sunIcon.style.display = 'block';
                if (moonIcon) moonIcon.style.display = 'none';
            }
        }
    }
    
    initComponentLinks() {
        // Handle component link clicks
        document.addEventListener('click', (e) => {
            const componentLink = e.target.closest('.component-link');
            if (componentLink) {
                e.preventDefault();
                
                const category = componentLink.dataset.category;
                const subcategory = componentLink.dataset.subcategory;
                const component = componentLink.dataset.component;
                
                this.loadComponent(category, subcategory, component);
            }
        });
    }
    
    async loadComponent(category, subcategory, component) {
        try {
            // Update active state in sidebar
            document.querySelectorAll('.component-link').forEach(link => {
                link.classList.remove('bg-blue-50', 'dark:bg-blue-900/20', 'text-blue-600', 'dark:text-blue-400');
            });
            
            const activeLink = document.querySelector(`.component-link[data-category="${category}"][data-subcategory="${subcategory}"][data-component="${component}"]`);
            if (activeLink) {
                activeLink.classList.add('bg-blue-50', 'dark:bg-blue-900/20', 'text-blue-600', 'dark:text-blue-400');
            }
            
            // Update iframes with current settings preserved
            const iframe = document.getElementById('component-frame');
            const splitIframe = document.getElementById('split-component-frame');
            
            const params = new URLSearchParams({
                category: category,
                subcategory: subcategory,
                component: component,
                theme: this.currentTheme,
                width: this.currentWidth,
                breakpoint: this.currentBreakpoint
            });
            
            const newSrc = `api/render.php?${params.toString()}`;
            
            if (iframe) {
                iframe.src = newSrc;
            }
            
            if (splitIframe) {
                splitIframe.src = newSrc;
            }
            
            // Load component data for code editor
            const response = await fetch(`api/component-data.php?category=${category}&subcategory=${subcategory}&component=${component}`);
            if (response.ok) {
                this.currentComponent = await response.json();
                this.updateCodeEditor();
            }
            
            // Update URL without page reload
            this.updateURL({
                category: category,
                subcategory: subcategory,
                component: component
            });
            
        } catch (error) {
            console.error('Error loading component:', error);
            this.showToast('Failed to load component', 'error');
        }
    }
    
    updateCodeEditor() {
        if (this.editor && this.currentComponent) {
            this.editor.setValue(this.currentComponent.html || '');
        }
        
        if (this.splitEditor && this.currentComponent) {
            this.splitEditor.setValue(this.currentComponent.html || '');
        }
        
        if (this.splitEditorVertical && this.currentComponent) {
            this.splitEditorVertical.setValue(this.currentComponent.html || '');
        }
    }
    
    initSplitView() {
        // Split orientation toggle
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
        
        const horizontalBtn = document.getElementById('horizontal-split');
        const verticalBtn = document.getElementById('vertical-split');
        
        // Update button states
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
        
        if (this.splitOrientation === 'horizontal') {
            // Create horizontal split editor
            if (!this.splitEditor && document.getElementById('split-code-editor')) {
                try {
                    this.splitEditor = monaco.editor.create(document.getElementById('split-code-editor'), {
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
            if (!this.splitEditorVertical && document.getElementById('split-code-editor-vertical')) {
                try {
                    this.splitEditorVertical = monaco.editor.create(document.getElementById('split-code-editor-vertical'), {
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
                previewSection.style.flex = `1 1 ${percentage}%`;
                codeSection.style.flex = `1 1 ${100 - percentage}%`;
                this.previewSectionSize = percentage.toString();
                localStorage.setItem('previewSectionSize', this.previewSectionSize);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }
    
    initVerticalResizer(resizer) {
        let isResizing = false;
        let startX = 0;
        let startLeftWidth = 0;
        
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            
            const container = document.getElementById('vertical-split-container');
            if (!container) return;
            
            startX = e.clientX;
            const previewSection = document.getElementById('preview-section-vertical');
            
            if (previewSection) {
                const previewRect = previewSection.getBoundingClientRect();
                startLeftWidth = previewRect.width;
            }
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const container = document.getElementById('vertical-split-container');
            if (!container) return;
            
            const deltaX = e.clientX - startX;
            const containerRect = container.getBoundingClientRect();
            const newLeftWidth = Math.max(containerRect.width * 0.2, Math.min(containerRect.width * 0.8, startLeftWidth + deltaX));
            const percentage = (newLeftWidth / containerRect.width) * 100;
            
            const previewSection = document.getElementById('preview-section-vertical');
            const codeSection = document.getElementById('code-section-vertical');
            
            if (previewSection && codeSection) {
                previewSection.style.flex = `0 0 ${newLeftWidth}px`;
                codeSection.style.flex = `1 1 auto`;
                this.previewSectionSize = percentage.toString();
                localStorage.setItem('previewSectionSize', this.previewSectionSize);
                
                // Update breakpoint and width display based on actual preview width
                this.updateBreakpointFromPreviewSize(newLeftWidth);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }
    
    updateLivePreview() {
        if (!this.currentComponent) return;
        
        let code = '';
        if (this.splitOrientation === 'horizontal' && this.splitEditor) {
            code = this.splitEditor.getValue();
        } else if (this.splitOrientation === 'vertical' && this.splitEditorVertical) {
            code = this.splitEditorVertical.getValue();
        }
        
        if (!code) return;
        
        // Update the appropriate iframe
        const iframe = this.splitOrientation === 'horizontal'
            ? document.getElementById('split-component-frame')
            : document.getElementById('split-component-frame-vertical');
            
        if (iframe) {
            // Store scroll position
            this.scrollPosition = iframe.contentWindow?.scrollY || 0;
            
            // Create updated document
            const tempDoc = `
                <!DOCTYPE html>
                <html lang="en" class="${this.currentTheme === 'dark' ? 'dark' : ''}">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Component Preview</title>
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
                        document.body.classList.add('loaded');
                        if (${this.scrollPosition} > 0) {
                            window.scrollTo(0, ${this.scrollPosition});
                        }
                    </script>
                </body>
                </html>
            `;
            
            // Debounced update
            clearTimeout(this.updateTimeout);
            this.updateTimeout = setTimeout(() => {
                iframe.srcdoc = tempDoc;
            }, 300);
        }
    }
    
    initComponentActions() {
        // Save component button
        const saveBtn = document.getElementById('save-component');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveComponent());
        }
        
        // Save as new component button
        const saveAsBtn = document.getElementById('save-as-component');
        if (saveAsBtn) {
            saveAsBtn.addEventListener('click', () => this.saveAsNewComponent());
        }
        
        // Modal controls
        const saveModal = document.getElementById('save-modal');
        const closeSaveModal = document.getElementById('close-save-modal');
        const cancelSave = document.getElementById('cancel-save');
        const saveForm = document.getElementById('save-component-form');
        
        if (closeSaveModal) {
            closeSaveModal.addEventListener('click', () => this.closeSaveModal());
        }
        
        if (cancelSave) {
            cancelSave.addEventListener('click', () => this.closeSaveModal());
        }
        
        if (saveForm) {
            saveForm.addEventListener('submit', (e) => this.handleSaveSubmit(e));
        }
        
        // Category change handler
        const categorySelect = document.getElementById('component-category');
        if (categorySelect) {
            categorySelect.addEventListener('change', () => this.updateSubcategoryOptions());
        }
    }
    
    saveComponent() {
        if (!this.currentComponent) {
            this.showToast('No component selected', 'error');
            return;
        }
        
        let code = this.getCurrentCode();
        if (!code) {
            this.showToast('No code to save', 'error');
            return;
        }
        
        // Save directly to current component
        this.performSave(
            this.currentComponent.metadata.category,
            this.currentComponent.metadata.subcategory,
            this.currentComponent.slug,
            code,
            this.currentComponent.metadata
        );
    }
    
    saveAsNewComponent() {
        const code = this.getCurrentCode();
        if (!code) {
            this.showToast('No code to save', 'error');
            return;
        }
        
        // Open save modal
        this.openSaveModal(false);
    }
    
    getCurrentCode() {
        if (this.currentView === 'code' && this.editor) {
            return this.editor.getValue();
        } else if (this.currentView === 'split') {
            if (this.splitOrientation === 'horizontal' && this.splitEditor) {
                return this.splitEditor.getValue();
            } else if (this.splitOrientation === 'vertical' && this.splitEditorVertical) {
                return this.splitEditorVertical.getValue();
            }
        }
        return '';
    }
    
    openSaveModal(isUpdate = false) {
        const modal = document.getElementById('save-modal');
        const title = document.getElementById('save-modal-title');
        
        if (title) {
            title.textContent = isUpdate ? 'Update Component' : 'Save as New Component';
        }
        
        // Populate form with current component data if available
        if (this.currentComponent) {
            document.getElementById('component-name').value = isUpdate ? this.currentComponent.metadata.name : '';
            document.getElementById('component-description').value = isUpdate ? this.currentComponent.metadata.description : '';
            document.getElementById('component-category').value = isUpdate ? this.currentComponent.metadata.category : 'marketing';
            document.getElementById('component-tags').value = isUpdate ? this.currentComponent.metadata.tags?.join(', ') : '';
            document.getElementById('component-responsive').checked = isUpdate ? this.currentComponent.metadata.responsive : true;
            document.getElementById('component-dark-mode').checked = isUpdate ? this.currentComponent.metadata.darkMode : true;
        }
        
        this.updateSubcategoryOptions();
        modal?.classList.remove('hidden');
    }
    
    closeSaveModal() {
        const modal = document.getElementById('save-modal');
        modal?.classList.add('hidden');
    }
    
    updateSubcategoryOptions() {
        const categorySelect = document.getElementById('component-category');
        const subcategorySelect = document.getElementById('component-subcategory');
        
        if (!categorySelect || !subcategorySelect) return;
        
        const subcategories = {
            'marketing': ['heroes', 'features', 'cta', 'testimonials', 'pricing'],
            'application-ui': ['forms', 'navigation', 'data-display', 'feedback', 'overlays'],
            'ecommerce': ['product-display', 'shopping-cart', 'checkout', 'reviews']
        };
        
        const category = categorySelect.value;
        const options = subcategories[category] || [];
        
        subcategorySelect.innerHTML = '';
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ');
            subcategorySelect.appendChild(optionElement);
        });
        
        // Set current subcategory if updating
        if (this.currentComponent) {
            subcategorySelect.value = this.currentComponent.metadata.subcategory;
        }
    }
    
    async handleSaveSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const code = this.getCurrentCode();
        
        if (!code) {
            this.showToast('No code to save', 'error');
            return;
        }
        
        const metadata = {
            name: formData.get('name'),
            description: formData.get('description'),
            category: formData.get('category'),
            subcategory: formData.get('subcategory'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
            responsive: formData.has('responsive'),
            darkMode: formData.has('darkMode'),
            dependencies: ['tailwindcss'],
            version: '1.0.0',
            author: 'TailwindUI Blocks'
        };
        
        // Generate slug from name
        const slug = metadata.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        
        await this.performSave(metadata.category, metadata.subcategory, slug, code, metadata);
        this.closeSaveModal();
    }
    
    async performSave(category, subcategory, slug, code, metadata) {
        try {
            const response = await fetch('api/save-component.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category,
                    subcategory,
                    slug,
                    code,
                    metadata
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showToast('Component saved successfully!', 'success');
                this.isComponentModified = false;
                
                // Reload sidebar to show new component
                location.reload();
            } else {
                this.showToast(result.error || 'Failed to save component', 'error');
            }
        } catch (error) {
            console.error('Save error:', error);
            this.showToast('Failed to save component', 'error');
        }
    }
    
    updateBreakpointFromPreviewSize(previewWidth) {
        // Determine breakpoint based on actual preview width
        let newBreakpoint = 'desktop';
        let newWidth = Math.round(previewWidth);
        
        if (previewWidth <= 480) {
            newBreakpoint = 'mobile';
            newWidth = Math.min(newWidth, 480);
        } else if (previewWidth <= 768) {
            newBreakpoint = 'tablet';
            newWidth = Math.min(newWidth, 768);
        } else {
            newBreakpoint = 'desktop';
            newWidth = Math.max(newWidth, 768);
        }
        
        // Update current state
        this.currentBreakpoint = newBreakpoint;
        this.currentWidth = newWidth;
        
        // Save to localStorage
        localStorage.setItem('breakpoint', this.currentBreakpoint);
        localStorage.setItem('width', this.currentWidth.toString());
        
        // Update UI elements
        this.updateBreakpointButtons();
        this.updateBreakpointDisplay();
        this.updateWidthSlider();
    }
    
    updateBreakpointButtons() {
        const buttons = document.querySelectorAll('.breakpoint-btn');
        buttons.forEach(btn => {
            btn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
            btn.classList.add('text-gray-600', 'dark:text-gray-300');
            
            if (btn.dataset.breakpoint === this.currentBreakpoint) {
                btn.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
                btn.classList.remove('text-gray-600', 'dark:text-gray-300');
            }
        });
    }
    
    updateWidthSlider() {
        const widthSlider = document.getElementById('width-slider');
        if (widthSlider) {
            widthSlider.value = this.currentWidth;
        }
        
        const widthDisplay = document.getElementById('width-display');
        if (widthDisplay) {
            widthDisplay.textContent = `${this.currentWidth}px`;
        }
    }
    
    updateURL(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            url.searchParams.set(key, params[key]);
        });
        window.history.replaceState({}, '', url);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tailwindUIViewer = new TailwindUIViewer();
});

// Handle responsive sidebar on window resize
window.addEventListener('resize', () => {
    if (window.tailwindUIViewer && window.innerWidth >= 1024) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.transform = 'translateX(0)';
            window.tailwindUIViewer.sidebarOpen = true;
        }
    }
});