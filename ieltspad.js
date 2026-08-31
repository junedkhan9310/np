const storageKey = 'ielts-notepad';
const themeKey = 'ielts-notepad-theme';
const editors = [...document.querySelectorAll('.editor')];

function wordCount(text) {
    const plainText = text.replace(/\u00a0/g, ' ').trim();
    return plainText ? plainText.split(/\s+/).length : 0;
}

function updateCount(editor) {
    editor.closest('.pad').querySelector('.word-count').textContent = `${wordCount(editor.innerText)} words`;
}

function savePads() {
    localStorage.setItem(storageKey, JSON.stringify(editors.map((editor) => editor.innerHTML)));
    document.querySelectorAll('.save-state').forEach((state) => { state.textContent = 'Saved locally'; });
}

function selectionBelongsTo(editor) {
    const selection = window.getSelection();
    return selection && selection.rangeCount > 0 && editor.contains(selection.anchorNode) && editor.contains(selection.focusNode) && !selection.isCollapsed;
}

function highlight(editor, color) {
    if (!selectionBelongsTo(editor)) return;
    document.execCommand('hiliteColor', false, color);
    editor.focus();
    updateCount(editor);
    savePads();
}

function clearSelection(editor) {
    if (!selectionBelongsTo(editor)) return;
    document.execCommand('removeFormat');
    editor.focus();
    savePads();
}

function loadPads() {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    editors.forEach((editor, index) => {
        if (saved[index]) editor.innerHTML = saved[index];
        updateCount(editor);
    });
}

document.querySelectorAll('.pad').forEach((pad) => {
    const editor = pad.querySelector('.editor');
    pad.querySelectorAll('.swatch').forEach((button) => {
        button.addEventListener('mousedown', (event) => event.preventDefault());
        button.addEventListener('click', () => highlight(editor, button.dataset.color));
    });
    pad.querySelector('.clear-selection').addEventListener('click', () => clearSelection(editor));
    pad.querySelector('.clear-all').addEventListener('click', () => {
        editor.innerHTML = '';
        updateCount(editor);
        savePads();
        editor.focus();
    });
    editor.addEventListener('input', () => { updateCount(editor); savePads(); });
});

const themeToggle = document.getElementById('theme-toggle');
function setTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    themeToggle.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    localStorage.setItem(themeKey, theme);
}

themeToggle.addEventListener('click', () => setTheme(document.body.classList.contains('dark') ? 'light' : 'dark'));
loadPads();
setTheme(localStorage.getItem(themeKey) || 'light');