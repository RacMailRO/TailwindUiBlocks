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

function toggleTheme(app) {
    const isDark = document.documentElement.classList.toggle('dark');
    app.currentTheme = isDark ? 'dark' : 'light';
    app.safeLocalStorageSetItem('theme', app.currentTheme);
    app.updateComponentPreview();
}

export function updateThemeToggleIcon(app) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const sunIcon = themeToggle.querySelector('.sun-icon');
        const moonIcon = themeToggle.querySelector('.moon-icon');
        
        if (app.currentTheme === 'dark') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }
}