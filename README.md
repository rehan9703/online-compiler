# Online Compiler

A web-based code compiler that uses locally installed compilers and interpreters to execute code in multiple programming languages.

## Features

- **Multiple Languages**: Supports Python, JavaScript, C, C++, Java, Go, Rust, Ruby, PHP, and more
- **Code Editor**: Syntax highlighting with CodeMirror
- **Theme Support**: Dark and light themes
- **Local Execution**: Uses locally installed compilers (no external APIs)
- **Standard Input**: Support for stdin input
- **Responsive Design**: Works on desktop and mobile

## Prerequisites

### Required Software

Install the compilers/interpreters you need:

| Language | Windows | macOS/Linux |
|----------|---------|-------------|
| Python | [python.org](https://www.python.org/) | `brew install python3` |
| Node.js | [nodejs.org](https://nodejs.org/) | `brew install node` |
| GCC | [MinGW](http://www.mingw.org/) | `brew install gcc` |
| G++ | (included with GCC) | (included with gcc) |
| Java | [oracle.com](https://www.oracle.com/java/) | `brew install openjdk` |
| Go | [golang.org](https://golang.org/) | `brew install go` |
| Rust | [rustup.rs](https://rustup.rs/) | `rustup` |
| Ruby | [rubyinstaller.org](https://rubyinstaller.org/) | `brew install ruby` |
| PHP | [windows.php.net](https://windows.php.net/) | `brew install php` |

### Python Dependencies

```bash
pip install -r requirements.txt
```

## Running the Compiler

1. **Start the server:**
   ```bash
   python server.py
   ```

2. **Open in browser:**
   Navigate to `http://localhost:5000`

## How It Works

1. The Flask backend (`server.py`) runs on port 5000
2. The frontend (`index.html`) provides a code editor interface
3. When you click "Run Code":
   - Frontend sends code + language + stdin to the backend
   - Backend writes code to a temporary file
   - Backend runs the appropriate compiler/interpreter
   - Backend returns stdout/stderr to the frontend
   - Frontend displays the output

## Supported Languages

The compiler automatically detects which languages are available on your system. Common supported languages:

- **Python** (python, python3)
- **JavaScript** (Node.js)
- **C** (gcc)
- **C++** (g++)
- **Java** (javac, java)
- **Go** (go run)
- **Rust** (rustc)
- **Ruby** (ruby)
- **PHP** (php)

## File Structure

```
/compiler
  ├── server.py       # Flask backend (executes code locally)
  ├── index.html      # Frontend HTML
  ├── styles.css      # CSS styling
  ├── script.js       # Frontend JavaScript
  ├── requirements.txt # Python dependencies
  └── README.md       # This file
```

## Keyboard Shortcuts

- **Ctrl + Enter** (or **Cmd + Enter** on Mac): Run code

## Troubleshooting

### "Could not connect to server"
Make sure the Flask server is running:
```bash
python server.py
```

### Language not found
Install the required compiler for that language. The server will show which compilers are detected when it starts.

### Execution timeout
Code execution is limited to 10 seconds to prevent infinite loops.

## License

MIT License
