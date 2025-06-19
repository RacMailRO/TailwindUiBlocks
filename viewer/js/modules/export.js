/**
 * Export functionality for TailwindUI Blocks Viewer
 * Allows users to export components in various formats
 */

export function initExport(app) {
    // Add export functionality to the viewer
    addExportButtons(app);
    setupExportEventListeners(app);
}

function addExportButtons(app) {
    // Add export button to the controls area
    const controlsContainer = document.querySelector('.controls-container') || 
                             document.querySelector('.flex.items-center.justify-between') ||
                             document.querySelector('.preview-controls');
    
    if (controlsContainer) {
        const exportButton = createExportButton();
        controlsContainer.appendChild(exportButton);
    }
}

function createExportButton() {
    const button = document.createElement('div');
    button.className = 'relative';
    button.innerHTML = `
        <button id="export-btn" class="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
            </svg>
            <span>Export</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        </button>
        
        <!-- Export Dropdown Menu -->
        <div id="export-menu" class="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 hidden">
            <div class="p-4">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Export Options</h3>
                
                <!-- HTML Export -->
                <button class="export-option w-full text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 mb-2" data-format="html">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-md flex items-center justify-center">
                            <svg class="w-4 h-4 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900 dark:text-white">HTML File</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">Download as standalone HTML</div>
                        </div>
                    </div>
                </button>
                
                <!-- HTML + CSS Export -->
                <button class="export-option w-full text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 mb-2" data-format="html-css">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center">
                            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                            </svg>
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900 dark:text-white">HTML + CSS</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">Complete page with embedded styles</div>
                        </div>
                    </div>
                </button>
                
                <!-- Component Only -->
                <button class="export-option w-full text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 mb-2" data-format="component">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-md flex items-center justify-center">
                            <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6Z"/>
                            </svg>
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900 dark:text-white">Component Code</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">Raw HTML component only</div>
                        </div>
                    </div>
                </button>
                
                <!-- ZIP Package -->
                <button class="export-option w-full text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" data-format="zip">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-md flex items-center justify-center">
                            <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14,17H12V15H14M14,13H12V11H14M14,9H12V7H14M14,5H12V3H14M10,17H12V15H10M10,13H12V11H10M10,9H12V7H10M10,5H12V3H10V1H14V3H16V21H8V19H10V17Z"/>
                            </svg>
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900 dark:text-white">ZIP Package</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">Complete package with assets</div>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    `;
    
    return button;
}

function setupExportEventListeners(app) {
    document.addEventListener('click', (e) => {
        const exportBtn = e.target.closest('#export-btn');
        const exportOption = e.target.closest('.export-option');
        const exportMenu = document.getElementById('export-menu');
        
        if (exportBtn) {
            e.preventDefault();
            e.stopPropagation();
            exportMenu?.classList.toggle('hidden');
        } else if (exportOption) {
            e.preventDefault();
            e.stopPropagation();
            const format = exportOption.dataset.format;
            handleExport(app, format);
            exportMenu?.classList.add('hidden');
        } else {
            // Close menu when clicking outside
            exportMenu?.classList.add('hidden');
        }
    });
}

function handleExport(app, format) {
    const currentComponent = getCurrentComponentData(app);
    if (!currentComponent) {
        showNotification('No component selected for export', 'error');
        return;
    }
    
    switch (format) {
        case 'html':
            exportAsHTML(currentComponent);
            break;
        case 'html-css':
            exportAsHTMLWithCSS(currentComponent);
            break;
        case 'component':
            exportAsComponent(currentComponent);
            break;
        case 'zip':
            exportAsZIP(currentComponent);
            break;
        default:
            showNotification('Unknown export format', 'error');
    }
}

function getCurrentComponentData(app) {
    const currentCategory = app.currentCategory;
    const currentSubcategory = app.currentSubcategory;
    const currentComponent = app.currentComponent;
    
    if (!currentCategory || !currentSubcategory || !currentComponent) {
        return null;
    }
    
    // Get the component HTML from the preview iframe
    const previewFrame = document.getElementById('component-preview');
    let componentHTML = '';
    
    if (previewFrame && previewFrame.contentDocument) {
        const componentContent = previewFrame.contentDocument.querySelector('.component-content, body > *');
        componentHTML = componentContent ? componentContent.outerHTML : previewFrame.contentDocument.body.innerHTML;
    }
    
    return {
        category: currentCategory,
        subcategory: currentSubcategory,
        component: currentComponent,
        html: componentHTML,
        metadata: app.componentMetadata || {}
    };
}

function exportAsHTML(componentData) {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${componentData.metadata.name || componentData.component}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    ${componentData.html}
</body>
</html>`;
    
    downloadFile(htmlContent, `${componentData.component}.html`, 'text/html');
    showNotification('HTML file downloaded successfully!', 'success');
}

function exportAsHTMLWithCSS(componentData) {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${componentData.metadata.name || componentData.component}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Custom styles for the component */
        .component-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            html {
                color-scheme: dark;
            }
        }
    </style>
</head>
<body>
    <div class="component-wrapper">
        ${componentData.html}
    </div>
</body>
</html>`;
    
    downloadFile(htmlContent, `${componentData.component}-complete.html`, 'text/html');
    showNotification('Complete HTML file downloaded successfully!', 'success');
}

function exportAsComponent(componentData) {
    const componentCode = `<!-- ${componentData.metadata.name || componentData.component} -->
<!-- Category: ${componentData.category}/${componentData.subcategory} -->
<!-- Generated from TailwindUI Blocks Library -->

${componentData.html}`;
    
    downloadFile(componentCode, `${componentData.component}-component.html`, 'text/html');
    showNotification('Component code downloaded successfully!', 'success');
}

function exportAsZIP(componentData) {
    // For ZIP export, we'll create a structured package
    // This is a simplified version - in a real implementation you'd use JSZip
    const packageContent = createPackageStructure(componentData);
    downloadFile(packageContent, `${componentData.component}-package.txt`, 'text/plain');
    showNotification('Package structure downloaded! (ZIP functionality requires JSZip library)', 'info');
}

function createPackageStructure(componentData) {
    return `TailwindUI Component Package: ${componentData.metadata.name || componentData.component}
=====================================

Files included:
- index.html (main component file)
- README.md (usage instructions)
- component.html (raw component code)
- metadata.json (component information)

Usage Instructions:
1. Include Tailwind CSS in your project
2. Copy the component HTML into your page
3. Customize colors and spacing as needed

Component HTML:
${componentData.html}

Metadata:
${JSON.stringify(componentData.metadata, null, 2)}`;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
    
    // Set notification style based on type
    switch (type) {
        case 'success':
            notification.className += ' bg-green-500 text-white';
            break;
        case 'error':
            notification.className += ' bg-red-500 text-white';
            break;
        case 'info':
            notification.className += ' bg-blue-500 text-white';
            break;
        default:
            notification.className += ' bg-gray-500 text-white';
    }
    
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <span>${message}</span>
            <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Export functions for external use
export { handleExport, downloadFile, showNotification };