import re

with open('script.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

# 1. Modify the Run logic to gather dynamic inputs
target_run_logic = "const stdin = document.getElementById('stdin-input').value;"
new_run_logic = """    let stdin = document.getElementById('stdin-input').value;
    const dynamicContainer = document.getElementById('dynamic-inputs-container');
    if (dynamicContainer && !dynamicContainer.classList.contains('hidden')) {
        const inputs = Array.from(document.querySelectorAll('.dynamic-input-field'));
        stdin = inputs.map(input => input.value).join('\\n');
        // Sync raw window
        document.getElementById('stdin-input').value = stdin;
    }"""
js_code = js_code.replace(target_run_logic, new_run_logic)

# 2. Modify Clear Input logic
target_clear_logic = "document.getElementById('stdin-input').value = '';"
new_clear_logic = """document.getElementById('stdin-input').value = '';
    const dynamicContainer = document.getElementById('dynamic-inputs-container');
    if (dynamicContainer) {
        dynamicContainer.classList.add('hidden');
        document.getElementById('stdin-input').classList.remove('hidden');
        document.getElementById('dynamic-inputs-list').innerHTML = '';
    }"""
js_code = js_code.replace(target_clear_logic, new_clear_logic)

# 3. Add Auto-Detect Button Event Listener at the bottom
auto_detect_logic = """
// --- Smart Input Wizard Logic ---
document.getElementById('auto-detect-btn').addEventListener('click', () => {
    const code = editor.getValue();
    let prompts = [];

    // Heuristics per language
    if (currentLanguage === 'c' || currentLanguage === 'cpp') {
        // Match printf("Question") followed by scanf or cout << "Question" followed by cin
        const cRegex = /(?:printf\\s*\\(\\s*"([^"]+)"|cout\\s*<<\\s*"([^"]+)")/g;
        let match;
        while ((match = cRegex.exec(code)) !== null) {
            prompts.push(match[1] || match[2]);
        }
    } else if (currentLanguage === 'python') {
        // Match input("Question")
        const pyRegex = /input\\s*\\(\\s*(['"])(.*?)\\1\\s*\\)/g;
        let match;
        while ((match = pyRegex.exec(code)) !== null) {
            prompts.push(match[2]);
        }
    } else if (currentLanguage === 'java') {
        const javaRegex = /System\\.out\\.print(?:ln)?\\s*\\(\\s*"([^"]+)"\\s*\\)/g;
        let match;
        while ((match = javaRegex.exec(code)) !== null) {
            prompts.push(match[1]);
        }
    }

    const container = document.getElementById('dynamic-inputs-container');
    const list = document.getElementById('dynamic-inputs-list');
    const rawInput = document.getElementById('stdin-input');

    container.classList.remove('hidden');
    rawInput.classList.add('hidden');
    list.innerHTML = '';

    if (prompts.length === 0) {
        list.innerHTML = '<div class="no-prompts-message">No standard input questions (e.g., scanf, input()) were detected in your code.</div>';
        return;
    }

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
});
"""

js_code += auto_detect_logic

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js_code)
print('JS updated.')
