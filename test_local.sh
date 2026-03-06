#!/bin/bash

# 🚀 Fazza CRM Automation - Local Test Script

echo "------------------------------------------------"
echo "🔥 Iniciando Ambiente de Teste Local"
echo "------------------------------------------------"

# 1. Carregar variáveis de ambiente se o .env existir
if [ -f .env ]; then
    echo "📝 Carregando variáveis do arquivo .env..."
    # Modo mais robusto de carregar .env que suporta espaços e caracteres especiais básicos
    set -a
    source .env
    set +a
else
    echo "⚠️ Arquivo .env não encontrado. Usando valores padrão."
    export APP_SECRET=${APP_SECRET:-"test_secret_123"}
    export INSTAGRAM_VERIFY_TOKEN=${INSTAGRAM_VERIFY_TOKEN:-"test_token_123"}
    export DATABASE_URL=${DATABASE_URL:-"sqlite:///./automation.db"}
fi

# 2. Verificar dependências
echo "📦 Verificando dependências..."
python3 -m pip install -r requirements.txt --quiet

# 3. Inicializar banco de dados
echo "🗄️ Inicializando banco de dados SQLite..."
python3 -c "import sys; sys.path.append('execution'); from backend.database import init_db; init_db()"

# 4. Iniciar servidor
echo "🚀 Servidor rodando em http://localhost:8000"
echo "📚 Documentação API: http://localhost:8000/docs"
echo "📝 Logs sendo gravados em: $(pwd)/server.log"
echo "------------------------------------------------"

# PYTHONPATH garante que o pacote 'execution' seja encontrado
export PYTHONPATH=$PYTHONPATH:$(pwd)

# Roda em background redirecionando para o server.log
python3 -m uvicorn execution.backend.app:app --reload --host 127.0.0.1 --port 8000 > server.log 2>&1 &

echo "✨ Servidor iniciado em segundo plano com PID $!"
echo "💡 Para ver os logs em tempo real, use: tail -f server.log"
