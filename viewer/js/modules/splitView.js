
export function initSplitView(app) {
    document.getElementById('horizontal-split')?.addEventListener('click', () => setSplitOrientation(app, 'horizontal'));
    document.getElementById('vertical-split')?.addEventListener('click', () => setSplitOrientation(app, 'vertical'));
    initResizers(app);
}

function setSplitOrientation(app, orientation) {
    app.splitOrientation = orientation;
    app.safeLocalStorageSetItem('splitOrientation', orientation);
    
    const horizontalBtn = document.getElementById('horizontal-split');
    const verticalBtn = document.getElementById('vertical-split');
    const isActive = (btn) => btn.id.startsWith(orientation);

    [horizontalBtn, verticalBtn].forEach(btn => {
        if (btn) {
            btn.classList.toggle('bg-white', isActive(btn));
            btn.classList.toggle('dark:bg-gray-800', isActive(btn));
            btn.classList.toggle('text-gray-900', isActive(btn));
        }
    });

    applySplitOrientation(app);
}

export function applySplitOrientation(app) {
    const hContainer = document.getElementById('horizontal-split-container');
    const vContainer = document.getElementById('vertical-split-container');
    
    const isHorizontal = app.splitOrientation === 'horizontal';
    hContainer?.classList.toggle('hidden', !isHorizontal);
    vContainer?.classList.toggle('hidden', isHorizontal);

    createSplitEditors(app);
    loadCodeInSplitEditor(app);
}

function createSplitEditors(app) {
    if (typeof monaco === 'undefined') return;
    
    const setupEditor = (containerId, editorProp) => {
        const container = document.getElementById(containerId);
        if (container && !app[editorProp]) {
            app[editorProp] = monaco.editor.create(container, {
                value: app.currentComponent?.html || '',
                language: 'html',
                theme: app.editorTheme,
                automaticLayout: true,
                minimap: { enabled: false },
                wordWrap: 'on'
            });
            app[editorProp].onDidChangeModelContent(() => {
                clearTimeout(app.updateTimeout);
                app.updateTimeout = setTimeout(() => updateLivePreview(app), 300);
            });
        }
    };

    if (app.splitOrientation === 'horizontal') {
        setupEditor('split-code-editor', 'splitEditor');
    } else {
        setupEditor('split-code-editor-vertical', 'splitEditorVertical');
    }
}

export function loadCodeInSplitEditor(app) {
    if (!app.currentComponent) return;
    const editor = app.splitOrientation === 'horizontal' ? app.splitEditor : app.splitEditorVertical;
    editor?.setValue(app.currentComponent.html || '');
}

export function updateLivePreview(app) {
    const editor = app.splitOrientation === 'horizontal' ? app.splitEditor : app.splitEditorVertical;
    if (!editor) return;

    const code = editor.getValue();
    const iframeId = app.splitOrientation === 'horizontal' ? 'split-component-frame' : 'split-component-frame-vertical';
    const iframe = document.getElementById(iframeId);

    if (iframe) {
        const scrollY = iframe.contentWindow?.scrollY || 0;
        const isDark = app.currentTheme === 'dark';
        iframe.srcdoc = `
            <!DOCTYPE html><html lang="en" class="${isDark ? 'dark' : ''}">
            <head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"></script><script>tailwind.config = {darkMode: 'class'}</script></head>
            <body class="bg-white dark:bg-gray-900"><script>window.onload=()=>window.scrollTo(0,${scrollY});</script>${code}</body></html>`;
    }
}

function initResizers(app) {
    initHorizontalResizer(app, document.getElementById('horizontal-resizer'));
    initVerticalResizer(app, document.getElementById('vertical-resizer'));
}

 function initHorizontalResizer(resizer) {
        if(!resizer) return;
        let isResizing = false;
        let startY = 0;
        let startTopHeight = 0;
        
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
            
            const container = document.getElementById('horizontal-split-container');
            if (!container) return;
            
            startY = e.clientY;
            const previewSection = document.getElementById('preview-section');
            
            if (previewSection) {
                const previewRect = previewSection.getBoundingClientRect();
                startTopHeight = previewRect.height;
            }
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const container = document.getElementById('horizontal-split-container');
            if (!container) return;
            
            const deltaY = e.clientY - startY;
            const containerRect = container.getBoundingClientRect();
            const newTopHeight = Math.max(containerRect.height * 0.2, Math.min(containerRect.height * 0.8, startTopHeight + deltaY));
            const percentage = (newTopHeight / containerRect.height) * 100;
            
            const previewSection = document.getElementById('preview-section');
            const codeSection = document.getElementById('code-section');
            
            if (previewSection && codeSection) {
                previewSection.style.flex = `1 1 ${percentage}%`;
                codeSection.style.flex = `1 1 ${100 - percentage}%`;
                this.previewSectionSize = percentage.toString();
                this.safeLocalStorageSetItem('previewSectionSize', this.previewSectionSize);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }
    
   function initVerticalResizer(resizer) {
        if (!resizer) return;
        let isResizing = false;
        let startX = 0;
        let startLeftWidth = 0;
        
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            
            const container = document.getElementById('vertical-split-container');
            if (!container) return;
            
            startX = e.clientX;
            const previewSection = document.getElementById('preview-section-vertical');
            
            if (previewSection) {
                const previewRect = previewSection.getBoundingClientRect();
                startLeftWidth = previewRect.width;
            }
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const container = document.getElementById('vertical-split-container');
            if (!container) return;
            
            const deltaX = e.clientX - startX;
            const containerRect = container.getBoundingClientRect();
            const newLeftWidth = Math.max(containerRect.width * 0.2, Math.min(containerRect.width * 0.8, startLeftWidth + deltaX));
            const percentage = (newLeftWidth / containerRect.width) * 100;
            
            const previewSection = document.getElementById('preview-section-vertical');
            const codeSection = document.getElementById('code-section-vertical');
            
            if (previewSection && codeSection) {
                previewSection.style.flex = `0 0 ${newLeftWidth}px`;
                codeSection.style.flex = `1 1 auto`;
                this.previewSectionSize = percentage.toString();
                this.safeLocalStorageSetItem('previewSectionSize', this.previewSectionSize);
                
                // Update breakpoint and width display based on actual preview width
                this.updateBreakpointFromPreviewSize(newLeftWidth);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }