export function initTheme(app) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) { // This check is good!
        themeToggle.addEventListener('click', () => toggleTheme(app));
    }
    
    if (app.currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }
    
    updateThemeToggleIcon(app);
}

function toggleTheme(app) {
    const isDark = document.documentElement.classList.toggle('dark');
    app.currentTheme = isDark ? 'dark' : 'light';
    app.safeLocalStorageSetItem('theme', app.currentTheme);
    app.updateComponentPreview();
    // After toggling, we need to update the icon state again
    updateThemeToggleIcon(app); 
}

export function updateThemeToggleIcon(app) {
    const themeToggle = document.getElementById('theme-toggle');
    // Guard clause: If the main toggle button doesn't exist, do nothing.
    if (!themeToggle) return; 

    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    
    // Now, check for each icon before changing its style.
    if (app.currentTheme === 'dark') {
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'block';
    } else {
        if (sunIcon) sunIcon.style.display = 'block';
        if (moonIcon) moonIcon.style.display = 'none';
    }
}