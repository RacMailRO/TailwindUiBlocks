
import { TailwindUIViewer } from './TailwindUIViewer.js';

document.addEventListener('DOMContentLoaded', () => {
    window.tailwindUIViewer = new TailwindUIViewer();
});

window.addEventListener('resize', () => {
    if (window.tailwindUIViewer && window.innerWidth >= 1024) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !window.tailwindUIViewer.sidebarOpen) {
            sidebar.style.transform = 'translateX(0)';
            window.tailwindUIViewer.sidebarOpen = true;
        }
    }
});