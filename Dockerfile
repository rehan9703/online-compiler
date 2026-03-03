# ── CodeForge — Full Compiler Environment ──────────────────
# Includes: Python, Node.js, GCC/G++, Java, Go, SQLite3
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Install all compilers + Node.js in one layer
RUN apt-get update && apt-get install -y \
    python3 python3-pip \
    nodejs npm \
    gcc g++ \
    default-jdk \
    golang-go \
    sqlite3 \
    curl \
    && npm install -g npx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
WORKDIR /app
COPY requirements.txt .
RUN pip3 install -r requirements.txt gunicorn

# Copy app files
COPY . .

# Expose port
EXPOSE 5000

# Run with gunicorn for production (4 workers), using dynamic $PORT
CMD gunicorn --workers 4 --bind 0.0.0.0:${PORT:-5000} --timeout 60 server:app
