
import * as Utils from './modules/utils.js';
import { initTheme, updateThemeToggleIcon } from './modules/theme.js';
import { initSidebar, initComponentLinks } from './modules/sidebar.js';
import { initFavorites } from './modules/favorites.js';
import { initSearch } from './modules/search.js';
import { initBreakpoints, initWidthAdjuster, updateContainerWidths, updateBreakpointDisplay, updateBreakpointButtons } from './modules/responsive.js';
import { initViewControls, switchView } from './modules/viewManager.js';
import { initMonacoEditor, updateCodeEditor, loadCodeInEditor, toggleEditorTheme } from './modules/editor.js';
import { initSplitView, applySplitOrientation, loadCodeInSplitEditor, updateLivePreview } from './modules/splitView.js';
import { initComponentActions } from './modules/componentActions.js';

export class TailwindUIViewer {
    constructor() {
        // Assign utilities to the instance for easy access
        Object.assign(this, Utils);

        // State properties
        this.currentComponent = window.currentComponent || null;
        this.sidebarOpen = true;
        this.editor = null;
        this.splitEditor = null;
        this.splitEditorVertical = null;
        this.favorites = [];
        
        // State from localStorage
        this.currentTheme = this.safeLocalStorageGetItem('theme', 'light');
        this.currentBreakpoint = this.safeLocalStorageGetItem('breakpoint', 'desktop');
        this.currentWidth = parseInt(this.safeLocalStorageGetItem('width', '1200'));
        this.currentView = this.safeLocalStorageGetItem('view', 'split');
        this.splitOrientation = this.safeLocalStorageGetItem('splitOrientation', 'horizontal');
        this.editorTheme = this.safeLocalStorageGetItem('editorTheme', 'vs-dark');

        this.init();
    }
    
    init() {
        // Initialize all features by calling functions from modules
        initTheme(this);
        initSidebar(this);
        initComponentLinks(this);
        initFavorites(this);
        initSearch(this);
        initBreakpoints(this);
        initWidthAdjuster(this);
        initViewControls(this);
        initComponentActions(this);
        initMonacoEditor(this);
        initSplitView(this);
        
        this.restoreSettings();
    }
    
    restoreSettings() {
        const widthSlider = document.getElementById('width-slider');
        if (widthSlider) widthSlider.value = this.currentWidth;
        
        updateBreakpointButtons(this);
        this.switchView(this.currentView, true); // Pass flag to avoid saving state again
        updateContainerWidths(this);
        updateBreakpointDisplay(this);
        this.updateComponentPreview();
    }

    // --- Core Orchestration Methods ---
    
    async loadComponent(category, subcategory, component) {
        try {
            document.querySelectorAll('.component-link').forEach(link => link.classList.remove('bg-blue-50', 'dark:bg-blue-900/20'));
            const activeLink = document.querySelector(`.component-link[data-category="${category}"][data-subcategory="${subcategory}"][data-component="${component}"]`);
            activeLink?.classList.add('bg-blue-50', 'dark:bg-blue-900/20');

            const response = await fetch(`api/component-data.php?category=${category}&subcategory=${subcategory}&component=${component}`);
            this.currentComponent = response.ok ? await response.json() : null;

            if (!this.currentComponent) this.showToast('Error loading component data.', 'error');
            
            this.updateComponentPreview();
            this.updateCodeEditor();
            this.updateURL({ category, subcategory, component });

        } catch (error) {
            console.error('Error loading component:', error);
            this.showToast('Failed to load component.', 'error');
        }
    }

    updateComponentPreview() {
        const params = new URLSearchParams({
            category: this.currentComponent?.category,
            subcategory: this.currentComponent?.subcategory,
            component: this.currentComponent?.slug,
            theme: this.currentTheme
        }).toString();
        const newSrc = `api/render.php?${params}`;

        if (this.currentComponent) {
            document.getElementById('component-frame').src = newSrc;
            document.getElementById('split-component-frame').src = newSrc;
            document.getElementById('split-component-frame-vertical').src = newSrc;
        }
        updateThemeToggleIcon(this);
    }

    // --- Pass-through methods to modules for external access or convenience ---
    switchView(view) { switchView(this, view); }
    toggleEditorTheme() { toggleEditorTheme(this); }
    loadCodeInEditor() { loadCodeInEditor(this); }
    loadCodeInSplitEditor() { loadCodeInSplitEditor(this); }
    applySplitOrientation() { applySplitOrientation(this); }
    updateLivePreview() { updateLivePreview(this); }
    updateCodeEditor() { updateCodeEditor(this); }
}