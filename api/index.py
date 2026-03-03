"""
CodeForge — Vercel Serverless Entry Point

Vercel runs this as a Python serverless function.
⚠️  Only Python and Node.js are available on Vercel's runtime.
    C, C++, Java, Go, Rust etc. require a VPS/Docker deployment.
"""
import sys
import os

# Make the project root importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Import the Flask app from server.py
from server import app  # noqa: F401

# Vercel expects the WSGI app to be named 'app'
