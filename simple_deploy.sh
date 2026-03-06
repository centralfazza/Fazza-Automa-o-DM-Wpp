#!/bin/bash

# 🚀 Fazza CRM Automation - Simple Deploy Script

echo "------------------------------------------------"
echo "🌐 Verificando ambiente de deploy..."
echo "------------------------------------------------"

# 1. Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI não encontrado. Instalando via npm..."
    npm install -g vercel
else
    echo "✅ Vercel CLI já está instalado."
fi

# 2. Executar Deploy
echo "📤 Iniciando deploy no Vercel..."
# vercel --prod --yes faz o deploy e gera a URL final
# Usamos tail para pegar a última linha que contém a URL
DEPLOY_URL=$(vercel --prod --yes | tail -n 1)

echo "------------------------------------------------"
echo "✨ Deploy finalizado com sucesso!"
echo "------------------------------------------------"
echo "🔗 URL de produção:"
echo "$DEPLOY_URL"
echo "------------------------------------------------"
echo "💡 Lembre-se: Use esta URL + /api/webhooks/instagram"
echo "no painel do Facebook Developers."
