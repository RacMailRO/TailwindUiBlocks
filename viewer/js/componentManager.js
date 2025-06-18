/**
 * Component management: loading, actions (save, modals), search, breakpoints.
 */
import { safeLocalStorageSetItem, safeLocalStorageGetItem, showToast, updateURL, generateFullHtmlForContent } from './utils.js';
// Functions from ui.js might be needed for UI updates triggered by component actions
// e.g., import { updateBreakpointButtons, updateWidthSlider, updateBreakpointDisplay } from './ui.js';

/**
 * Initializes component-related event listeners.
 * @param {object} app - The main application instance.
 */
export function initComponentManagerEventListeners(app) {
    initComponentLinkEventListeners(app);
    initBreakpointEventListeners(app);
    initWidthAdjusterEventListeners(app);
    initSearchEventListeners(app);
    initComponentActionEventListeners(app);
}

// --- Component Loading ---
function initComponentLinkEventListeners(app) {
    document.querySelector('body').addEventListener('click', (e) => {
        const link = e.target.closest('.component-link');
        // Ensure not clicking a favorite toggle *inside* a component link
        if (link && !e.target.closest('.favorite-toggle')) {
            e.preventDefault();
            loadComponent(app, link.dataset.category, link.dataset.subcategory, link.dataset.component);
        }
    });
}

export async function loadComponent(app, category, subcategory, component) {
    try {
        // Update active link in sidebar
        document.querySelectorAll('.component-link.bg-blue-50').forEach(l => l.classList.remove('bg-blue-50', 'dark:bg-blue-900/20', 'text-blue-600', 'dark:text-blue-400'));
        const activeLink = document.querySelector(`.component-link[data-category="${category}"][data-subcategory="${subcategory}"][data-component="${component}"]`);
        activeLink?.classList.add('bg-blue-50', 'dark:bg-blue-900/20', 'text-blue-600', 'dark:text-blue-400');

        // Fetch component data
        const response = await fetch(`api/component-data.php?category=${category}&subcategory=${subcategory}&component=${component}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        const newData = await response.json();
        app.currentComponent = newData; // Update app state

        // Update previews and editors
        if(typeof app.updateComponentPreview === 'function') app.updateComponentPreview(); // Core app method
        if(typeof app.editorModule?.updateAllEditorsCode === 'function') app.editorModule.updateAllEditorsCode(app); // From editor.js
        else if(typeof app.updateCodeEditor === 'function') app.updateCodeEditor(); // Fallback

        if(app.currentView === 'examples' && typeof app.renderComponentExamples === 'function') {
            app.renderComponentExamples();
        }

        updateURL({ category, subcategory, component, theme: app.currentTheme, width: app.currentWidth, breakpoint: app.currentBreakpoint });
    } catch (err) {
        console.error('Load component error:', err);
        showToast(`Load component failed: ${err.message}`, 'error');
        app.currentComponent = null;
        if(typeof app.editorModule?.updateAllEditorsCode === 'function') app.editorModule.updateAllEditorsCode(app);
        else if(typeof app.updateCodeEditor === 'function') app.updateCodeEditor(); // Clear editors
    }
}

// --- Breakpoints and Width ---
function initBreakpointEventListeners(app) {
    document.querySelectorAll('.breakpoint-btn').forEach(button => {
        button.addEventListener('click', () => {
            setBreakpoint(app, button.dataset.breakpoint, button.dataset.width);
        });
    });
}

export function setBreakpoint(app, breakpoint, width) {
    app.currentBreakpoint = breakpoint;
    app.currentWidth = parseInt(width);
    safeLocalStorageSetItem('breakpoint', app.currentBreakpoint);
    safeLocalStorageSetItem('width', app.currentWidth.toString());

    // Call UI update functions (assuming they are on app.uiModule or app directly)
    const uiUpdater = app.uiModule || app;
    if (typeof uiUpdater.updateBreakpointButtons === 'function') uiUpdater.updateBreakpointButtons(app);
    if (typeof uiUpdater.updateWidthSlider === 'function') uiUpdater.updateWidthSlider(app);
    if (typeof uiUpdater.updateBreakpointDisplay === 'function') uiUpdater.updateBreakpointDisplay(app);

    updateContainerWidths(app);
    updateURL({ breakpoint });
}

function initWidthAdjusterEventListeners(app) {
    const widthSlider = document.getElementById('width-slider');
    if (widthSlider) {
        widthSlider.addEventListener('input', (e) => {
            app.currentWidth = parseInt(e.target.value);
            safeLocalStorageSetItem('width', app.currentWidth.toString());
            updateBreakpointFromWidth(app);
            updateContainerWidths(app);
            const uiUpdater = app.uiModule || app;
            if (typeof uiUpdater.updateBreakpointDisplay === 'function') uiUpdater.updateBreakpointDisplay(app);
        });
    }
}

export function updateBreakpointFromWidth(app) {
    let newBreakpoint = (app.currentWidth < 640) ? 'mobile' : (app.currentWidth < 1024) ? 'tablet' : 'desktop';
    if (newBreakpoint !== app.currentBreakpoint) {
        app.currentBreakpoint = newBreakpoint;
        safeLocalStorageSetItem('breakpoint', app.currentBreakpoint);
        const uiUpdater = app.uiModule || app;
        if (typeof uiUpdater.updateBreakpointButtons === 'function') uiUpdater.updateBreakpointButtons(app);
    }
}

export function updateContainerWidths(app) {
    const ids = ['component-container', 'split-component-container', 'split-component-container-vertical'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.width = (app.currentBreakpoint === 'desktop' && app.currentWidth >= 1200) ? '100%' : `${app.currentWidth}px`;
        }
    });
}

export function updateBreakpointFromPreviewSize(app, previewWidth) {
    let newBreakpoint = 'desktop';
    let newWidth = Math.round(previewWidth); // Use actual preview width for display

    if (previewWidth <= 480) newBreakpoint = 'mobile';
    else if (previewWidth <= 768) newBreakpoint = 'tablet';

    // Update app state only if changed to avoid infinite loops or unnecessary updates
    if (app.currentBreakpoint !== newBreakpoint || app.currentWidth !== newWidth) {
        app.currentBreakpoint = newBreakpoint;
        app.currentWidth = newWidth;
        safeLocalStorageSetItem('breakpoint', app.currentBreakpoint);
        safeLocalStorageSetItem('width', app.currentWidth.toString());

        const uiUpdater = app.uiModule || app;
        if (typeof uiUpdater.updateBreakpointButtons === 'function') uiUpdater.updateBreakpointButtons(app);
        if (typeof uiUpdater.updateBreakpointDisplay === 'function') uiUpdater.updateBreakpointDisplay(app);
        if (typeof uiUpdater.updateWidthSlider === 'function') uiUpdater.updateWidthSlider(app);
    }
}

// --- Search ---
function initSearchEventListeners(app) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => performSearch(app, e.target.value), 300);
        });
    }
}

async function performSearch(app, query) {
    if (!query.trim()) {
        showAllComponents(app); // Pass app if showAllComponents needs it (e.g. for updating UI state)
        return;
    }
    try {
        const response = await fetch(`api/search.php?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`Search API error: ${response.status}`);
        const results = await response.json();
        displaySearchResults(app, results); // Pass app for similar reasons
    } catch (err) {
        console.error('Search error:', err);
        showToast('Search failed.', 'error');
    }
}

function showAllComponents(app) { // app might not be needed if it only manipulates DOM
    document.querySelectorAll('nav a.component-link').forEach(link => link.style.display = 'block');
    document.querySelectorAll('nav div[id*="-"][class*="ml-4"]').forEach(contentDiv => { // Subcategory content divs
        contentDiv.classList.remove('hidden');
        const toggleButton = document.querySelector(`button.subcategory-toggle[data-target="${contentDiv.id}"]`);
        toggleButton?.querySelector('svg')?.style.setProperty('transform', 'rotate(180deg)');
    });
}

function displaySearchResults(app, results) { // app might not be needed
    document.querySelectorAll('nav a.component-link').forEach(link => link.style.display = 'none');
    document.querySelectorAll('nav div[id*="-"][class*="ml-4"]').forEach(contentDiv => {
        contentDiv.classList.add('hidden');
        const toggleButton = document.querySelector(`button.subcategory-toggle[data-target="${contentDiv.id}"]`);
        toggleButton?.querySelector('svg')?.style.setProperty('transform', 'rotate(0deg)');
    });

    results.forEach(result => {
        const link = document.querySelector(
            `a.component-link[data-category="${result.category}"][data-subcategory="${result.subcategory}"][data-component="${result.component}"]`
        );
        if (link) {
            link.style.display = 'block';
            const subcategoryContentDiv = document.getElementById(`${result.category}-${result.subcategory}`);
            if (subcategoryContentDiv) {
                subcategoryContentDiv.classList.remove('hidden');
                const toggleButton = document.querySelector(`button.subcategory-toggle[data-target="${subcategoryContentDiv.id}"]`);
                toggleButton?.querySelector('svg')?.style.setProperty('transform', 'rotate(180deg)');
            }
        }
    });
    if (results.length === 0) console.log("No search results found.");
}

// --- Component Actions (Save, Modals) ---
function initComponentActionEventListeners(app) {
    document.getElementById('save-component')?.addEventListener('click', () => saveComponent(app));
    document.getElementById('save-as-component')?.addEventListener('click', () => saveAsNewComponent(app));
    document.getElementById('close-save-modal')?.addEventListener('click', () => closeSaveModal(app));
    document.getElementById('cancel-save')?.addEventListener('click', () => closeSaveModal(app));
    document.getElementById('save-component-form')?.addEventListener('submit', (e) => handleSaveSubmit(app, e));
    document.getElementById('component-category')?.addEventListener('change', () => updateSubcategoryOptionsModal(app));
    document.getElementById('download-html')?.addEventListener('click', () => downloadComponentHtml(app));
}

export function saveComponent(app) {
    if (!app.currentComponent) { showToast('No component selected', 'error'); return; }
    const codeGetter = app.editorModule?.getCurrentCodeFromEditor || app.getCurrentCode;
    let code = typeof codeGetter === 'function' ? codeGetter(app) : app.currentComponent.html; // Fallback
    if (code === null) { showToast('No code to save', 'error'); return; }
    performSaveRequest(app, app.currentComponent.metadata.category, app.currentComponent.metadata.subcategory, app.currentComponent.slug, code, app.currentComponent.metadata);
}

export function saveAsNewComponent(app) {
    const codeGetter = app.editorModule?.getCurrentCodeFromEditor || app.getCurrentCode;
    const code = typeof codeGetter === 'function' ? codeGetter(app) : app.currentComponent?.html;
    if (code === null) { showToast('No code to save', 'error'); return; }
    openSaveModal(app, false); // false indicates not an update
}

function openSaveModal(app, isUpdate = false) {
    const modal = document.getElementById('save-modal');
    const title = document.getElementById('save-modal-title');
    if (title) title.textContent = isUpdate ? 'Update Component' : 'Save as New Component';

    const nameField = document.getElementById('component-name');
    const descField = document.getElementById('component-description');
    const catField = document.getElementById('component-category');
    const tagsField = document.getElementById('component-tags');
    const respField = document.getElementById('component-responsive');
    const darkField = document.getElementById('component-dark-mode');

    if (app.currentComponent && isUpdate) {
        nameField.value = app.currentComponent.metadata.name;
        descField.value = app.currentComponent.metadata.description;
        catField.value = app.currentComponent.metadata.category;
        tagsField.value = app.currentComponent.metadata.tags?.join(', ') || '';
        respField.checked = app.currentComponent.metadata.responsive;
        darkField.checked = app.currentComponent.metadata.darkMode;
    } else {
        nameField.value = app.currentComponent && !isUpdate ? `Copy of ${app.currentComponent.metadata.name}` : ''; // Suggest a name for "Save As"
        descField.value = app.currentComponent && !isUpdate ? app.currentComponent.metadata.description : '';
        catField.value = app.currentComponent?.metadata.category || 'marketing'; // Default or current
        tagsField.value = app.currentComponent?.metadata.tags?.join(', ') || '';
        respField.checked = app.currentComponent?.metadata.responsive !== undefined ? app.currentComponent.metadata.responsive : true;
        darkField.checked = app.currentComponent?.metadata.darkMode !== undefined ? app.currentComponent.metadata.darkMode : true;
    }
    updateSubcategoryOptionsModal(app);
    modal?.classList.remove('hidden');
}

function closeSaveModal(app) { // app might not be needed if it's just DOM manipulation
    document.getElementById('save-modal')?.classList.add('hidden');
}

function updateSubcategoryOptionsModal(app) { // app might be needed if currentComponent influences defaults
    const catSelect = document.getElementById('component-category');
    const subcatSelect = document.getElementById('component-subcategory');
    if (!catSelect || !subcatSelect) return;

    const subcategories = {
        'marketing': ['heroes', 'features', 'cta', 'testimonials', 'pricing'],
        'application-ui': ['forms', 'navigation', 'data-display', 'feedback', 'overlays'],
        'ecommerce': ['product-display', 'shopping-cart', 'checkout', 'reviews']
    };
    const selectedCategory = catSelect.value;
    const options = subcategories[selectedCategory] || [];
    subcatSelect.innerHTML = '';
    options.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt;
        el.textContent = opt.charAt(0).toUpperCase() + opt.slice(1).replace('-', ' ');
        subcatSelect.appendChild(el);
    });
    // If current component's category matches the selected one, try to set its subcategory
    if (app.currentComponent && app.currentComponent.metadata.category === selectedCategory) {
        subcatSelect.value = app.currentComponent.metadata.subcategory;
    } else if (options.length > 0) { // Default to first if not matching or no current component
        subcatSelect.value = options[0];
    }
}

async function handleSaveSubmit(app, event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const codeGetter = app.editorModule?.getCurrentCodeFromEditor || app.getCurrentCode;
    const code = typeof codeGetter === 'function' ? codeGetter(app) : null;

    if (code === null) { showToast('No code to save.', 'error'); return; }

    const metadata = {
        name: formData.get('name'),
        description: formData.get('description'),
        category: formData.get('category'),
        subcategory: formData.get('subcategory'),
        tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()).filter(t => t) : [],
        responsive: formData.has('responsive'),
        darkMode: formData.has('darkMode'),
        dependencies: ['tailwindcss'], // Default or could be dynamic
        version: '1.0.0', // Default or could be dynamic
        author: 'TailwindUI Blocks' // Default or could be dynamic
    };

    if (!metadata.name || !metadata.category || !metadata.subcategory) {
        showToast('Name, category, and subcategory are required.', 'error'); return;
    }
    const slug = metadata.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) { showToast('Valid name required to generate slug.', 'error'); return; }

    await performSaveRequest(app, metadata.category, metadata.subcategory, slug, code, metadata);
    closeSaveModal(app);
}

async function performSaveRequest(app, category, subcategory, slug, code, metadata) {
    try {
        const response = await fetch('api/save-component.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, subcategory, slug, code, metadata })
        });
        const result = await response.json();
        if (result.success) {
            showToast('Component saved!', 'success');
            app.isComponentModified = false; // Reset flag on app
            location.reload(); // Easiest way to reflect changes in sidebar/list
        } else {
            showToast(result.error || 'Save failed', 'error');
        }
    } catch (err) {
        console.error('Save error:', err);
        showToast(`Save failed: ${err.message}`, 'error');
    }
}

export function downloadComponentHtml(app) {
    if (!app.currentComponent || !app.currentComponent.html) {
        showToast('No component HTML available to download.', 'error'); return;
    }
    const htmlContent = app.currentComponent.html;
    const filename = (app.currentComponent.slug || 'component') + '.html';
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`, 'success');
}

// --- Component Examples Rendering (called by main app's switchView) ---
// This is called by main.js when switching to examples view or when theme changes on examples view
export function renderComponentExamples(app) {
    const examplesContentArea = document.getElementById('examples-content-area');
    if (!examplesContentArea) return;
    examplesContentArea.innerHTML = '';

    if (!app.currentComponent?.examples?.length) {
        examplesContentArea.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No examples available for this component.</p>';
        return;
    }

    app.currentComponent.examples.forEach((example, index) => {
        const exContainer = document.createElement('div');
        exContainer.className = 'mb-8 p-4 border dark:border-gray-700 rounded-lg';

        const exName = document.createElement('h3');
        exName.className = 'text-lg font-semibold text-gray-800 dark:text-white mb-3';
        exName.textContent = example.name || `Example ${index + 1}`;
        exContainer.appendChild(exName);

        const iframeContainer = document.createElement('div');
        iframeContainer.className = 'mb-4 h-96 border dark:border-gray-700 rounded overflow-hidden';
        const iframe = document.createElement('iframe');
        iframe.className = 'w-full h-full';
        iframe.srcdoc = generateFullHtmlForContent(example.html, app.currentTheme); // from utils.js
        iframeContainer.appendChild(iframe);
        exContainer.appendChild(iframeContainer);

        const codeTitle = document.createElement('h4');
        codeTitle.className = 'text-md font-medium text-gray-700 dark:text-gray-300 mb-2';
        codeTitle.textContent = 'HTML Code:';
        exContainer.appendChild(codeTitle);

        const codeBlockId = `example-code-editor-${index}`;
        const codeBlockDiv = document.createElement('div');
        codeBlockDiv.id = codeBlockId;
        codeBlockDiv.className = 'h-64 border dark:border-gray-700 rounded';
        exContainer.appendChild(codeBlockDiv);

        examplesContentArea.appendChild(exContainer);

        if (typeof monaco !== 'undefined' && typeof require !== 'undefined') {
             require(['vs/editor/editor.main'], () => {
                // Ensure any old editor instance is disposed if the container is being reused.
                // However, since we clear examplesContentArea.innerHTML, this might not be strictly necessary
                // unless Monaco has internal references. For safety, one might:
                // if (monaco.editor.getModels().length > SOME_THRESHOLD) { monaco.editor.disposeAllModels(); } // Drastic
                // Or track instances and dispose them.
                monaco.editor.create(document.getElementById(codeBlockId), {
                    value: example.html,
                    language: 'html',
                    theme: app.editorTheme, // Use app's current editor theme
                    automaticLayout: true,
                    readOnly: true,
                    minimap: { enabled: false },
                    wordWrap: 'on'
                });
            });
        } else {
            const pre = document.createElement('pre');
            pre.className = 'bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto';
            const codeEl = document.createElement('code');
            codeEl.textContent = example.html;
            pre.appendChild(codeEl);
            codeBlockDiv.replaceWith(pre);
        }
    });
}
