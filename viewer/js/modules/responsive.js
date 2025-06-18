export function initBreakpoints(app) {
    document.querySelectorAll('.breakpoint-btn').forEach(button => {
        button.addEventListener('click', () => {
            const breakpoint = button.dataset.breakpoint;
            const width = button.dataset.width;
            setBreakpoint(app, breakpoint, width);
        });
    });
}

export function initWidthAdjuster(app) {
    const widthSlider = document.getElementById('width-slider');
    if (widthSlider) {
        widthSlider.addEventListener('input', (e) => {
            app.currentWidth = parseInt(e.target.value);
            app.safeLocalStorageSetItem('width', app.currentWidth.toString());
            updateBreakpointFromWidth(app);
            updateContainerWidths(app);
            updateBreakpointDisplay(app);
        });
    }
}

function setBreakpoint(app, breakpoint, width) {
    app.currentBreakpoint = breakpoint;
    app.currentWidth = parseInt(width);
    
    app.safeLocalStorageSetItem('breakpoint', app.currentBreakpoint);
    app.safeLocalStorageSetItem('width', app.currentWidth.toString());
    
    updateBreakpointButtons(app);
    
    const widthSlider = document.getElementById('width-slider');
    if (widthSlider) {
        widthSlider.value = app.currentWidth;
    }
    
    updateContainerWidths(app);
    updateBreakpointDisplay(app);
    app.updateURL({ breakpoint: app.currentBreakpoint, width: app.currentWidth });
}

function updateBreakpointFromWidth(app) {
    let newBreakpoint = 'desktop';
    if (app.currentWidth < 640) newBreakpoint = 'mobile';
    else if (app.currentWidth < 1024) newBreakpoint = 'tablet';
    
    if (newBreakpoint !== app.currentBreakpoint) {
        app.currentBreakpoint = newBreakpoint;
        app.safeLocalStorageSetItem('breakpoint', app.currentBreakpoint);
        updateBreakpointButtons(app);
    }
}

export function updateBreakpointButtons(app) {
    document.querySelectorAll('.breakpoint-btn').forEach(btn => {
        const isActive = btn.dataset.breakpoint === app.currentBreakpoint;
        btn.classList.toggle('bg-white', isActive);
        btn.classList.toggle('dark:bg-gray-800', isActive);
        btn.classList.toggle('text-gray-900', isActive);
        btn.classList.toggle('dark:text-white', isActive);
        btn.classList.toggle('shadow-sm', isActive);
        btn.classList.toggle('text-gray-600', !isActive);
        btn.classList.toggle('dark:text-gray-300', !isActive);
    });
}

export function updateContainerWidths(app) {
    const containers = [
        document.getElementById('component-container'),
        document.getElementById('split-component-container'),
        document.getElementById('split-component-container-vertical')
    ];
    
    containers.forEach(container => {
        if (container) {
            container.style.width = app.currentBreakpoint === 'desktop' && app.currentWidth >= 1200
                ? '100%'
                : `${app.currentWidth}px`;
        }
    });
}

export function updateBreakpointDisplay(app) {
    const bpDisplay = document.getElementById('current-breakpoint');
    const wDisplay = document.getElementById('current-width');
    const sliderDisplay = document.getElementById('width-display');

    // Add checks for each element before setting textContent
    if (bpDisplay) {
        bpDisplay.textContent = app.currentBreakpoint.charAt(0).toUpperCase() + app.currentBreakpoint.slice(1);
    }
    if (wDisplay) {
        wDisplay.textContent = `${app.currentWidth}px`;
    }
    if (sliderDisplay) {
        sliderDisplay.textContent = `${app.currentWidth}px`;
    }
}