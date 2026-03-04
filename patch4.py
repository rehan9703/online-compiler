import re

with open('script.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

# === Replace Python defaultCode ===
old_py = """    python: {
        name: 'Python',
        emoji: '🐍',
        mode: 'python',
        editorThemeDark: 'dracula',
        editorThemeLight: 'eclipse',
        defaultCode: `# Python — Hello World\\nprint(\"Hello, World!\")\\n\\nname = input(\"Enter your name: \")\\nprint(f\"Welcome, {name}!\")\\n`
    },"""

new_py = """    python: {
        name: 'Python',
        emoji: '🐍',
        mode: 'python',
        editorThemeDark: 'dracula',
        editorThemeLight: 'eclipse',
        defaultCode: `# Python — Standard Libraries Available\\n# numpy, pandas, requests, scipy, scikit-learn, matplotlib, Pillow, sympy, rich, and more!\\n\\nprint(\"Hello, World!\")\\n\\n# --- Example: Using numpy ---\\nimport numpy as np\\narr = np.array([1, 2, 3, 4, 5])\\nprint(f\"Array: {arr}\")\\nprint(f\"Mean: {arr.mean()}, Sum: {arr.sum()}\")\\n\\n# --- Example: Using requests (HTTP) ---\\n# import requests\\n# res = requests.get('https://api.github.com')\\n# print(res.status_code)\\n\\nname = input(\"Enter your name: \")\\nprint(f\"Welcome, {name}!\")\\n`
    },"""

js_code = js_code.replace(old_py, new_py)

# === Replace JavaScript defaultCode ===
old_js = """    javascript: {
        name: 'JavaScript',
        emoji: '🟨',
        mode: 'javascript',
        defaultCode: `// JavaScript (Node.js)\\nconsole.log(\"Hello, World!\");\\n\\n// If you need to read standard input, uncomment the lines below:\\n// const fs = require('fs');\\n// const input = fs.readFileSync(0, 'utf-8').trim();\\n// if (input) console.log(\\`Input: \\${input}\\`);\\n`
    },"""

new_js = """    javascript: {
        name: 'JavaScript',
        emoji: '🟨',
        mode: 'javascript',
        defaultCode: `// JavaScript (Node.js) — Libraries: axios, lodash, moment, uuid, chalk\\nconsole.log("Hello, World!");\\n\\n// --- Example: Using lodash ---\\nconst _ = require('lodash');\\nconst nums = [1, 2, 3, 4, 5];\\nconsole.log("Sum:", _.sum(nums));\\nconsole.log("Shuffled:", _.shuffle(nums));\\n\\n// --- Example: Using uuid ---\\nconst { v4: uuidv4 } = require('uuid');\\nconsole.log("Generated UUID:", uuidv4());\\n\\n// --- Standard input (scanf-style) ---\\n// const fs = require('fs');\\n// const input = fs.readFileSync(0, 'utf-8').trim();\\n// console.log("Input was:", input);\\n`
    },"""

js_code = js_code.replace(old_js, new_js)

# === Replace TypeScript defaultCode ===
old_ts = """    typescript: {
        name: 'TypeScript',
        emoji: '📘',
        mode: 'text/typescript',
        defaultCode: `// TypeScript\\ninterface User {\\n    name: string;\\n    id: number;\\n}\\n\\nconst user: User = {\\n    name: \"CodeForge\",\\n    id: 1\\n};\\nconsole.log(\\`Hello, \\${user.name}!\\`);\\n\\n// If you need to read standard input, uncomment the lines below:\\n// const fs = require('fs');\\n// const input = fs.readFileSync(0, 'utf-8').trim();\\n// if (input) console.log(\\`Input: \\${input}\\`);\\n`
    },"""

new_ts = """    typescript: {
        name: 'TypeScript',
        emoji: '📘',
        mode: 'text/typescript',
        defaultCode: `// TypeScript — Libraries: axios, lodash, moment, uuid (globally installed)\\ninterface User {\\n    name: string;\\n    score: number;\\n}\\n\\nconst users: User[] = [\\n    { name: "Alice", score: 95 },\\n    { name: "Bob",   score: 87 },\\n    { name: "Carol", score: 92 },\\n];\\n\\nconst topUser = users.reduce((a, b) => a.score > b.score ? a : b);\\nconsole.log(\`Top user: \${topUser.name} with score \${topUser.score}\`);\\n\\n// --- Example: Using lodash ---\\n// const _ = require('lodash');\\n// console.log(_.sum([1,2,3]));\\n`
    },"""

js_code = js_code.replace(old_ts, new_ts)

# === Replace C++ defaultCode for Boost awareness ===
old_cpp = """    cpp: {
        name: 'C++',
        emoji: '⚡',
        mode: 'text/x-c++src',
        defaultCode: `// C++ — Hello World\\n#include <iostream>\\n#include <string>\\nusing namespace std;\\n\\nint main() {\\n    cout << \"Hello, World!\" << endl;\\n\\n    string name;\\n    cout << \"Enter your name: \";\\n    cin >> name;\\n    cout << \"Welcome, \" << name << \"!\" << endl;\\n\\n    return 0;\\n}\\n`
    },"""

new_cpp = """    cpp: {
        name: 'C++',
        emoji: '⚡',
        mode: 'text/x-c++src',
        defaultCode: `// C++ — Full STL + Boost Libraries Available\\n#include <bits/stdc++.h>\\nusing namespace std;\\n\\nint main() {\\n    cout << "Hello, World!" << endl;\\n\\n    // STL: vector, map, set, algorithm, etc.\\n    vector<int> nums = {5, 2, 8, 1, 9, 3};\\n    sort(nums.begin(), nums.end());\\n    cout << "Sorted: ";\\n    for (int n : nums) cout << n << " ";\\n    cout << endl;\\n\\n    string name;\\n    cout << "Enter your name: ";\\n    cin >> name;\\n    cout << "Welcome, " << name << "!" << endl;\\n\\n    return 0;\\n}\\n`
    },"""

js_code = js_code.replace(old_cpp, new_cpp)

# === Replace Ruby defaultCode ===
old_ruby = """    ruby: {
        name: 'Ruby',
        emoji: '💎',
        mode: 'ruby',
        defaultCode: `# Ruby — Hello World\\nputs \"Hello, World!\"\\nprint \"Enter your name: \"\\nname = gets.chomp\\nputs \"Welcome, #{name}!\"\\n`
    },"""

new_ruby = """    ruby: {
        name: 'Ruby',
        emoji: '💎',
        mode: 'ruby',
        defaultCode: `# Ruby — Libraries: json, date, colorize available\\nputs "Hello, World!"\\n\\n# Using JSON gem\\nrequire 'json'\\ndata = { name: "CodeForge", version: 2 }\\nputs "JSON: #{data.to_json}"\\n\\n# Using Date\\nrequire 'date'\\nputs "Today: #{Date.today}"\\n\\nprint "Enter your name: "\\nname = gets.chomp\\nputs "Welcome, #{name}!"\\n`
    },"""

js_code = js_code.replace(old_ruby, new_ruby)

# === Replace PHP defaultCode ===
old_php = """    php: {
        name: 'PHP',
        emoji: '🐘',
        mode: 'php',
        defaultCode: `<?php\\n// PHP — Hello World\\necho \"Hello, World!\\\\n\";\\necho \"Enter your name: \";\\n$name = trim(fgets(STDIN));\\necho \"Welcome, $name!\\\\n\";\\n?>\\n`
    },"""

new_php = """    php: {
        name: 'PHP',
        emoji: '🐘',
        mode: 'php',
        defaultCode: `<?php\\n// PHP — JSON, cURL, mbstring, and XML extensions available\\necho "Hello, World!\\n";\\n\\n// Using JSON\\n$data = ["name" => "CodeForge", "version" => 2];\\necho "JSON: " . json_encode($data) . "\\n";\\n\\n// String functions\\n$text = "  Hello World  ";\\necho "Trimmed: " . trim($text) . "\\n";\\necho "Upper: " . strtoupper(trim($text)) . "\\n";\\n\\necho "Enter your name: ";\\n$name = trim(fgets(STDIN));\\necho "Welcome, $name!\\n";\\n?>\\n`
    },"""

js_code = js_code.replace(old_php, new_php)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js_code)
print('Updated all default code snippets.')
