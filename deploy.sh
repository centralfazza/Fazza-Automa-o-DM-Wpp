#!/bin/bash

# 🚀 Fazza CRM Automation - Deployment Script (Vercel)

echo "------------------------------------------------"
echo "📤 Iniciando Deploy para Vercel"
echo "------------------------------------------------"

# 1. Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# 2. Executar Deploy
echo "🚀 Enviando arquivos..."
vercel --prod

echo "------------------------------------------------"
echo "✅ Deploy concluído com sucesso!"
echo "------------------------------------------------"
echo "⚠️  Lembre-se de configurar estas variáveis no Dashboard do Vercel:"
echo "1. APP_SECRET (Para validar assinaturas do Facebook)"
echo "2. INSTAGRAM_VERIFY_TOKEN (Para configurar o Webhook)"
echo "3. JWT_SECRET (Segurança da API)"
echo "4. DATABASE_URL (Opcional, sqlite padrão)"
echo "------------------------------------------------"
