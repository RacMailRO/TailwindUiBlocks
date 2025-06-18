/**
 * UI management functions for Tailwind UI Viewer
 */
import { safeLocalStorageSetItem, showToast } from './utils.js'; // showToast might be used by some UI actions

// State that might be needed by UI functions, passed from main app instance
// let appInstance = null;

// export function initUIManager(instance) {
// appInstance = instance;
// }

export function initTheme(app) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => toggleTheme(app));
    }

    if (app.currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }
    updateThemeToggleIcon(app);
}

export function toggleTheme(app) {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
        document.documentElement.classList.remove('dark');
        safeLocalStorageSetItem('theme', 'light');
        app.currentTheme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        safeLocalStorageSetItem('theme', 'dark');
        app.currentTheme = 'dark';
    }
    app.updateComponentPreview(); // Assumes appInstance has this method
    updateThemeToggleIcon(app);
}

export function updateThemeToggleIcon(app) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const sunIcon = themeToggle.querySelector('.sun-icon');
        const moonIcon = themeToggle.querySelector('.moon-icon');
        if (app.currentTheme === 'dark') {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
        } else {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
        }
    }
}

export function initSidebar(app) {
    const subcategoryToggles = document.querySelectorAll('.subcategory-toggle');
    subcategoryToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = toggle.getAttribute('data-target');
            const target = document.getElementById(targetId);
            const icon = toggle.querySelector('svg');
            if (target) {
                target.classList.toggle('hidden');
                icon.style.transform = target.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });
    });

    if (app.currentComponent) {
        const currentCategory = app.currentComponent.category;
        const currentSubcategory = app.currentComponent.subcategory;
        // Favorites list is also a subcategory-toggle target, handle if it's the current one.
        if (currentCategory && currentSubcategory) {
             const targetId = `${currentCategory}-${currentSubcategory}`;
             const target = document.getElementById(targetId);
             if (target) {
                 target.classList.remove('hidden');
                 const toggle = document.querySelector(`[data-target="${targetId}"]`);
                 if (toggle) {
                     const icon = toggle.querySelector('svg');
                     if (icon) icon.style.transform = 'rotate(180deg)';
                 }
             }
        } else if (currentCategory === 'favorites') { // Example: if favorites could be "current"
            const target = document.getElementById('favorites-list-content');
            if (target && target.classList.contains('hidden')) { // Only toggle if it's actually hidden
                 const toggle = document.querySelector(`[data-target="favorites-list-content"]`);
                 if (toggle) {
                    target.classList.remove('hidden');
                    const icon = toggle.querySelector('svg');
                    if (icon) icon.style.transform = 'rotate(180deg)';
                 }
            }
        }
    }
     // Ensure favorites list is open by default or based on a setting if desired
    const favoritesListContent = document.getElementById('favorites-list-content');
    const favoritesToggle = document.querySelector('button.subcategory-toggle[data-target="favorites-list-content"]');
    if (favoritesListContent && favoritesToggle && favoritesListContent.classList.contains('hidden')) {
        // By default, let's assume it should be open, or implement a localStorage setting for its state
        // favoritesListContent.classList.remove('hidden');
        // const favIcon = favoritesToggle.querySelector('svg');
        // if (favIcon) favIcon.style.transform = 'rotate(180deg)';
    }


    // Responsive sidebar toggle
     const sidebarToggle = document.getElementById('sidebar-toggle');
     if (sidebarToggle) {
         sidebarToggle.addEventListener('click', () => toggleSidebar(app));
     }
      // Handle responsive sidebar on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) { // lg breakpoint
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.style.transform = 'translateX(0)';
                app.sidebarOpen = true;
            }
        }
    });
}

export function toggleSidebar(app) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        if (app.sidebarOpen) {
            sidebar.style.transform = 'translateX(-100%)';
            app.sidebarOpen = false;
        } else {
            sidebar.style.transform = 'translateX(0)';
            app.sidebarOpen = true;
        }
    }
}

export function updateBreakpointDisplay(app) {
    const currentBreakpointEl = document.getElementById('current-breakpoint');
    const currentWidthEl = document.getElementById('current-width');
    const widthDisplay = document.getElementById('width-display'); // For the slider

    if (currentBreakpointEl) {
        currentBreakpointEl.textContent = app.currentBreakpoint.charAt(0).toUpperCase() + app.currentBreakpoint.slice(1);
    }
    if (currentWidthEl) {
        currentWidthEl.textContent = app.currentWidth + 'px';
    }
    if (widthDisplay) {
        widthDisplay.textContent = app.currentWidth + 'px';
    }
}

export function updateBreakpointButtons(app) {
    document.querySelectorAll('.breakpoint-btn').forEach(btn => {
        btn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
        btn.classList.add('text-gray-600', 'dark:text-gray-300');
    });
    const activeButton = document.querySelector(`[data-breakpoint="${app.currentBreakpoint}"]`);
    if (activeButton) {
        activeButton.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
        activeButton.classList.remove('text-gray-600', 'dark:text-gray-300');
    }
}

export function updateWidthSlider(app) {
    const widthSlider = document.getElementById('width-slider');
    if (widthSlider) {
        widthSlider.value = app.currentWidth;
    }
    // width-display is updated by updateBreakpointDisplay
}


export function switchView(app, view) {
    app.currentView = view;
    safeLocalStorageSetItem('view', view);

    const previewView = document.getElementById('preview-view');
    const codeView = document.getElementById('code-view');
    const splitView = document.getElementById('split-view');
    const examplesView = document.getElementById('examples-view');

    const previewTab = document.getElementById('preview-tab');
    const codeTab = document.getElementById('code-tab');
    const splitTab = document.getElementById('split-tab');
    const examplesTab = document.getElementById('examples-tab');

    const editorThemeToggle = document.getElementById('editor-theme-toggle');
    const splitControls = document.getElementById('split-controls');

    [previewView, codeView, splitView, examplesView].forEach(v => v?.classList.add('hidden'));
    [previewTab, codeTab, splitTab, examplesTab].forEach(tab => {
        if (tab) {
            tab.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
            tab.classList.add('text-gray-600', 'dark:text-gray-300');
        }
    });

    if (view === 'code' || view === 'split' || view === 'examples') {
        editorThemeToggle?.classList.remove('hidden');
    } else {
        editorThemeToggle?.classList.add('hidden');
    }

    if (view === 'split') {
        splitControls?.classList.remove('hidden');
    } else {
        splitControls?.classList.add('hidden');
    }

    const viewElementMap = {
        'preview': previewView,
        'code': codeView,
        'split': splitView,
        'examples': examplesView
    };
    const tabElementMap = {
        'preview': previewTab,
        'code': codeTab,
        'split': splitTab,
        'examples': examplesTab
    };

    viewElementMap[view]?.classList.remove('hidden');
    if (tabElementMap[view]) {
        tabElementMap[view].classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-900', 'dark:text-white', 'shadow-sm');
        tabElementMap[view].classList.remove('text-gray-600', 'dark:text-gray-300');
    }


    if (view === 'code') app.loadCodeInEditor(); // Assumes app has this method
    else if (view === 'split') {
        app.loadCodeInSplitEditor(); // Assumes app has this method
        app.applySplitOrientation(); // Assumes app has this method
    } else if (view === 'examples') {
        app.renderComponentExamples(); // Assumes app has this method
    }
}

export function initGlobalEventListeners(app) {
    // View toggle buttons
    const previewTab = document.getElementById('preview-tab');
    const codeTab = document.getElementById('code-tab');
    const splitTab = document.getElementById('split-tab');
    const examplesTab = document.getElementById('examples-tab');

    if (previewTab) previewTab.addEventListener('click', () => switchView(app, 'preview'));
    if (codeTab) codeTab.addEventListener('click', () => switchView(app, 'code'));
    if (splitTab) splitTab.addEventListener('click', () => switchView(app, 'split'));
    if (examplesTab) examplesTab.addEventListener('click', () => switchView(app, 'examples'));

    // Editor theme toggle - This might move to editor.js if it solely impacts editor
    const editorThemeToggle = document.getElementById('editor-theme-toggle');
    if (editorThemeToggle) editorThemeToggle.addEventListener('click', () => app.toggleEditorTheme()); // Assumes app has toggleEditorTheme

    // Copy code button - This might move to componentManager.js or editor.js
    const copyButton = document.getElementById('copy-code');
    if (copyButton) copyButton.addEventListener('click', () => app.copyCode()); // Assumes app has copyCode

    // Download HTML button - This might move to componentManager.js
    const downloadButton = document.getElementById('download-html');
    if (downloadButton) downloadButton.addEventListener('click', () => app.downloadComponentHtml()); // Assumes app has downloadComponentHtml
}

// Note: `initComponentLinks` is more related to component management.
// `initBreakpoints`, `initWidthAdjuster` are more component/preview related.
// `initSearch` is component/search related.
// `initMonacoEditor` is editor related.
// `initSplitView`, `initResizers` are split/resize related.
// `initComponentActions` is component action related.
// `initFavorites` is favorites related.
// `restoreSettings` is local storage related.
// These will be handled in their respective modules or the main app.js orchestration.
// The `initEventListeners` in the original app.js was a grab bag; we'll distribute these.
// The `DOMContentLoaded` and window `resize` for sidebar are handled here or in main.js.
// The main `TailwindUIViewer` class's `init` method will call these smaller init functions.
// `updateComponentPreview` is called by `toggleTheme` and `loadComponent`, so it's more of a core app method.
// `updateURL` is a utility.
// `showToast` is a utility.
// `safeLocalStorageSetItem/GetItem` are utilities.
// `generateFullHtmlForContent` is a utility.
// `downloadComponentHtml` is component related.
// `renderComponentExamples` is component related.
// `copyCode` is component/editor related.
// `updateContainerWidths` is component/breakpoint related.
// `updateBreakpointFromWidth` is component/breakpoint related.
// `updateBreakpointFromPreviewSize` is component/breakpoint related.
// `setBreakpoint` is component/breakpoint related.

// The `initEventListeners` from the original `app.js` needs to be broken down.
// Some parts are now in `initGlobalEventListeners`.
// Others like component link clicks will be in `componentManager.js`.
// Breakpoint button clicks in `componentManager.js`.
// Width slider input in `componentManager.js`.
// Search input in `componentManager.js`.
// Split orientation clicks in `splitResizer.js`.
// Save/Save As clicks in `componentManager.js`.
// Modal controls in `componentManager.js`.
// Favorite toggles in `favorites.js`.
// Subcategory toggles are in `initSidebar`.
// Sidebar toggle is in `initSidebar`.
// Theme toggle is in `initTheme`.
// Editor theme toggle is in `initGlobalEventListeners` (calls app.toggleEditorTheme).
// Copy code is in `initGlobalEventListeners` (calls app.copyCode).
// Download HTML is in `initGlobalEventListeners` (calls app.downloadComponentHtml).
// Resizer mousedown/move/up events in `splitResizer.js`.
// Monaco editor events (onDidChangeModelContent) in `editor.js`.

// Global event listeners that don't fit neatly into other modules can be initialized here.
// For example, the main view tabs (Preview, Code, Split, Examples) are handled by `initGlobalEventListeners`.
// The main sidebar toggle (for mobile) is handled by `initSidebar`.
// The theme toggle is handled by `initTheme`.

// The `app` parameter passed to these functions is the instance of `TailwindUIViewer` from `main.js`.
// This allows these UI functions to access and modify the application's state (e.g., `app.currentTheme`)
// and to call other methods on the main app instance if necessary (e.g., `app.updateComponentPreview()`).
// This pattern is a form of dependency injection.
// An alternative would be to use a more formal state management solution or event bus,
// but for this scale, passing the app instance is often sufficient.

// The `initEventListeners` method from the original `app.js` was very broad.
// I've created `initGlobalEventListeners` in `ui.js` for event listeners that primarily control UI aspects
// like view switching and editor theme toggling (though the actual theme change logic for the editor itself
// will be in `editor.js`, `toggleEditorTheme` in `ui.js` would call a method on the editor module via the app instance).
// Other event listeners are more tightly coupled to specific modules:
// - Component link clicks -> `componentManager.js`
// - Breakpoint buttons, width slider -> `componentManager.js`
// - Search input -> `componentManager.js`
// - Split orientation buttons -> `splitResizer.js`
// - Save buttons, modal interactions -> `componentManager.js`
// - Favorite toggles -> `favorites.js`
// - Monaco editor internal events -> `editor.js`
// - Resizer mouse events -> `splitResizer.js`

// `updateThemeToggleIcon`, `initSidebar`, `toggleSidebar`, `updateBreakpointDisplay`,
// `updateBreakpointButtons`, `updateWidthSlider`, `switchView` are good candidates for ui.js.
// `initTheme` and `toggleTheme` are also good for ui.js.
// `initEventListeners` from original app.js will be broken apart.
// Parts of it will go into `initGlobalEventListeners(app)` here in `ui.js`.
// Other parts will be `init...EventListeners` in their respective modules.
// For example, `componentManager.js` will have its own `initComponentLinkEventListeners(app)`.

// The `constructor` in `main.js` will call `initTheme(this)`, `initSidebar(this)`, `initGlobalEventListeners(this)`, etc.
// And then `componentManager.initEventListeners(this)`, `editor.initEventListeners(this)` and so on.
// The `this.init()` in `main.js` will become a series of calls to these module initializers.

// The `window.addEventListener('resize', ...)` for the sidebar is now part of `initSidebar`.
// The `document.addEventListener('DOMContentLoaded', ...)` will remain in `main.js` to create the `TailwindUIViewer` instance.
// The `TailwindUIViewer` constructor will then call all the necessary init functions from the modules.
