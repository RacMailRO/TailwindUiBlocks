/**
 * Split view and resizing management for Tailwind UI Viewer
 */
import { safeLocalStorageSetItem } from './utils.js';

// appInstance will be the main TailwindUIViewer instance
// let appInstance = null;

// export function initSplitResizerManager(app) {
//     appInstance = app;
// }

/**
 * Initializes event listeners for split orientation toggle buttons.
 * @param {object} app - The main application instance.
 */
export function initSplitViewEventListeners(app) {
    const horizontalSplit = document.getElementById('horizontal-split');
    const verticalSplit = document.getElementById('vertical-split');

    if (horizontalSplit) {
        horizontalSplit.addEventListener('click', () => setSplitOrientation(app, 'horizontal'));
    }
    if (verticalSplit) {
        verticalSplit.addEventListener('click', () => setSplitOrientation(app, 'vertical'));
    }
    // Initial application of orientation after settings are loaded
    // This might be called from restoreSettings or main init.
    // applySplitOrientation(app);
}

/**
 * Sets the split orientation (horizontal/vertical) and saves it.
 * @param {object} app - The main application instance.
 * @param {string} orientation - 'horizontal' or 'vertical'.
 */
export function setSplitOrientation(app, orientation) {
    app.splitOrientation = orientation;
    safeLocalStorageSetItem('splitOrientation', orientation);

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

    applySplitOrientation(app);
}

/**
 * Applies the current split orientation by showing/hiding relevant containers
 * and ensuring editors are correctly set up for the new orientation.
 * @param {object} app - The main application instance.
 */
export function applySplitOrientation(app) {
    const horizontalContainer = document.getElementById('horizontal-split-container');
    const verticalContainer = document.getElementById('vertical-split-container');

    const isHorizontal = app.splitOrientation === 'horizontal';
    horizontalContainer?.classList.toggle('hidden', !isHorizontal);
    horizontalContainer?.classList.toggle('flex', isHorizontal);
    horizontalContainer?.classList.toggle('flex-col', isHorizontal);

    verticalContainer?.classList.toggle('hidden', isHorizontal);
    verticalContainer?.classList.toggle('flex', !isHorizontal);
    verticalContainer?.classList.toggle('flex-row', !isHorizontal);

    if (app.currentView === 'split') {
        // This assumes editor.js provides createOrUpdateSplitEditors
        if (typeof app.editorModule?.createOrUpdateSplitEditors === 'function') { // Or directly app.createOrUpdateSplitEditors if still there
            app.editorModule.createOrUpdateSplitEditors(app);
        } else if (typeof app.createOrUpdateSplitEditors === 'function') { // Fallback if method is still on app
            app.createOrUpdateSplitEditors();
        } else {
            console.warn('createOrUpdateSplitEditors function not found for applying split orientation.');
        }
    }
}

/**
 * Initializes the resizers for horizontal and vertical split views.
 * @param {object} app - The main application instance.
 */
export function initResizers(app) {
    const horizontalResizer = document.getElementById('horizontal-resizer');
    if (horizontalResizer) initHorizontalResizerLogic(app, horizontalResizer);

    const verticalResizer = document.getElementById('vertical-resizer');
    if (verticalResizer) initVerticalResizerLogic(app, verticalResizer);
}

function initHorizontalResizerLogic(app, resizer) {
    let isResizing = false, startY = 0, startTopHeight = 0;
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true; document.body.style.cursor = 'row-resize'; document.body.style.userSelect = 'none';
        const previewSection = document.getElementById('preview-section');
        if (previewSection) startTopHeight = previewSection.getBoundingClientRect().height;
        startY = e.clientY; e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const container = document.getElementById('horizontal-split-container'); if (!container) return;
        const newTopHeight = Math.max(container.offsetHeight * 0.2, Math.min(container.offsetHeight * 0.8, startTopHeight + (e.clientY - startY)));
        const percentage = (newTopHeight / container.offsetHeight) * 100;
        const previewSection = document.getElementById('preview-section');
        const codeSection = document.getElementById('code-section');
        if (previewSection && codeSection) {
            previewSection.style.flex = `1 1 ${percentage}%`;
            codeSection.style.flex = `1 1 ${100 - percentage}%`;
            app.previewSectionSize = percentage.toString(); // Update app state
            safeLocalStorageSetItem('previewSectionSize', app.previewSectionSize);
        }
    });
    document.addEventListener('mouseup', () => {
        if (isResizing) { isResizing = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; }
    });
}

function initVerticalResizerLogic(app, resizer) {
    let isResizing = false, startX = 0, startLeftWidth = 0;
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true; document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
        const previewSection = document.getElementById('preview-section-vertical');
        if (previewSection) startLeftWidth = previewSection.getBoundingClientRect().width;
        startX = e.clientX; e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const container = document.getElementById('vertical-split-container'); if (!container) return;
        const newLeftWidth = Math.max(container.offsetWidth * 0.2, Math.min(container.offsetWidth * 0.8, startLeftWidth + (e.clientX - startX)));
        const percentage = (newLeftWidth / container.offsetWidth) * 100;
        const previewSection = document.getElementById('preview-section-vertical');
        const codeSection = document.getElementById('code-section-vertical');
        if (previewSection && codeSection) {
            previewSection.style.flex = `0 0 ${newLeftWidth}px`;
            codeSection.style.flex = `1 1 auto`;
            app.previewSectionSize = percentage.toString(); // Update app state
            safeLocalStorageSetItem('previewSectionSize', app.previewSectionSize);
            if (typeof app.updateBreakpointFromPreviewSize === 'function') { // If method exists on app
                app.updateBreakpointFromPreviewSize(newLeftWidth);
            }
        }
    });
    document.addEventListener('mouseup', () => {
        if (isResizing) { isResizing = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; }
    });
}

/**
 * Restores the saved sizes of the split view sections.
 * @param {object} app - The main application instance.
 */
export function restoreSplitSizes(app) {
    const size = parseFloat(app.previewSectionSize); // Get from app state

    const previewSection = document.getElementById('preview-section');
    const codeSection = document.getElementById('code-section');
    if (previewSection && codeSection) {
        previewSection.style.flex = `1 1 ${size}%`;
        codeSection.style.flex = `1 1 ${100 - size}%`;
    }

    const previewSectionVertical = document.getElementById('preview-section-vertical');
    const codeSectionVertical = document.getElementById('code-section-vertical');
    if (previewSectionVertical && codeSectionVertical) {
        const container = document.getElementById('vertical-split-container');
        if (container) {
            const containerWidth = container.getBoundingClientRect().width;
            if (containerWidth > 0) { // Ensure container has width
                const previewWidth = (containerWidth * size) / 100;
                previewSectionVertical.style.flex = `0 0 ${previewWidth}px`;
                codeSectionVertical.style.flex = `1 1 auto`;
            }
        }
    }
}

/**
 * Updates the live preview iframe in the split view with the current editor code.
 * @param {object} app - The main application instance.
 */
export function updateLivePreview(app) {
    if (!app.currentComponent) return;

    let code = '';
    // Get code from the active split editor (via app instance or editor module)
    if (typeof app.editorModule?.getCurrentCodeFromEditor === 'function') {
        // Ideal: editor module provides code from active split editor
        // This might need refinement in editor.js to specify *which* editor if multiple are active
        // For now, assuming getCurrentCodeFromEditor is smart enough for split view context if called from here.
        // A better way: app.editorModule.getActiveSplitEditorCode()
        if (app.currentView === 'split') {
             if (app.splitOrientation === 'horizontal' && app.splitEditor) code = app.splitEditor.getValue();
             else if (app.splitOrientation === 'vertical' && app.splitEditorVertical) code = app.splitEditorVertical.getValue();
        }
    } else if (typeof app.getCurrentCode === 'function') { // Fallback to app's method
         code = app.getCurrentCode(); // This needs to be context-aware of split view
    } else {
        console.warn('Cannot get current code for live preview.');
        return;
    }

    if (code === null || code === undefined) return; // Important: check for null/undefined from getCurrentCode

    const targetIframeId = app.splitOrientation === 'horizontal'
        ? 'split-component-frame'
        : 'split-component-frame-vertical';

    const iframe = document.getElementById(targetIframeId);

    if (iframe) {
        app.scrollPosition = iframe.contentWindow?.scrollY || 0; // Use app instance for scrollPosition
        const tempDoc = `
            <!DOCTYPE html>
            <html lang="en" class="${app.currentTheme === 'dark' ? 'dark' : ''}">
            <head>
                <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Component Preview</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <script>
                    tailwind.config = { darkMode: 'class', theme: { extend: { fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }}} }
                    window.addEventListener('load', function() { if (${app.scrollPosition} > 0) window.scrollTo(0, ${app.scrollPosition}); });
                </script>
                <style> body { font-family: 'Inter', system-ui, sans-serif; opacity: 0; transition: opacity 0.1s ease-in; } body.loaded { opacity: 1; } </style>
            </head>
            <body class="bg-white dark:bg-gray-900 min-h-screen p-4">${code}
                <script> document.body.classList.add('loaded'); if (${app.scrollPosition} > 0) window.scrollTo(0, ${app.scrollPosition}); </script>
            </body></html>`;

        clearTimeout(app.updateTimeout); // Use app instance for updateTimeout
        app.updateTimeout = setTimeout(() => {
            iframe.srcdoc = tempDoc;
        }, 150); // Fast debounce for live preview
    }
}
