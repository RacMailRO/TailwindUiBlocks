
import * as Utils from './modules/utils.js';
import { initTheme, updateThemeToggleIcon } from './modules/theme.js';
import { initSidebar, initComponentLinks } from './modules/sidebar.js';
import { initFavorites } from './modules/favorites.js';
import { initSearch } from './modules/search.js';
import { initBreakpoints, initWidthAdjuster, updateContainerWidths, updateBreakpointDisplay, updateBreakpointButtons } from './modules/responsive.js';
import { initViewControls, switchView } from './modules/viewManager.js';
import { initMonacoEditor, updateCodeEditor, loadCodeInEditor, toggleEditorTheme } from './modules/editor.js';
import { initSplitView, applySplitOrientation, loadCodeInSplitEditor, updateLivePreview } from './modules/splitView.js';


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
        initMonacoEditor(this);
        initSplitView(this);

        this.restoreSettings();
        this.initComponentActions();
    }

    restoreSettings() {
        const widthSlider = document.getElementById('width-slider');
        if (widthSlider) widthSlider.value = this.currentWidth;

        updateBreakpointButtons(this);
        this.switchView(this.currentView, true); // Pass flag to avoid saving state again
        updateContainerWidths(this);
        updateBreakpointDisplay(this);

        if (this.currentComponent) {
            this.switchView(this.currentView);
        } else {
            // If NO component is loaded, default to showing the welcome screen.
            // Ensure all other views are hidden, overriding any localStorage setting.
            // We can do this by explicitly telling switchView to go to a "none" state
            // or by manually hiding them. Let's create a simple 'showWelcome' state.
            this.showWelcomeScreen();
        }
    }
    showWelcomeScreen() {
        document.getElementById('welcome-screen')?.classList.remove('hidden');
        document.getElementById('breakpoint-info')?.classList.add('hidden');

        // Hide all main view containers
        document.getElementById('preview-view')?.classList.add('hidden');
        document.getElementById('code-view')?.classList.add('hidden');
        document.getElementById('split-view')?.classList.add('hidden');
        document.getElementById('examples-view')?.classList.add('hidden');

        // It's also good practice to reset the view tabs to a neutral state
        const tabs = ['preview-tab', 'code-tab', 'split-tab', 'examples-tab'];
        tabs.forEach(tabId => {
            const tab = document.getElementById(tabId);
            if (tab) {
                tab.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
                tab.classList.add('text-gray-600', 'dark:text-gray-300');
            }
        });
    }

    // --- Core Orchestration Methods ---

    async loadComponent(category, subcategory, component) {
        try {

            this.showWelcomeScreen();

            document.getElementById('welcome-screen')?.classList.add('hidden');
            document.getElementById('breakpoint-info')?.classList.remove('hidden');

            document.querySelectorAll('.component-link').forEach(link => link.classList.remove('bg-blue-50', 'dark:bg-blue-900/20'));
            const activeLink = document.querySelector(`.component-link[data-category="${category}"][data-subcategory="${subcategory}"][data-component="${component}"]`);
            activeLink?.classList.add('bg-blue-50', 'dark:bg-blue-900/20');

            const response = await fetch(`api/component-data.php?category=${category}&subcategory=${subcategory}&component=${component}`);
            this.currentComponent = response.ok ? await response.json() : null;

            if (!this.currentComponent) this.showToast('Error loading component data.', 'error');

            this.updateComponentPreview();
            this.updateCodeEditor();
            this.updateURL({ category, subcategory, component });

            this.switchView(this.currentView);

        } catch (error) {
            console.error('Error loading component:', error);
            this.showToast('Failed to load component.', 'error');
            this.showWelcomeScreen(); // Re-show welcome screen on failure
        }
    }

    updateComponentPreview() {
        if (!this.currentComponent) return; // Important check!

        const params = new URLSearchParams({
            category: this.currentComponent.category,
            subcategory: this.currentComponent.subcategory,
            component: this.currentComponent.slug,
            theme: this.currentTheme
        }).toString();
        const newSrc = `api/render.php?${params}`;

        // Get all potential iframes and update them if they exist
        const frame1 = document.getElementById('component-frame');
        const frame2 = document.getElementById('split-component-frame');
        const frame3 = document.getElementById('split-component-frame-vertical');

        if (frame1) frame1.src = newSrc;
        if (frame2) frame2.src = newSrc;
        if (frame3) frame3.src = newSrc;

        updateThemeToggleIcon(this);
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

    // --- Pass-through methods to modules for external access or convenience ---
    switchView(view) { switchView(this, view); }
    toggleEditorTheme() { toggleEditorTheme(this); }
    loadCodeInEditor() { loadCodeInEditor(this); }
    loadCodeInSplitEditor() { loadCodeInSplitEditor(this); }
    applySplitOrientation() { applySplitOrientation(this); }
    updateLivePreview() { updateLivePreview(this); }
    updateCodeEditor() { updateCodeEditor(this); }
}