export function initSidebar(app) {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => toggleSidebar(app));
    }

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
        const { category, subcategory } = app.currentComponent;
        const targetId = `${category}-${subcategory}`;
        const target = document.getElementById(targetId);
        if (target) {
            target.classList.remove('hidden');
            const toggle = document.querySelector(`[data-target="${targetId}"]`);
            if (toggle) {
                toggle.querySelector('svg').style.transform = 'rotate(180deg)';
            }
        }
    }
}

function toggleSidebar(app) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        app.sidebarOpen = !app.sidebarOpen;
        sidebar.style.transform = app.sidebarOpen ? 'translateX(0)' : 'translateX(-100%)';
    }
}

export function initComponentLinks(app) {
    document.addEventListener('click', (e) => {
        const componentLink = e.target.closest('.component-link');
        if (componentLink) {
            e.preventDefault();
            const { category, subcategory, component } = componentLink.dataset;
            app.loadComponent(category, subcategory, component);
        }
    });
}