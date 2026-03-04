"""
CodeForge — Online Compiler Backend
Flask server that executes code using locally installed compilers/interpreters.
"""

import os
import sys
import subprocess
import tempfile
import shutil
import mimetypes
import time
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS

# Find the robust python binary path (prevents sys.executable pointing to gunicorn wrapper)
PYTHON_BIN = shutil.which('python3') or shutil.which('python') or sys.executable

# ── App Setup ───────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.resolve()
app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path='')
CORS(app)

# ── General Routes ──────────────────────────────────────────
@app.route('/')
def serve_index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    full_path = BASE_DIR / filename
    if full_path.is_file():
        mime, _ = mimetypes.guess_type(str(full_path))
        return Response(full_path.read_bytes(), mimetype=mime or 'text/plain')
    return jsonify({'error': 'File not found'}), 404

# ── Language Configuration ──────────────────────────────────
LANGUAGES = {
    'python': {
        'display': 'Python',
        'extension': 'py',
        'kind': 'interpreted',
        'run_cmd': [PYTHON_BIN],
        'version_cmd': [PYTHON_BIN, '--version'],
    },
    'javascript': {
        'display': 'JavaScript',
        'extension': 'js',
        'kind': 'interpreted',
        'run_cmd': ['node'],
        'version_cmd': ['node', '--version'],
    },
    'c': {
        'display': 'C',
        'extension': 'c',
        'kind': 'compiled',
        'compile_cmd': ['gcc', '{src}', '-o', '{out}', '-lm'],
        'version_cmd': ['gcc', '--version'],
    },
    'cpp': {
        'display': 'C++',
        'extension': 'cpp',
        'kind': 'compiled',
        'compile_cmd': ['g++', '{src}', '-o', '{out}', '-std=c++17', '-lm', '-lboost_system'],
        'version_cmd': ['g++', '--version'],
    },
    'java': {
        'display': 'Java',
        'extension': 'java',
        'kind': 'jvm',
        'run_cmd': ['java'],
        'version_cmd': ['java', '-version'],
    },
    'go': {
        'display': 'Go',
        'extension': 'go',
        'kind': 'interpreted',
        'run_cmd': ['go', 'run'],
        'version_cmd': ['go', 'version'],
    },
    'rust': {
        'display': 'Rust',
        'extension': 'rs',
        'kind': 'compiled',
        'compile_cmd': ['rustc', '{src}', '-o', '{out}'],
        'version_cmd': ['rustc', '--version'],
    },
    'ruby': {
        'display': 'Ruby',
        'extension': 'rb',
        'kind': 'interpreted',
        'run_cmd': ['ruby'],
        'version_cmd': ['ruby', '--version'],
    },
    'php': {
        'display': 'PHP',
        'extension': 'php',
        'kind': 'interpreted',
        'run_cmd': ['php'],
        'version_cmd': ['php', '--version'],
    },
    'typescript': {
        'display': 'TypeScript',
        'extension': 'ts',
        'kind': 'interpreted',
        'run_cmd': ['ts-node.cmd' if os.name == 'nt' else 'ts-node'],
        'version_cmd': ['ts-node.cmd' if os.name == 'nt' else 'ts-node', '--version'],  # fast check — tsx itself downloads on first run
    },
    'batch': {
        'display': 'Batch',
        'extension': 'bat',
        'kind': 'interpreted',
        'run_cmd': ['cmd', '/c'],
        'version_cmd': ['cmd', '/c', 'ver'],
    },
    'sql': {
        'display': 'SQL',
        'extension': 'sql',
        'kind': 'sql',  # special kind
        'run_cmd': [PYTHON_BIN],  # uses built-in sqlite3 module
        'version_cmd': [PYTHON_BIN, '-c', 'import sqlite3; print(sqlite3.sqlite_version)'],
    },
}

# Timeouts (seconds)
COMPILE_TIMEOUT = 30
RUN_TIMEOUT     = 10
GO_RUN_TIMEOUT  = 30
JAVA_TIMEOUT    = 15
TS_NODE_TIMEOUT = 30  # ts-node startup can be slow

# ── Availability Cache ──────────────────────────────────────
# Checked ONCE at startup — never again per-request.
_availability_cache: dict[str, bool] = {}

def _check_availability(lang_config: dict) -> bool:
    """Return True if the required compiler/interpreter is on PATH."""
    try:
        r = subprocess.run(
            lang_config['version_cmd'],
            capture_output=True, text=True, timeout=5
        )
        return r.returncode in (0, 1)
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False

def is_available(lang_id: str) -> bool:
    """Check cached availability — O(1) after startup."""
    return _availability_cache.get(lang_id, False)

def _build_availability_cache():
    """Called once at startup to populate the cache."""
    for lang_id, cfg in LANGUAGES.items():
        _availability_cache[lang_id] = _check_availability(cfg)

# Build cache immediately at import time (works for both local dev and Vercel serverless)
_build_availability_cache()


# ── API: Health Check ────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

# ── API: Available Languages ─────────────────────────────────
@app.route('/api/languages', methods=['GET'])
def get_languages():
    result = []
    for lang_id, cfg in LANGUAGES.items():
        if is_available(lang_id):
            result.append({
                'id':        lang_id,
                'name':      cfg['display'],
                'extension': cfg['extension'],
            })
    return jsonify({'languages': result})

# ── API: Execute ────────────────────────────────────────────
@app.route('/api/execute', methods=['POST'])
def execute_code():
    try:
        payload  = request.get_json(silent=True) or {}
        lang_id  = payload.get('language', '').strip()
        code     = payload.get('code', '').strip()
        stdin    = payload.get('stdin', '')

        # Validation
        if not lang_id or lang_id not in LANGUAGES:
            return jsonify({'error': f'Unsupported language: "{lang_id}"'}), 400
        if not code:
            return jsonify({'error': 'No code provided'}), 400

        cfg = LANGUAGES[lang_id]
        if not is_available(lang_id):   # O(1) cache lookup — no subprocess
            return jsonify({
                'error': (
                    f'{cfg["display"]} is not installed or not found on PATH.\n'
                    f'Please install it and restart the server.'
                )
            }), 400

        # Run in temp directory
        temp_dir = tempfile.mkdtemp(prefix='codeforge_')
        try:
            return _dispatch(lang_id, cfg, code, stdin, temp_dir)
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    except Exception as exc:
        return jsonify({'error': f'Internal server error: {exc}'}), 500


def _dispatch(lang_id, cfg, code, stdin, temp_dir):
    """Route to the appropriate execution strategy."""
    ext      = cfg['extension']
    src_name = 'Main.java' if lang_id == 'java' else f'main.{ext}'
    src_path = os.path.join(temp_dir, src_name)
    out_path = os.path.join(temp_dir, 'main.exe' if os.name == 'nt' else 'main')

    with open(src_path, 'w', encoding='utf-8') as f:
        f.write(code)

    kind = cfg['kind']

    if kind == 'compiled':
        # Step 1: compile
        compile_cmd = [
            part.replace('{src}', src_path).replace('{out}', out_path)
            for part in cfg['compile_cmd']
        ]
        comp = _run_process(compile_cmd, stdin='', timeout=COMPILE_TIMEOUT)
        if comp['returncode'] != 0:
            return jsonify({
                'stdout': '',
                'stderr': comp['stderr'] or comp['stdout'],
                'exit_code': comp['returncode'],
                'compilation_output': comp['stderr'] or comp['stdout'],
            })
        # Step 2: run
        run = _run_process([out_path], stdin=stdin, timeout=RUN_TIMEOUT)
        return jsonify({
            'stdout':             run['stdout'],
            'stderr':             run['stderr'],
            'exit_code':          run['returncode'],
            'compilation_output': '',
        })

    elif kind == 'jvm':
        # Java: use single-file source launcher (Java 11+)
        timeout = JAVA_TIMEOUT
        run_cmd = cfg['run_cmd'] + [src_path]
        run = _run_process(run_cmd, stdin=stdin, timeout=timeout)
        return jsonify({
            'stdout':             run['stdout'],
            'stderr':             run['stderr'],
            'exit_code':          run['returncode'],
            'compilation_output': '',
        })

    else:
        # Interpreted languages
        if kind == 'sql':
            # Run SQL via Python's built-in sqlite3 module (no external tool needed)
            sql_runner = (
                "import sqlite3, sys\n"
                "conn = sqlite3.connect(':memory:')\n"
                "conn.row_factory = sqlite3.Row\n"
                "sql = sys.stdin.read()\n"
                "try:\n"
                "    for stmt in sql.split(';'):\n"
                "        stmt = stmt.strip()\n"
                "        if not stmt:\n"
                "            continue\n"
                "        cur = conn.execute(stmt)\n"
                "        rows = cur.fetchall()\n"
                "        if rows:\n"
                "            cols = [d[0] for d in cur.description]\n"
                "            print(' | '.join(cols))\n"
                "            print('-' * (sum(len(c) for c in cols) + 3*(len(cols)-1)))\n"
                "            for r in rows:\n"
                "                print(' | '.join(str(v) for v in r))\n"
                "    conn.commit()\n"
                "except Exception as e:\n"
                "    print(f'Error: {e}', file=sys.stderr)\n"
                "    sys.exit(1)\n"
            )
            run = _run_process([PYTHON_BIN, '-c', sql_runner], stdin=code, timeout=RUN_TIMEOUT)
            return jsonify({
                'stdout':             run['stdout'],
                'stderr':             run['stderr'],
                'exit_code':          run['returncode'],
                'compilation_output': '',
            })

        elif lang_id == 'typescript':
            # Run TypeScript via npx tsx (fast, no tsconfig needed)
            timeout = TS_NODE_TIMEOUT
            run_cmd = cfg['run_cmd'] + [src_path]
            run     = _run_process(run_cmd, stdin=stdin, timeout=timeout)
            return jsonify({
                'stdout':             run['stdout'],
                'stderr':             run['stderr'],
                'exit_code':          run['returncode'],
                'compilation_output': '',
            })

        else:
            timeout = GO_RUN_TIMEOUT if lang_id == 'go' else RUN_TIMEOUT
            run_cmd = cfg['run_cmd'] + [src_path]
            run     = _run_process(run_cmd, stdin=stdin, timeout=timeout)
            return jsonify({
                'stdout':             run['stdout'],
                'stderr':             run['stderr'],
                'exit_code':          run['returncode'],
                'compilation_output': '',
            })


def _run_process(cmd, stdin='', timeout=10, shell=False):
    """Run a subprocess, capture output, handle timeouts."""
    try:
        result = subprocess.run(
            cmd if not shell else ' '.join(f'"{c}"' if ' ' in c else c for c in cmd),
            input=stdin,
            capture_output=True,
            text=True,
            timeout=timeout,
            shell=shell,
        )
        return {
            'stdout':     result.stdout,
            'stderr':     result.stderr,
            'returncode': result.returncode,
        }
    except subprocess.TimeoutExpired:
        return {
            'stdout':     '',
            'stderr':     f'⏱ Execution timed out after {timeout} seconds.',
            'returncode': -1,
        }
    except FileNotFoundError as e:
        return {
            'stdout':     '',
            'stderr':     f'Command not found: {e}',
            'returncode': -2,   # distinct from -1 (timeout) — used as fallback signal
        }


# ── Entry Point ─────────────────────────────────────────────
if __name__ == '__main__':
    print()
    print('  ╔═══════════════════════════════╗')
    print('  ║        CodeForge Server        ║')
    print('  ╚═══════════════════════════════╝')
    print()
    print('  Checking installed compilers...')
    print()

    available = [lang for lang, ok in _availability_cache.items() if ok]
    for lang_id, cfg in LANGUAGES.items():
        ok = _availability_cache.get(lang_id, False)
        mark = '  ✓' if ok else '  ✗'
        print(f'{mark}  {cfg["display"]:<14} ({cfg["version_cmd"][0]})')

    print()
    print(f'  {len(available)} language(s) ready.')
    print()
    print('  ➜  http://localhost:5000')
    print()

    # threaded=True: each request gets its own thread → no request queuing
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
