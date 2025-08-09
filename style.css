/* --- 1. THEME & FONT DEFINITIONS --- */
:root {
    /* Colors from "Codezen" screenshot */
    --bg-base: #1E1E1E;
    --bg-panel: #252526;
    --bg-hover: #2A2D2E;
    --bg-active: #37373D;
    --border-color: #333333;
    --text-primary: #CCCCCC;
    --text-secondary: #858585;
    --text-active: #FFFFFF;
    
    /* Typography */
    --font-sans: 'Ubuntu', sans-serif;
    --font-mono: 'Fira Code', monospace;
    --font-size-base: 13px;
    
    /* UI Metrics */
    --border-radius: 5px;
    --transition-speed: 0.15s;
    --sidebar-width: 50px;
    --explorer-width: 240px;
    --top-bar-height: 40px;
    --tabs-height: 35px;
    --console-height: 30px;
}

body {
    font-family: var(--font-sans); font-size: var(--font-size-base);
    margin: 0; background-color: var(--bg-base); color: var(--text-primary);
    overflow: hidden; -webkit-font-smoothing: antialiased;
}

i { stroke-width: 1.5; } /* Global icon thickness */

/* --- 2. MAIN IDE GRID LAYOUT --- */
.ide-container {
    display: grid;
    grid-template-columns: var(--sidebar-width) 1fr;
    grid-template-rows: var(--top-bar-height) 1fr var(--console-height);
    grid-template-areas:
        "sidebar top-bar"
        "sidebar main"
        "sidebar console";
    height: 100vh;
}
.sidebar { grid-area: sidebar; }
.top-bar { grid-area: top-bar; }
.main-content { grid-area: main; }
.console-footer { grid-area: console; }

/* --- 3. COMPONENTS --- */
.sidebar {
    background-color: var(--bg-panel); border-right: 1px solid var(--border-color);
    display: flex; flex-direction: column; align-items: center; padding: 10px 0;
}
.sidebar nav { display: flex; flex-direction: column; gap: 10px; }
.sidebar button {
    background: none; border: none; color: var(--text-secondary); cursor: pointer;
    padding: 8px; border-radius: var(--border-radius); transition: all var(--transition-speed) ease;
}
.sidebar button:hover { color: var(--text-active); }
.sidebar button.active { background-color: var(--bg-active); color: var(--text-active); }
.sidebar .sidebar-footer { margin-top: auto; display: flex; flex-direction: column; gap: 10px; }
.sidebar i { width: 22px; height: 22px; }

.top-bar {
    background-color: var(--bg-panel); border-bottom: 1px solid var(--border-color);
    display: flex; align-items: center; justify-content: space-between; padding: 0 20px 0 10px;
}
.logo { font-weight: 700; font-size: 1.2rem; }
.action-buttons { display: flex; gap: 8px; }
.action-buttons button { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
.action-buttons i { width: 18px; }

.main-content {
    display: grid; grid-template-columns: var(--explorer-width) 1fr 1fr;
}
.file-explorer {
    background-color: var(--bg-panel); border-right: 1px solid var(--border-color);
    padding: 5px; overflow-y: auto;
}
ul.file-tree, ul.file-tree ul { list-style: none; padding-left: 15px; }
ul.file-tree { padding-left: 0; }
.file-item, .folder-item {
    display: flex; align-items: center; gap: 6px; padding: 5px;
    border-radius: var(--border-radius); cursor: pointer;
    white-space: nowrap; transition: background-color var(--transition-speed) ease;
}
.file-item:hover, .folder-item:hover { background-color: var(--bg-hover); }
.file-item.active { background-color: var(--bg-active); }
.file-item i, .folder-item i { width: 16px; height: 16px; flex-shrink: 0; }
.folder-item .chevron { transition: transform var(--transition-speed) ease; }
.folder-item.closed > .chevron { transform: rotate(-90deg); }

.editor-area { display: flex; flex-direction: column; }
#tabs-container {
    display: flex; background-color: var(--bg-base); flex-shrink: 0;
    border-bottom: 1px solid var(--border-color);
}
.tab {
    display: flex; align-items: center; gap: 8px; padding: 0 12px;
    height: var(--tabs-height); border-right: 1px solid var(--border-color);
    cursor: pointer; color: var(--text-secondary);
}
.tab.active { background-color: var(--bg-panel); color: var(--text-primary); }
.tab i { width: 16px; height: 16px; }
.tab .close-tab-btn { background: none; border: none; color: inherit; padding: 2px; border-radius: 50%; display: flex; }
.tab .close-tab-btn:hover { background-color: var(--bg-hover); }

#editor-container { height: 100%; overflow: hidden; }
.CodeMirror { height: 100%; font-size: 14px; }
.CodeMirror-gutters { background: var(--bg-panel) !important; border-right: 0 !important; }

.preview-area { display: flex; flex-direction: column; border-left: 1px solid var(--border-color); }
.preview-header {
    display: flex; align-items: center; gap: 8px; flex-shrink: 0;
    height: var(--tabs-height); padding: 0 12px; background-color: var(--bg-base);
    border-bottom: 1px solid var(--border-color); color: var(--text-secondary);
}
#preview-container { height: 100%; overflow: hidden; }
#preview-frame { width: 100%; height: 100%; border: none; background: white; }

.console-footer {
    grid-area: console; background-color: var(--bg-base);
    border-top: 1px solid var(--border-color);
}
#console-toggle-btn {
    background: none; border: none; color: var(--text-secondary);
    display: flex; align-items: center; gap: 8px; padding: 0 10px;
    height: 100%; cursor: pointer;
}
#console-toggle-btn i { transition: transform var(--transition-speed) ease; }
#output-container.active + .console-footer #console-toggle-btn i { transform: rotate(180deg); }

/* Output Panel as an Overlay */
#output-container {
    position: fixed; bottom: var(--console-height); left: var(--sidebar-width); right: 0;
    height: 200px; background-color: var(--bg-panel); z-index: 50;
    display: none; /* Toggled by JS */
}
#output-container.active { display: block; }
#output-content { padding: 10px; height: 100%; overflow-y: auto; box-sizing: border-box; }
