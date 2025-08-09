document.addEventListener('DOMContentLoaded', () => {
    try {
        // --- UI ELEMENTS ---
        const fileExplorer = document.getElementById('file-explorer');
        const tabsContainer = document.getElementById('tabs-container');
        const editorContainer = document.getElementById('editor-container');
        const previewFrame = document.getElementById('preview-frame');
        const consoleToggleBtn = document.getElementById('console-toggle-btn');
        const outputContainer = document.getElementById('output-container');

        // --- STATE & EDITOR ---
        let editor = CodeMirror(editorContainer, {
            lineNumbers: true,
            theme: 'material-darker',
            mode: 'xml',
            lineWrapping: false,
            scrollbarStyle: "simple"
        });
        let workspace = {}; let openTabs = []; let activeFilePath = null;

        // --- INITIAL DATA STRUCTURE ---
        const webPreset = {
            'index.html': { type: 'file', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Preview</title>\n</head>\n<body>\n  <h1>Hello World! This is a very long line to demonstrate horizontal scrolling.</h1>\n</body>\n</html>' },
            'css': { type: 'folder', isOpen: false, children: { 'style.css': { type: 'file', content: 'h1 { color: #333; font-family: sans-serif; }' } } },
            'js': { type: 'folder', isOpen: true, children: { 'script.js': { type: 'file', content: 'console.log("Hello from script.js");' } } }
        };

        // --- FILE SYSTEM (RECURSIVE & PATH-BASED) ---
        const getObjectByPath = (obj, path) => {
            return path.split('/').filter(p => p).reduce((acc, part) => acc && acc.children ? acc.children[part] : (acc[part] || null), obj);
        };

        const renderFileTree = (tree, container, currentPath = '') => {
            container.innerHTML = '';
            const ul = document.createElement('ul');
            ul.className = 'file-tree';
            
            // Sort folders first
            const sortedKeys = Object.keys(tree).sort((a, b) => {
                if (tree[a].type === tree[b].type) return 0;
                if (tree[a].type === 'folder') return -1;
                return 1;
            });
            
            sortedKeys.forEach(name => {
                const item = tree[name];
                const li = document.createElement('li');
                const path = currentPath ? `${currentPath}/${name}` : name;

                if (item.type === 'folder') {
                    li.className = `folder-item ${item.isOpen ? 'open' : 'closed'}`;
                    li.innerHTML = `<div class="folder-item-header" data-path="${path}"><i class="chevron" data-lucide="chevron-down"></i><i data-lucide="folder"></i><span>${name}</span></div>`;
                    if (item.isOpen) {
                        const childrenContainer = document.createElement('div');
                        renderFileTree(item.children, childrenContainer, path);
                        li.appendChild(childrenContainer);
                    }
                } else {
                    li.innerHTML = `<div class="file-item ${path === activeFilePath ? 'active' : ''}" data-path="${path}"><i data-lucide="file-text"></i><span>${name}</span></div>`;
                }
                ul.appendChild(li);
            });
            container.appendChild(ul);
            lucide.createIcons();
        };

        // --- CORE FUNCTIONS ---
        const openFile = (path) => {
            const file = getObjectByPath(workspace, path);
            if (!file || file.type !== 'file') return;
            activeFilePath = path;
            if (!openTabs.includes(path)) openTabs.push(path);
            editor.setValue(file.content);
            const ext = path.split('.').pop();
            const modes = { js: 'javascript', html: 'xml', css: 'css' };
            editor.setOption('mode', modes[ext] || 'default');
            renderTabs(); renderFileTree(workspace, fileExplorer); updatePreview();
        };

        const updatePreview = () => {
            const html = getObjectByPath(workspace, 'index.html')?.content || '';
            const css = getObjectByPath(workspace, 'css/style.css')?.content || '';
            const js = getObjectByPath(workspace, 'js/script.js')?.content || '';
            previewFrame.srcdoc = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>${css}</style>
                </head>
                <body>${html}
                    <script>${js}</script>
                </body>
                </html>
            `;
        };

        const renderTabs = () => {
            tabsContainer.innerHTML = '';
            openTabs.forEach(path => {
                const tab = document.createElement('div');
                tab.className = `tab ${path === activeFilePath ? 'active' : ''}`;
                tab.dataset.path = path;
                const filename = path.split('/').pop();
                tab.innerHTML = `<i data-lucide="file-text"></i><span>${filename}</span><button class="close-tab-btn" data-path="${path}"><i data-lucide="x"></i></button>`;
                tabsContainer.appendChild(tab);
            });
            lucide.createIcons();
        };

        // --- EVENT LISTENERS ---
        fileExplorer.addEventListener('click', (e) => {
            const fileItem = e.target.closest('.file-item');
            const folderHeader = e.target.closest('.folder-item-header');
            if (fileItem) { openFile(fileItem.dataset.path); }
            if (folderHeader) {
                const folder = getObjectByPath(workspace, folderHeader.dataset.path);
                if (folder) { folder.isOpen = !folder.isOpen; renderFileTree(workspace, fileExplorer); }
            }
        });

        tabsContainer.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab');
            const closeBtn = e.target.closest('.close-tab-btn');
            if (closeBtn) {
                e.stopPropagation();
                const path = closeBtn.dataset.path;
                const index = openTabs.indexOf(path);
                if (index > -1) openTabs.splice(index, 1);

                if (activeFilePath === path) {
                    activeFilePath = openTabs.length > 0 ? openTabs[Math.max(0, index - 1)] : null;
                    if (activeFilePath) { openFile(activeFilePath); }
                    else { editor.setValue(''); renderTabs(); renderFileTree(workspace, fileExplorer); }
                } else { renderTabs(); }
            } else if (tab) { openFile(tab.dataset.path); }
        });

        editor.on('change', () => { 
            if (activeFilePath) { 
                const f = getObjectByPath(workspace, activeFilePath); 
                if (f) { 
                    f.content = editor.getValue(); 
                    updatePreview(); 
                    localStorage.setItem('codezen-workspace-stable', JSON.stringify(workspace)); 
                } 
            } 
        });
        
        consoleToggleBtn.addEventListener('click', () => { 
            outputContainer.classList.toggle('active'); 
            const icon = consoleToggleBtn.querySelector('i');
            if (outputContainer.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'chevron-down');
            } else {
                icon.setAttribute('data-lucide', 'chevron-up');
            }
            lucide.createIcons();
        });

        // --- INITIALIZATION ---
        function init() {
            workspace = JSON.parse(localStorage.getItem('codezen-workspace-stable')) || webPreset;
            activeFilePath = 'index.html';
            openTabs = ['index.html', 'js/script.js', 'css/style.css'].filter(p => getObjectByPath(workspace, p));
            if (!openTabs.includes(activeFilePath) && getObjectByPath(workspace, activeFilePath)) {
                openTabs.unshift(activeFilePath);
            } else if (openTabs.length === 0) {
                activeFilePath = null;
            } else {
                activeFilePath = openTabs[0];
            }

            renderFileTree(workspace, fileExplorer);
            if (activeFilePath) {
                openFile(activeFilePath);
            } else {
                renderTabs();
            }
            editor.refresh();
            updatePreview();
        }

        init();

    } catch (error) {
        document.body.innerHTML = `<div style="color:white; padding: 20px;"><h1>A critical error occurred</h1><p>I apologize, a bug prevented the UI from loading. Please try clearing local storage or refreshing. Error: ${error.message}</p></div>`;
        console.error(error);
    }
});