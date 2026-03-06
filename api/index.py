import os
import sys

# Corrige problema de caminhos no AWS Lambda (Vercel)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from execution.backend.app import app
