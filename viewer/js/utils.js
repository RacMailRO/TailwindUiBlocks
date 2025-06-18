/**
 * Utility functions for Tailwind UI Viewer
 */

export function safeLocalStorageSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.warn(`Failed to set item in localStorage: ${key}`, e);
        // Optionally, notify the user if settings can't be saved.
        // this.showToast('Warning: Could not save settings. LocalStorage might be disabled or full.', 'error');
    }
}

export function safeLocalStorageGetItem(key, defaultValue) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? defaultValue : value;
    } catch (e) {
        console.warn(`Failed to get item from localStorage: ${key}`, e);
        return defaultValue;
    }
}

export function showToast(message, type = 'info') {
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

export function generateFullHtmlForContent(content, currentTheme) {
    return `
        <!DOCTYPE html>
        <html lang="en" class="${currentTheme === 'dark' ? 'dark' : ''}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Example Preview</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
                tailwind.config = {
                    darkMode: 'class',
                    theme: { extend: { fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }}}
                }
            </script>
            <style>body { font-family: 'Inter', system-ui, sans-serif; }</style>
        </head>
        <body class="bg-white dark:bg-gray-900 p-4">
            ${content}
        </body>
        </html>
    `;
}

export function updateURL(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.replaceState({}, '', url.toString());
}
