# ── CodeForge — Full Compiler Environment ──────────────────────────────
# Full multi-language compiler with popular library support
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# ── Step 1: System compilers, runtimes, and tools ───────────────────────
RUN apt-get update && apt-get install -y \
    # Core build tools
    build-essential curl wget git \
    # Python
    python3 python3-pip python3-dev \
    # Node.js (LTS)
    nodejs npm \
    # C / C++ with Boost
    gcc g++ libboost-all-dev \
    # Java JDK 17
    default-jdk \
    # Go
    golang-go \
    # Rust (via rustup is preferred, but we install cargo from apt for speed)
    rustc cargo \
    # Ruby
    ruby ruby-dev \
    # PHP
    php php-cli php-curl php-json php-mbstring php-xml \
    # SQLite
    sqlite3 \
    # Utilities
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ── Step 2: Node.js global packages (TypeScript + popular libs) ──────────
RUN npm install -g \
    ts-node \
    typescript \
    @types/node \
    axios \
    lodash \
    moment \
    uuid \
    chalk \
    express

# ── Step 3: Python popular libraries ────────────────────────────────────
RUN pip3 install --no-cache-dir \
    # Web & HTTP
    requests \
    httpx \
    beautifulsoup4 \
    # Data Science
    numpy \
    pandas \
    scipy \
    sympy \
    matplotlib \
    # Machine Learning
    scikit-learn \
    # Utilities
    Pillow \
    python-dateutil \
    pytz \
    tqdm \
    colorama \
    tabulate \
    rich \
    # JSON / CSV / Data parsing
    openpyxl \
    # Math
    mpmath

# ── Step 4: Ruby Gems ────────────────────────────────────────────────────
RUN gem install \
    json \
    httparty \
    colorize \
    date \
    bundler

# ── Step 5: Install Flask app Python dependencies ────────────────────────
WORKDIR /app
COPY requirements.txt .
RUN pip3 install -r requirements.txt gunicorn

# ── Step 6: Copy all application files ───────────────────────────────────
COPY . .

# ── Step 7: Expose port ───────────────────────────────────────────────────
EXPOSE 5000

# ── Step 8: Launch gunicorn ───────────────────────────────────────────────
CMD gunicorn --workers 4 --bind 0.0.0.0:${PORT:-5000} --timeout 60 server:app
