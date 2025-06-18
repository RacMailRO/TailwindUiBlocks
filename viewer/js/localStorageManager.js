/**
 * localStorage management for loading and applying settings.
 */
import { safeLocalStorageGetItem } from './utils.js';
// UI update functions will be called via app instance methods or by importing them directly if they become standalone
// For now, assuming app instance has methods or we call ui.js functions via app
// Example: import { updateBreakpointButtons, updateWidthSlider, updateBreakpointDisplay, switchView } from './ui.js';
// Example: import { setSplitOrientation, restoreSplitSizes } from './splitResizer.js';


/**
 * Restores application settings from localStorage and applies them.
 * This function assumes that the initial values (e.g., app.currentTheme, app.currentBreakpoint)
 * have already been loaded from localStorage in the main app constructor using safeLocalStorageGetItem.
 * This function's main role is to APPLY these loaded settings to the UI and other parts of the app.
 * @param {object} app - The main application instance.
 */
export function applyRestoredSettings(app) {
    // Apply theme (dark class on html) - This is typically handled by ui.js's initTheme based on app.currentTheme
    // No direct action here if initTheme already does it.

    // Apply breakpoint and width to UI elements by calling UI update functions
    // These functions should exist in ui.js and be callable via app or imported.
    if (typeof app.uiModule?.updateBreakpointButtons === 'function') app.uiModule.updateBreakpointButtons(app);
    else if (typeof app.updateBreakpointButtons === 'function') app.updateBreakpointButtons(app); // Fallback if still on app

    if (typeof app.uiModule?.updateWidthSlider === 'function') app.uiModule.updateWidthSlider(app);
    else if (typeof app.updateWidthSlider === 'function') app.updateWidthSlider(app);

    if (typeof app.uiModule?.updateBreakpointDisplay === 'function') app.uiModule.updateBreakpointDisplay(app);
    else if (typeof app.updateBreakpointDisplay === 'function') app.updateBreakpointDisplay(app);

    // Apply split orientation
    // Assumes setSplitOrientation is available, possibly from splitResizer.js module via app
    if (typeof app.splitResizerModule?.setSplitOrientation === 'function') {
        app.splitResizerModule.setSplitOrientation(app, app.splitOrientation);
    } else if (typeof app.setSplitOrientation === 'function') { // Fallback
        app.setSplitOrientation(app.splitOrientation);
    } else {
        console.warn('setSplitOrientation function not found for restoring settings.');
    }

    // Apply view
    // Assumes switchView is available, possibly from ui.js module via app
    if (typeof app.uiModule?.switchView === 'function') {
        app.uiModule.switchView(app, app.currentView);
    } else if (typeof app.switchView === 'function') { // Fallback
        app.switchView(app.currentView);
    } else {
        console.warn('switchView function not found for restoring settings.');
    }

    // Apply container widths based on current breakpoint/width
    // Assumes updateContainerWidths is available, possibly from componentManager.js module via app
     if (typeof app.componentManagerModule?.updateContainerWidths === 'function') {
        app.componentManagerModule.updateContainerWidths(app);
    } else if (typeof app.updateContainerWidths === 'function') { // Fallback
        app.updateContainerWidths();
    } else {
        console.warn('updateContainerWidths function not found for restoring settings.');
    }

    // Apply split section sizes
    // Assumes restoreSplitSizes is available, possibly from splitResizer.js module via app
    if (typeof app.splitResizerModule?.restoreSplitSizes === 'function') {
        app.splitResizerModule.restoreSplitSizes(app);
    } else if (typeof app.restoreSplitSizes === 'function') { // Fallback
        app.restoreSplitSizes();
    } else {
        console.warn('restoreSplitSizes function not found for restoring settings.');
    }

    // Update component preview iframes based on current theme and component
    // This is likely a core app method that might itself call editor/component specific updates
    if (typeof app.updateComponentPreview === 'function') {
        app.updateComponentPreview();
    } else {
        console.warn('updateComponentPreview function not found for restoring settings.');
    }

    // Ensure the theme toggle icon is correctly set after all restorations
    if (typeof app.uiModule?.updateThemeToggleIcon === 'function') {
        app.uiModule.updateThemeToggleIcon(app);
    } else if (typeof app.updateThemeToggleIcon === 'function') { // Fallback
        app.updateThemeToggleIcon();
    }
}

/**
 * Loads all relevant settings from localStorage into the app's state.
 * This is typically called once at application startup (e.g., in the constructor of the main app class).
 * @param {object} app - The main application instance.
 */
export function loadSettingsFromLocalStorage(app) {
    app.currentTheme = safeLocalStorageGetItem('theme', 'light');
    app.currentBreakpoint = safeLocalStorageGetItem('breakpoint', 'desktop');
    app.currentWidth = parseInt(safeLocalStorageGetItem('width', '1200'));
    app.currentView = safeLocalStorageGetItem('view', 'split');
    app.splitOrientation = safeLocalStorageGetItem('splitOrientation', 'horizontal');
    app.editorTheme = safeLocalStorageGetItem('editorTheme', 'vs-dark');
    app.previewSectionSize = safeLocalStorageGetItem('previewSectionSize', '50');

    const storedFavorites = safeLocalStorageGetItem('favoriteComponents', '[]');
    try {
        app.favorites = JSON.parse(storedFavorites);
    } catch (e) {
        console.error("Failed to parse favorites from localStorage during load", e);
        app.favorites = [];
    }
    // Note: app.sidebarOpen is usually a transient state, not stored, but could be.
}
