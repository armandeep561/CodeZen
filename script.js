document.addEventListener('DOMContentLoaded', () => {
    // --- UI ELEMENTS ---
    const fileExplorer = document.getElementById('file-explorer');
    const tabsContainer = document.getElementById('tabs-container');
    const editorContainer = document.getElementById('editor-container');
    const previewFrame = document.getElementById('preview-frame');
    const consoleToggleBtn = document.getElementById('console-toggle-btn');
    const outputContainer = document.getElementById('output-container');
    const newFileBtn = document.getElementById('new-file-btn');
    const newFolderBtn = document.getElementById('new-folder-btn');

    // --- STATE & EDITOR ---
    let editor = CodeMirror(editorContainer, { lineNumbers: true, theme: 'material-darker', mode: 'xml' });
    let workspace = {}; let openTabs = []; let activeFilePath = null;

    // --- PRESET ---
    const webPreset = {
        'index.html': { type: 'file', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Preview</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>' },
        'css': { type: 'folder', isOpen: true, children: { 'style.css': { type: 'file', content: 'h1 { color: #333; }' } } },
        'js': { type: 'folder', isOpen: true, children: { 'script.js': { type: 'file', content: 'console.log("Hello from script.js");' } } }
    };

    // --- FILE SYSTEM (RECURSIVE) ---
    const getFileOrFolder = (path) => {
        const parts = path.split('/').filter(p => p);
        let current = workspace;
        for (const part of parts) {
            if (!current[part] && !current.children?.[part]) return null;
            current = current.children ? current.children[part] : current[part];
        }
        return current;
    };

    const renderFileTree = (tree, container) => {
        container.innerHTML = '';
        const ul = document.createElement('ul');
        ul.className = 'file-tree';

        Object.keys(tree).sort((a,b) => (tree[a].type > tree[b].type) ? -1 : 1).forEach(name => {
            const item = tree[name];
            const li = document.createElement('li');
            const path = (container.dataset.path ? container.dataset.path + '/' : '') + name;
            
            if (item.type === 'folder') {
                li.innerHTML = `<div class="folder-item ${item.isOpen ? 'open' : 'closed'}" data-path="${path}">
                                    <i class="chevron" data-lucide="chevron-down"></i>
                                    <i data-lucide="folder"></i>
                                    <span>${name}</span>
                                </div>`;
                if (item.isOpen) {
                    const childrenContainer = document.createElement('div');
                    childrenContainer.dataset.path = path;
                    renderFileTree(item.children, childrenContainer);
                    li.appendChild(childrenContainer);
                }
            } else {
                li.innerHTML = `<div class="file-item" data-path="${path}">
                                    <i data-lucide="file-text"></i>
                                    <span>${name}</span>
                                </div>`;
                if (path === activeFilePath) {
                    li.querySelector('.file-item').classList.add('active');
                }
            }
            ul.appendChild(li);
        });
        container.appendChild(ul);
        lucide.createIcons();
    };

    // --- CORE FUNCTIONS ---
    const openFile = (path) => {
        const file = getFileOrFolder(path);
        if (!file || file.type !== 'file') return;
        
        activeFilePath = path;
        if (!openTabs.includes(path)) openTabs.push(path);
        
        editor.setValue(file.content);
        const ext = path.split('.').pop();
        const modes = { js: 'javascript', html: 'xml', css: 'css' };
        editor.setOption('mode', modes[ext] || 'default');
        
        renderTabs();
        renderFileTree(workspace, fileExplorer);
        updatePreview();
    };
    
    const updatePreview = () => {
        const htmlFile = getFileOrFolder('index.html');
        const cssFile = getFileOrFolder('css/style.css');
        const jsFile = getFileOrFolder('js/script.js');
        const html = htmlFile ? htmlFile.content : '';
        const css = cssFile ? cssFile.content : '';
        const js = jsFile ? jsFile.content : '';
        previewFrame.srcdoc = `<html><head><style>${css}</style></head><body>${html}<script>${js}</script></body></html>`;
    };

    const renderTabs = () => {
        tabsContainer.innerHTML = '';
        openTabs.forEach(path => {
            const tab = document.createElement('div');
            tab.className = 'tab';
            if (path === activeFilePath) tab.classList.add('active');
            tab.dataset.path = path;
            const filename = path.split('/').pop();
            tab.innerHTML = `<i data-lucide="file-text"></i>
                             <span>${filename}</span>
                             <button class="close-tab-btn" data-path="${path}"><i data-lucide="x"></i></button>`;
            tabsContainer.appendChild(tab);
        });
        lucide.createIcons();
    };

    // --- EVENT LISTENERS ---
    fileExplorer.addEventListener('click', (e) => {
        const fileItem = e.target.closest('.file-item');
        const folderItem = e.target.closest('.folder-item');
        if (fileItem) { openFile(fileItem.dataset.path); }
        if (folderItem) {
            const folder = getFileOrFolder(folderItem.dataset.path);
            folder.isOpen = !folder.isOpen;
            renderFileTree(workspace, fileExplorer);
        }
    });

    tabsContainer.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab');
        const closeBtn = e.target.closest('.close-tab-btn');
        if (closeBtn) {
            e.stopPropagation();
            const path = closeBtn.dataset.path;
            const index = openTabs.indexOf(path);
            openTabs.splice(index, 1);
            if (activeFilePath === path) {
                activeFilePath = openTabs.length > 0 ? openTabs[openTabs.length - 1] : null;
                if (activeFilePath) openFile(activeFilePath);
                else editor.setValue('');
            }
            renderTabs();
        } else if (tab) {
            openFile(tab.dataset.path);
        }
    });

    editor.on('change', () => {
        if (activeFilePath) {
            const file = getFileOrFolder(activeFilePath);
            if (file) {
                file.content = editor.getValue();
                // Basic autosave for previewable files
                if (['index.html', 'css/style.css', 'js/script.js'].includes(activeFilePath)) {
                    updatePreview();
                }
            }
        }
    });

    consoleToggleBtn.addEventListener('click', () => {
        outputContainer.classList.toggle('active');
    });

    // --- INITIALIZATION ---
    function init() {
        workspace = JSON.parse(localStorage.getItem('codezen-workspace')) || webPreset;
        activeFilePath = 'index.html';
        openTabs = ['index.html'];
        
        openFile(activeFilePath);
        lucide.createIcons();
    }
    
    init();
});
