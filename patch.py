import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_right_buttons = '''                        <div class="panel-title-right">
                            <button id="auto-detect-btn" class="mini-btn" aria-label="Auto-Detect Questions" title="Extract questions from your code">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                                </svg>
                                Smart Input
                            </button>
                            <button id="clear-input" class="mini-btn" aria-label="Clear input">'''

html = html.replace('                        <div class="panel-title-right">\n                            <button id="clear-input" class="mini-btn" aria-label="Clear input">', new_right_buttons)

new_textarea = '''                    <div id="stdin-wrapper" class="stdin-wrapper">
                        <textarea id="stdin-input" class="stdin-area"
                            placeholder="Expected to read input? Type it here before clicking Run (e.g., input for scanf, cin, input())..."
                            spellcheck="false" aria-label="Standard input"></textarea>
                        <div id="dynamic-inputs-container" class="dynamic-inputs-container hidden">
                            <div class="dynamic-inputs-header">
                                <span>✨ Answer the questions compiled from your code:</span>
                            </div>
                            <div id="dynamic-inputs-list"></div>
                        </div>
                    </div>'''

html = re.sub(r'                    <textarea id="stdin-input" class="stdin-area"(.*?)aria-label="Standard input"></textarea>', new_textarea, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('HTML updated.')
