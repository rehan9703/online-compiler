import re

with open('script.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

# 1. Refactor the auto-detect logic into a function
old_auto_detect = """document.getElementById('auto-detect-btn').addEventListener('click', () => {
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
});"""

new_auto_detect = """function autoDetectInputs(isPreRun = false) {
    const code = editor.getValue();
    let prompts = [];

    // Heuristics per language
    if (currentLanguage === 'c' || currentLanguage === 'cpp') {
        const cRegex = /(?:printf\\s*\\(\\s*"([^"]+)"|cout\\s*<<\\s*"([^"]+)")/g;
        let match;
        while ((match = cRegex.exec(code)) !== null) {
            prompts.push(match[1] || match[2]);
        }
    } else if (currentLanguage === 'python') {
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

document.getElementById('auto-detect-btn').addEventListener('click', () => autoDetectInputs(false));"""

js_code = js_code.replace(old_auto_detect, new_auto_detect)

# 2. Intercept executeCode
old_execute = """async function executeCode() {
    const code = editor.getValue();
    if (!code.trim()) {
        showToast('No code to run!', 'error');
        return;
    }

    const lang = LANGUAGES[currentLanguage];
        let stdin = document.getElementById('stdin-input').value;"""

new_execute = """async function executeCode() {
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
    let stdin = document.getElementById('stdin-input').value;"""

js_code = js_code.replace(old_execute, new_execute)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js_code)
print('Script patched for execution interception.')
