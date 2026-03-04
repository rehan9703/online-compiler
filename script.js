/**
 * CodeForge — Online Compiler
 * Frontend Logic v2.1 — Optimized
 */

'use strict';

// ── State ──────────────────────────────────────────────────
let editor;
let currentLanguage = 'python';
let fontSize = 14;
let isRunning = false;
let execStartTime = null;
let currentAbortController = null;  // For cancelling in-flight requests
let cursorRafId = null;             // rAF handle for debounced cursor updates

// ── Language Configuration ──────────────────────────────────
const LANGUAGES = {
    python: {
        name: 'Python',
        emoji: '🐍',
        mode: 'python',
        editorThemeDark: 'dracula',
        editorThemeLight: 'eclipse',
        defaultCode: `# Python — Standard Libraries Available\n# numpy, pandas, requests, scipy, scikit-learn, matplotlib, Pillow, sympy, rich, and more!\n\nprint("Hello, World!")\n\n# --- Example: Using numpy ---\nimport numpy as np\narr = np.array([1, 2, 3, 4, 5])\nprint(f"Array: {arr}")\nprint(f"Mean: {arr.mean()}, Sum: {arr.sum()}")\n\n# --- Example: Using requests (HTTP) ---\n# import requests\n# res = requests.get('https://api.github.com')\n# print(res.status_code)\n\nname = input("Enter your name: ")\nprint(f"Welcome, {name}!")\n`
    },
    javascript: {
        name: 'JavaScript',
        emoji: '🟨',
        mode: 'javascript',
        defaultCode: `// JavaScript (Node.js) — Libraries: axios, lodash, moment, uuid, chalk\nconsole.log("Hello, World!");\n\n// --- Example: Using lodash ---\nconst _ = require('lodash');\nconst nums = [1, 2, 3, 4, 5];\nconsole.log("Sum:", _.sum(nums));\nconsole.log("Shuffled:", _.shuffle(nums));\n\n// --- Example: Using uuid ---\nconst { v4: uuidv4 } = require('uuid');\nconsole.log("Generated UUID:", uuidv4());\n\n// --- Standard input (scanf-style) ---\n// const fs = require('fs');\n// const input = fs.readFileSync(0, 'utf-8').trim();\n// console.log("Input was:", input);\n`
    },
    c: {
        name: 'C',
        emoji: '⚙️',
        mode: 'text/x-csrc',
        defaultCode: `// C — Hello World\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n\n    char name[100];\n    printf("Enter your name: ");\n    scanf("%s", name);\n    printf("Welcome, %s!\\n", name);\n\n    return 0;\n}\n`
    },
    cpp: {
        name: 'C++',
        emoji: '⚡',
        mode: 'text/x-c++src',
        defaultCode: `// C++ — Full STL + Boost Libraries Available\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n\n    // STL: vector, map, set, algorithm, etc.\n    vector<int> nums = {5, 2, 8, 1, 9, 3};\n    sort(nums.begin(), nums.end());\n    cout << "Sorted: ";\n    for (int n : nums) cout << n << " ";\n    cout << endl;\n\n    string name;\n    cout << "Enter your name: ";\n    cin >> name;\n    cout << "Welcome, " << name << "!" << endl;\n\n    return 0;\n}\n`
    },
    java: {
        name: 'Java',
        emoji: '☕',
        mode: 'text/x-java',
        defaultCode: `// Java — Hello World\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.println("Hello, World!");\n        System.out.print("Enter your name: ");\n        String name = scanner.nextLine();\n        System.out.println("Welcome, " + name + "!");\n        scanner.close();\n    }\n}\n`
    },
    go: {
        name: 'Go',
        emoji: '🐹',
        mode: 'go',
        defaultCode: `// Go — Hello World\npackage main\n\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n\treader := bufio.NewReader(os.Stdin)\n\tfmt.Print("Enter your name: ")\n\tname, _ := reader.ReadString('\\n')\n\tfmt.Printf("Welcome, %s!", name)\n}\n`
    },
    rust: {
        name: 'Rust',
        emoji: '🦀',
        mode: 'rust',
        defaultCode: `// Rust — Hello World\nuse std::io::{self, Write, BufRead};\n\nfn main() {\n    println!("Hello, World!");\n    print!("Enter your name: ");\n    io::stdout().flush().unwrap();\n    let stdin = io::stdin();\n    let name = stdin.lock().lines().next().unwrap().unwrap();\n    println!("Welcome, {}!", name.trim());\n}\n`
    },
    ruby: {
        name: 'Ruby',
        emoji: '💎',
        mode: 'ruby',
        defaultCode: `# Ruby — Libraries: json, date, colorize available\nputs "Hello, World!"\n\n# Using JSON gem\nrequire 'json'\ndata = { name: "CodeForge", version: 2 }\nputs "JSON: #{data.to_json}"\n\n# Using Date\nrequire 'date'\nputs "Today: #{Date.today}"\n\nprint "Enter your name: "\nname = gets.chomp\nputs "Welcome, #{name}!"\n`
    },
    php: {
        name: 'PHP',
        emoji: '🐘',
        mode: 'php',
        defaultCode: `<?php\n// PHP — JSON, cURL, mbstring, and XML extensions available\necho "Hello, World!\n";\n\n// Using JSON\n$data = ["name" => "CodeForge", "version" => 2];\necho "JSON: " . json_encode($data) . "\n";\n\n// String functions\n$text = "  Hello World  ";\necho "Trimmed: " . trim($text) . "\n";\necho "Upper: " . strtoupper(trim($text)) . "\n";\n\necho "Enter your name: ";\n$name = trim(fgets(STDIN));\necho "Welcome, $name!\n";\n?>\n`
    },
    typescript: {
        name: 'TypeScript',
        emoji: '📘',
        mode: 'text/typescript',
        defaultCode: `// TypeScript — Libraries: axios, lodash, moment, uuid (globally installed)\ninterface User {\n    name: string;\n    score: number;\n}\n\nconst users: User[] = [\n    { name: "Alice", score: 95 },\n    { name: "Bob",   score: 87 },\n    { name: "Carol", score: 92 },\n];\n\nconst topUser = users.reduce((a, b) => a.score > b.score ? a : b);\nconsole.log(\`Top user: \${topUser.name} with score \${topUser.score}\`);\n\n// --- Example: Using lodash ---\n// const _ = require('lodash');\n// console.log(_.sum([1,2,3]));\n`
    },
    batch: {
        name: 'Batch',
        emoji: '🖥️',
        mode: 'text/x-sh',
        defaultCode: `@echo off\necho Hello, World!\nset /p name="Enter your name: "\necho Welcome, %name%!\necho.\necho Current date: %date%\necho Current time: %time%\n`
    },
    sql: {
        name: 'SQL',
        emoji: '🗄️',
        mode: 'text/x-sql',
        defaultCode: `-- SQL (SQLite) — Demo\nCREATE TABLE students (\n    id    INTEGER PRIMARY KEY,\n    name  TEXT    NOT NULL,\n    grade INTEGER\n);\n\nINSERT INTO students VALUES (1, 'Alice',   95);\nINSERT INTO students VALUES (2, 'Bob',     87);\nINSERT INTO students VALUES (3, 'Charlie', 92);\n\nSELECT name, grade FROM students ORDER BY grade DESC;\n`
    }
};

// Languages available (from server check), initially all
let availableLanguages = Object.keys(LANGUAGES);

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initEditor();
    buildLanguageTabs();
    bindEvents();
    loadAvailableLanguages();
    loadPreferences();
});

// ── Editor ─────────────────────────────────────────────────
function initEditor() {
    editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
        mode: LANGUAGES[currentLanguage].mode,
        theme: 'eclipse',
        lineNumbers: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        lineWrapping: false,
        autoCloseBrackets: true,
        matchBrackets: true,
        styleActiveLine: true,
        extraKeys: {
            'Ctrl-Enter': executeCode,
            'Cmd-Enter': executeCode,
            'Tab': function (cm) {
                if (cm.somethingSelected()) cm.indentSelection('add');
                else cm.replaceSelection('    ', 'end');
            }
        }
    });

    editor.setValue(LANGUAGES[currentLanguage].defaultCode);

    // Cursor position tracking — debounced via rAF to avoid layout thrash
    editor.on('cursorActivity', () => {
        if (cursorRafId) cancelAnimationFrame(cursorRafId);
        cursorRafId = requestAnimationFrame(updateCursorPos);
    });
    editor.on('change', () => {
        if (cursorRafId) cancelAnimationFrame(cursorRafId);
        cursorRafId = requestAnimationFrame(() => { updateCursorPos(); updateCharCount(); });
    });
    updateCursorPos();
    updateCharCount();
}

function updateCursorPos() {
    const pos = editor.getCursor();
    document.getElementById('cursor-pos').textContent =
        `Ln ${pos.line + 1}, Col ${pos.ch + 1}`;
}

function updateCharCount() {
    const len = editor.getValue().length;
    document.getElementById('char-count').textContent = `${len} char${len !== 1 ? 's' : ''}`;
}

// ── Language Tabs ───────────────────────────────────────────
function buildLanguageTabs() {
    const tabsEl = document.getElementById('lang-tabs');
    tabsEl.innerHTML = '';

    availableLanguages.forEach(langId => {
        const lang = LANGUAGES[langId];
        if (!lang) return;
        const btn = document.createElement('button');
        btn.className = `lang-tab${langId === currentLanguage ? ' active' : ''}`;
        btn.setAttribute('data-lang', langId);
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', langId === currentLanguage ? 'true' : 'false');
        btn.title = lang.name;
        btn.innerHTML = `<span class="lang-emoji">${lang.emoji}</span>${lang.name}`;
        btn.addEventListener('click', () => switchLanguage(langId));
        tabsEl.appendChild(btn);
    });
}

function switchLanguage(langId) {
    if (!LANGUAGES[langId] || langId === currentLanguage) return;

    const prevLang = currentLanguage;
    currentLanguage = langId;
    const lang = LANGUAGES[langId];

    // Non-blocking: swap editor mode immediately, then set code
    editor.setOption('mode', lang.mode);

    // Only replace if still on the original default (don't stomp user edits silently)
    const prevDefault = prevLang && LANGUAGES[prevLang] ? LANGUAGES[prevLang].defaultCode.trim() : '';
    const curVal = editor.getValue().trim();
    if (curVal === '' || curVal === prevDefault || prevLang === null) {
        editor.setValue(lang.defaultCode);
    } else {
        // Show a non-blocking inline notice instead of a confirm() dialog
        showToast(`Switched to ${lang.name} — editor kept your code`, 'info', 2500);
    }

    // Cancel any running execution (stale now)
    if (isRunning && currentAbortController) {
        currentAbortController.abort();
    }

    // Update tab highlight (batch DOM updates)
    requestAnimationFrame(() => {
        document.querySelectorAll('.lang-tab').forEach(t => {
            const active = t.dataset.lang === langId;
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        document.getElementById('lang-mode-badge').textContent = lang.name;
    });

    savePreferences();
}

// ── Load Available Languages from Server ─────────────────────
async function loadAvailableLanguages() {
    try {
        const res = await fetch('/api/languages');
        if (!res.ok) throw new Error('Server error');
        const data = await res.json();

        if (data.languages && data.languages.length > 0) {
            availableLanguages = data.languages.map(l => l.id).filter(id => LANGUAGES[id]);
            buildLanguageTabs();

            // Ensure currentLanguage is valid and update editor if it changes
            if (!availableLanguages.includes(currentLanguage)) {
                const fallback = availableLanguages[0];
                currentLanguage = null; // force the switch to apply
                switchLanguage(fallback);
            }

            document.getElementById('footer-lang-count').textContent =
                `${availableLanguages.length} language${availableLanguages.length !== 1 ? 's' : ''} available`;
        }
    } catch (e) {
        // Fallback: show all tabs, server may not be running yet
        document.getElementById('footer-lang-count').textContent = 'Server offline — start server.py';
        showToast('Server offline. Start server.py and refresh.', 'error', 6000);
    }
}

// ── Event Bindings ──────────────────────────────────────────
function bindEvents() {
    // Run button
    document.getElementById('run-btn').addEventListener('click', executeCode);

    // Font size
    document.getElementById('font-size-increase').addEventListener('click', () => adjustFontSize(1));
    document.getElementById('font-size-decrease').addEventListener('click', () => adjustFontSize(-1));

    // Copy code
    document.getElementById('copy-code').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(editor.getValue());
            flashButton('copy-code', '✓ Copied!');
            showToast('Code copied to clipboard', 'success');
        } catch { showToast('Copy failed', 'error'); }
    });

    // Copy output
    document.getElementById('copy-output').addEventListener('click', async () => {
        const out = document.getElementById('output').textContent;
        if (!out) return;
        try {
            await navigator.clipboard.writeText(out);
            flashButton('copy-output', '✓ Copied!');
            showToast('Output copied to clipboard', 'success');
        } catch { showToast('Copy failed', 'error'); }
    });

    // Clear editor
    document.getElementById('clear-editor').addEventListener('click', () => {
        if (editor.getValue().trim() === '') return;
        if (confirm('Clear the editor?')) {
            editor.setValue('');
            editor.focus();
        }
    });

    // Clear input
    document.getElementById('clear-input').addEventListener('click', () => {
        document.getElementById('stdin-input').value = '';
        const dynamicContainer = document.getElementById('dynamic-inputs-container');
        if (dynamicContainer) {
            dynamicContainer.classList.add('hidden');
            document.getElementById('stdin-input').classList.remove('hidden');
            document.getElementById('dynamic-inputs-list').innerHTML = '';
        }
    });

    // Clear output
    document.getElementById('clear-output').addEventListener('click', resetOutput);
}

// ── Font Size ───────────────────────────────────────────────
function adjustFontSize(delta) {
    fontSize = Math.min(22, Math.max(10, fontSize + delta));
    // Drive the CSS variable — this works even with !important on the rule
    document.documentElement.style.setProperty('--editor-font-size', fontSize + 'px');
    document.getElementById('font-size-display').textContent = fontSize + 'px';
    editor.refresh(); // Re-layout CodeMirror after font change
    savePreferences();
}

// ── Preferences ─────────────────────────────────────────────
function savePreferences() {
    try {
        localStorage.setItem('codeforge_prefs', JSON.stringify({
            fontSize,
            language: currentLanguage
        }));
    } catch { }
}

async function loadPreferences() {
    try {
        const prefs = JSON.parse(localStorage.getItem('codeforge_prefs') || '{}');
        // Theme is always light — ignore any saved theme preference
        if (prefs.fontSize) {
            fontSize = prefs.fontSize;
            // Use CSS variable so !important on .CodeMirror is respected
            document.documentElement.style.setProperty('--editor-font-size', fontSize + 'px');
            document.getElementById('font-size-display').textContent = fontSize + 'px';
            editor.refresh();
        }
        if (prefs.language && LANGUAGES[prefs.language]) {
            currentLanguage = prefs.language;
            editor.setOption('mode', LANGUAGES[currentLanguage].mode);
            editor.setValue(LANGUAGES[currentLanguage].defaultCode);
        }
    } catch {
        // Ignore errors, use defaults
    }
}

// ── Code Execution ──────────────────────────────────────────
async function executeCode() {
    const code = editor.getValue();
    if (!code.trim()) {
        showToast('No code to run!', 'error');
        return;
    }

    // Intercept Run for Smart Inputs
    const dynamicContainer = document.getElementById('dynamic-inputs-container');
    if (dynamicContainer && dynamicContainer.classList.contains('hidden')) {
        // UI is currently hidden, check if we need to show it
        const requiresInput = autoDetectInputs(true);
        if (requiresInput) {
            showToast('Please answer the standard input questions first, then hit Run again!', 'warning', 4000);

            // Give focus to the first generated input
            setTimeout(() => {
                const firstInput = document.querySelector('.dynamic-input-field');
                if (firstInput) firstInput.focus();
            }, 50);
            return; // Halt execution until they fill it out and press Run again
        }
    }

    const lang = LANGUAGES[currentLanguage];
    let stdin = document.getElementById('stdin-input').value;
    if (dynamicContainer && !dynamicContainer.classList.contains('hidden')) {
        const inputs = Array.from(document.querySelectorAll('.dynamic-input-field'));
        stdin = inputs.map(input => input.value).join('\n');
        // Sync raw window
        document.getElementById('stdin-input').value = stdin;
    }

    // Create a fresh AbortController for this request
    currentAbortController = new AbortController();

    // Show loading overlay immediately (synchronous rAF = paints before fetch starts)
    isRunning = true;
    execStartTime = performance.now();

    // setRunningState synchronously so the overlay appears before the network call
    setRunningState(true, lang.name);
    // Yield to let the browser paint the overlay frame, then fire the request
    await new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));

    try {
        const res = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: currentLanguage, code, stdin }),
            signal: currentAbortController.signal,
        });

        const elapsed = ((performance.now() - execStartTime) / 1000).toFixed(2);

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
            showOutput(err.error || 'Unknown server error', 'error', elapsed);
            return;
        }

        const result = await res.json();
        handleResult(result, elapsed);

    } catch (err) {
        if (err.name === 'AbortError') return;  // User cancelled — silently exit
        const elapsed = ((performance.now() - execStartTime) / 1000).toFixed(2);
        if (err instanceof TypeError && err.message.includes('fetch')) {
            showOutput(
                'Cannot connect to server.\n\nMake sure the Flask server is running:\n  python server.py\n\nThen refresh this page.',
                'error', elapsed
            );
        } else {
            showOutput(`Error: ${err.message}`, 'error', elapsed);
        }
    } finally {
        isRunning = false;
        currentAbortController = null;
        setRunningState(false);
    }
}

function handleResult(result, elapsed) {
    if (result.error) {
        showOutput(`Error: ${result.error}`, 'error', elapsed);
        return;
    }

    let output = '';

    if (result.compilation_output && result.compilation_output.trim()) {
        output += `── Compilation ──\n${result.compilation_output.trim()}\n\n`;
    }

    if (result.stdout) output += result.stdout;

    if (result.stderr && result.stderr.trim()) {
        output += (output ? '\n' : '') + `── Stderr ──\n${result.stderr.trim()}`;
    }

    const exitCode = result.exit_code;
    let type = 'success';

    if (exitCode !== null && exitCode !== 0) {
        type = 'error';
        if (!output) output = `Process exited with code ${exitCode}`;
    } else if (!output) {
        output = '(no output)';
        type = 'warning';
    }

    showOutput(output.trim(), type, elapsed, exitCode);
}

function showOutput(text, type = 'success', elapsed = null, exitCode = null) {
    const placeholder = document.getElementById('output-placeholder');
    const outputEl = document.getElementById('output');
    const timeBadge = document.getElementById('exec-time-badge');
    const statusEl = document.getElementById('output-status');
    const exitBadge = document.getElementById('exit-code-badge');

    placeholder.style.display = 'none';
    outputEl.classList.remove('hidden', 'is-error', 'is-success', 'is-warning');

    if (type === 'error') outputEl.classList.add('is-error');
    if (type === 'success') outputEl.classList.add('is-success');
    if (type === 'warning') outputEl.classList.add('is-warning');

    outputEl.textContent = text;

    // Execution time badge
    if (elapsed !== null) {
        timeBadge.textContent = `${elapsed}s`;
        timeBadge.classList.remove('hidden');
    }

    // Status indicator
    const statusClass = type === 'error' ? 'status-error' : type === 'success' ? 'status-success' : 'status-idle';
    const statusText = type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Done';
    statusEl.className = statusClass;
    statusEl.innerHTML = `<span class="status-dot"></span>${statusText}`;

    // Exit code badge
    if (exitCode !== null) {
        exitBadge.textContent = `exit ${exitCode}`;
        exitBadge.className = exitCode === 0 ? 'code-0' : 'code-err';
        exitBadge.classList.remove('hidden');
    } else {
        exitBadge.classList.add('hidden');
    }

    // ── Auto-save to history ──────────────────────────────
    // Only save when we have a meaningful result (not during restore/clear)
    if (elapsed !== null) {
        saveRunToHistory({
            language: currentLanguage,
            code: editor.getValue(),
            stdin: document.getElementById('stdin-input').value,
            output: text,
            exitCode,
            elapsed,
            type,
        });
    }
}

function resetOutput() {
    const placeholder = document.getElementById('output-placeholder');
    const outputEl = document.getElementById('output');
    const timeBadge = document.getElementById('exec-time-badge');
    const statusEl = document.getElementById('output-status');
    const exitBadge = document.getElementById('exit-code-badge');

    placeholder.style.display = '';
    outputEl.classList.add('hidden');
    outputEl.textContent = '';
    outputEl.className = 'output-text hidden';
    timeBadge.classList.add('hidden');
    exitBadge.classList.add('hidden');
    statusEl.className = 'status-idle';
    statusEl.innerHTML = `<span class="status-dot"></span>Ready`;
}

function setRunningState(running, langName = '') {
    const runBtn = document.getElementById('run-btn');
    const overlay = document.getElementById('loading-overlay');
    const statusEl = document.getElementById('output-status');
    const langLabel = document.getElementById('loading-lang-label');

    if (running) {
        // Update text BEFORE removing 'hidden' so there's no flash of old text
        langLabel.textContent = `Running ${langName} code…`;
        runBtn.disabled = true;
        runBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/></svg><span>Stop</span>`;
        overlay.classList.remove('hidden');
        overlay.removeAttribute('aria-hidden');
        statusEl.className = 'status-running';
        statusEl.innerHTML = `<span class="status-dot"></span>Running…`;
    } else {
        overlay.classList.add('hidden');
        overlay.setAttribute('aria-hidden', 'true');
        runBtn.disabled = false;
        runBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>Run</span><kbd>Ctrl+↵</kbd>`;
    }
}

// ── Toast Notifications ──────────────────────────────────────
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);
}

// ── Utility ─────────────────────────────────────────────────
function flashButton(id, text) {
    const btn = document.getElementById(id);
    const original = btn.innerHTML;
    btn.textContent = text;
    btn.classList.add('success-flash');
    setTimeout(() => {
        btn.innerHTML = original;
        btn.classList.remove('success-flash');
    }, 1500);
}

// ════════════════════════════════════════════════════════════
//  RUN HISTORY MODULE
// ════════════════════════════════════════════════════════════

const HISTORY_KEY = 'codeforge_history';
const HISTORY_LIMIT = 100;   // Max entries to keep

// ── Storage helpers ──────────────────────────────────────────
function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch { return []; }
}

function saveHistory(entries) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(entries)); } catch { }
}

// ── Save a new run ───────────────────────────────────────────
function saveRunToHistory({ language, code, stdin, output, exitCode, elapsed, type }) {
    const entries = loadHistory();
    const entry = {
        id: Date.now(),
        ts: new Date().toISOString(),
        language,
        code: code.slice(0, 4000),        // Cap at 4KB per entry
        stdin,
        output: (output || '').slice(0, 2000),
        exitCode,
        elapsed,
        type,                                  // 'success' | 'error' | 'warning'
    };
    entries.unshift(entry);                    // newest first
    if (entries.length > HISTORY_LIMIT) entries.length = HISTORY_LIMIT;
    saveHistory(entries);
    refreshHistoryUI();
}

// ── Format timestamp nicely ──────────────────────────────────
function formatTs(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Build the history list DOM ───────────────────────────────
let _historySearchTerm = '';

function refreshHistoryUI() {
    const entries = loadHistory();
    const filtered = _historySearchTerm
        ? entries.filter(e =>
            e.code.toLowerCase().includes(_historySearchTerm) ||
            e.language.toLowerCase().includes(_historySearchTerm) ||
            (e.output || '').toLowerCase().includes(_historySearchTerm))
        : entries;

    const listEl = document.getElementById('history-list');
    const emptyEl = document.getElementById('history-empty');
    const badge = document.getElementById('history-count');

    // Update badge
    if (entries.length > 0) {
        badge.textContent = entries.length > 99 ? '99+' : entries.length;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }

    // Remove existing entry cards (keep emptyEl)
    listEl.querySelectorAll('.history-entry').forEach(el => el.remove());

    if (filtered.length === 0) {
        emptyEl.style.display = '';
        return;
    }
    emptyEl.style.display = 'none';

    const lang = LANGUAGES;
    const frag = document.createDocumentFragment();

    filtered.forEach(entry => {
        const langCfg = lang[entry.language] || { name: entry.language, emoji: '📄' };
        const statusCls = entry.type === 'success' ? 'ok' : entry.type === 'error' ? 'err' : 'warn';
        const statusText = entry.type === 'success' ? `✓ exit ${entry.exitCode ?? 0}` :
            entry.type === 'error' ? `✗ exit ${entry.exitCode ?? 1}` : '⚠ done';

        const card = document.createElement('div');
        card.className = 'history-entry';
        card.innerHTML = `
            <div class="history-entry-header">
                <span class="history-entry-lang">${langCfg.emoji} ${langCfg.name}</span>
                <span class="history-entry-time">${formatTs(entry.ts)} · ${entry.elapsed}s</span>
                <span class="h-status ${statusCls}">${statusText}</span>
            </div>
            <div class="history-entry-code">${escHtml(entry.code.slice(0, 200))}</div>
            <div class="history-entry-output">⟩ ${escHtml((entry.output || '(no output)').replace(/\n/g, ' ↵ ').slice(0, 120))}</div>
            <button class="history-del-btn" title="Delete this entry" aria-label="Delete entry">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        `;

        // Click card → restore code in editor
        card.addEventListener('click', (e) => {
            if (e.target.closest('.history-del-btn')) return;
            restoreFromHistory(entry);
        });

        // Delete button
        card.querySelector('.history-del-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteHistoryEntry(entry.id);
        });

        frag.appendChild(card);
    });

    listEl.appendChild(frag);
}

function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Restore a history entry to the editor ────────────────────
function restoreFromHistory(entry) {
    // Switch language if needed
    if (entry.language !== currentLanguage && LANGUAGES[entry.language]) {
        currentLanguage = entry.language;
        editor.setOption('mode', LANGUAGES[entry.language].mode);
        document.getElementById('lang-mode-badge').textContent = LANGUAGES[entry.language].name;
        document.querySelectorAll('.lang-tab').forEach(t => {
            const active = t.dataset.lang === entry.language;
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    }
    editor.setValue(entry.code);
    if (entry.stdin) {
        document.getElementById('stdin-input').value = entry.stdin;
    }
    closeHistory();
    showToast(`Restored ${LANGUAGES[entry.language]?.name || entry.language} code from ${formatTs(entry.ts)}`, 'info', 3000);
    editor.focus();
}

// ── Delete single entry ──────────────────────────────────────
function deleteHistoryEntry(id) {
    const entries = loadHistory().filter(e => e.id !== id);
    saveHistory(entries);
    refreshHistoryUI();
}

// ── Clear all ────────────────────────────────────────────────
let _clearArmed = false;
let _clearTimer = null;

function clearAllHistory() {
    const btn = document.getElementById('clear-history');
    if (!_clearArmed) {
        // First click: arm the button
        _clearArmed = true;
        const origHtml = btn.innerHTML;
        btn.textContent = '⚠ Sure? Click again';
        btn.style.cssText = 'color:var(--error);border-color:var(--error);background:var(--error-bg);';
        _clearTimer = setTimeout(() => {
            // Auto-disarm after 3s
            _clearArmed = false;
            btn.innerHTML = origHtml;
            btn.style.cssText = '';
        }, 3000);
    } else {
        // Second click: execute clear
        clearTimeout(_clearTimer);
        _clearArmed = false;
        btn.style.cssText = '';
        btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg> Clear All`;
        saveHistory([]);
        refreshHistoryUI();
        showToast('History cleared', 'info');
    }
}

// ── Export as JSON ───────────────────────────────────────────
function exportHistory() {
    const entries = loadHistory();
    if (entries.length === 0) { showToast('No history to export', 'warning'); return; }
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codeforge_history_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${entries.length} entries`, 'success');
}

// ── Open / Close sidebar ─────────────────────────────────────
function openHistory() {
    document.getElementById('history-sidebar').classList.add('open');
    document.getElementById('history-sidebar').setAttribute('aria-hidden', 'false');
    document.getElementById('history-backdrop').classList.add('visible');
    refreshHistoryUI();
}
function closeHistory() {
    document.getElementById('history-sidebar').classList.remove('open');
    document.getElementById('history-sidebar').setAttribute('aria-hidden', 'true');
    document.getElementById('history-backdrop').classList.remove('visible');
}
function toggleHistory() {
    const isOpen = document.getElementById('history-sidebar').classList.contains('open');
    isOpen ? closeHistory() : openHistory();
}

// ── Bind history events ──────────────────────────────────────
(function initHistory() {
    document.getElementById('history-toggle').addEventListener('click', toggleHistory);
    document.getElementById('history-close').addEventListener('click', closeHistory);
    document.getElementById('history-backdrop').addEventListener('click', closeHistory);
    document.getElementById('clear-history').addEventListener('click', clearAllHistory);
    document.getElementById('export-history').addEventListener('click', exportHistory);

    // Search
    document.getElementById('history-search').addEventListener('input', (e) => {
        _historySearchTerm = e.target.value.toLowerCase().trim();
        refreshHistoryUI();
    });

    // Keyboard shortcut Ctrl+H
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            toggleHistory();
        }
    });

    // Init badge count
    refreshHistoryUI();
})();


// --- Smart Input Wizard Logic ---
function autoDetectInputs(isPreRun = false) {
    const code = editor.getValue();
    let prompts = [];

    // Heuristics per language
    if (currentLanguage === 'c' || currentLanguage === 'cpp') {
        const cRegex = /(?:printf\s*\(\s*"([^"]+)"|cout\s*<<\s*"([^"]+)")/g;
        let match;
        while ((match = cRegex.exec(code)) !== null) {
            prompts.push(match[1] || match[2]);
        }
    } else if (currentLanguage === 'python') {
        const pyRegex = /input\s*\(\s*(['"])(.*?)\1\s*\)/g;
        let match;
        while ((match = pyRegex.exec(code)) !== null) {
            prompts.push(match[2]);
        }
    } else if (currentLanguage === 'java') {
        const javaRegex = /System\.out\.print(?:ln)?\s*\(\s*"([^"]+)"\s*\)/g;
        let match;
        while ((match = javaRegex.exec(code)) !== null) {
            prompts.push(match[1]);
        }
    }

    const container = document.getElementById('dynamic-inputs-container');
    const list = document.getElementById('dynamic-inputs-list');
    const rawInput = document.getElementById('stdin-input');

    if (prompts.length === 0) {
        if (!isPreRun) {
            container.classList.remove('hidden');
            rawInput.classList.add('hidden');
            list.innerHTML = '<div class="no-prompts-message">No standard input questions (e.g., scanf, input()) were detected in your code.</div>';
        }
        return false;
    }

    container.classList.remove('hidden');
    rawInput.classList.add('hidden');
    list.innerHTML = '';

    prompts.forEach((promptText, index) => {
        const group = document.createElement('div');
        group.className = 'dynamic-input-group';

        const label = document.createElement('label');
        label.textContent = promptText;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'dynamic-input-field';
        input.placeholder = 'Type answer here...';
        input.dataset.index = index;

        group.appendChild(label);
        group.appendChild(input);
        list.appendChild(group);
    });
    return true; // Prompts found and UI shown
}

document.getElementById('auto-detect-btn').addEventListener('click', () => autoDetectInputs(false));
