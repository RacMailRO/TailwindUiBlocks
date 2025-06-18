export function initComponentActions(app) {
    document.getElementById('copy-code')?.addEventListener('click', () => copyCode(app));
    document.getElementById('download-html')?.addEventListener('click', () => downloadComponentHtml(app));
    // The save functionality is complex and involves modals, so it's omitted for this example,
    // but would be initialized here.
}

async function copyCode(app) {
    let code = '';
    if (app.currentView === 'code' && app.editor) {
        code = app.editor.getValue();
    } else if (app.currentView === 'split') {
        const editor = app.splitOrientation === 'horizontal' ? app.splitEditor : app.splitEditorVertical;
        if (editor) code = editor.getValue();
    } else {
        code = app.currentComponent?.html || '';
    }
    
    if (!code) {
        app.showToast('No code to copy.', 'error');
        return;
    }

    try {
        await navigator.clipboard.writeText(code);
        app.showToast('Code copied to clipboard!', 'success');
    } catch (error) {
        console.error('Failed to copy code:', error);
        app.showToast('Failed to copy code.', 'error');
    }
}

function downloadComponentHtml(app) {
    if (!app.currentComponent?.html) {
        app.showToast('No component HTML to download.', 'error');
        return;
    }

    const htmlContent = app.currentComponent.html;
    const filename = `${app.currentComponent.slug || 'component'}.html`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    app.showToast(`Downloaded ${filename}`, 'success');
}