# 🚀 Fazza CRM Automation - Guia Rápido

Bem-vindo ao sistema de automação de DMs do Fazza CRM. Este guia ajudará você a colocar o sistema em funcionamento em poucos minutos.

## 📋 Pré-requisitos

- **Python 3.9+**
- **npm** (para o Vercel CLI)
- **Conta Business/Creator no Instagram** integrada a uma Página do Facebook.

## ⚡ Início Rápido (Local)

### 1. Preparar Ambiente
```bash
# Instalar dependências
pip3 install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env e defina seu APP_SECRET e INSTAGRAM_VERIFY_TOKEN
```

### 2. Rodar o Sistema
```bash
chmod +x test_local.sh
./test_local.sh
```
O servidor estará disponível em: `http://localhost:8000`

### 3. Testar Conexão
Acesse `http://localhost:8000/health` para verificar se o sistema está online.

---

## ☁️ Deploy (Vercel)

Para colocar o sistema em produção:
1. Execute `./deploy.sh`.
2. No painel do Vercel, adicione as variáveis:
   - `APP_SECRET`: Sua App Secret do Facebook Developers.
   - `INSTAGRAM_VERIFY_TOKEN`: Um token de sua escolha para o webhook.
   - `JWT_SECRET`: Uma string aleatória segura.

---

## 🔗 Configuração Instagram (Webhook)

1. No [Facebook Developers](https://developers.facebook.com/), vá em **Webhooks**.
2. Selecione **Instagram** e clique em **Subscribe**.
3. **URL de Callback**: `https://seu-app.vercel.app/api/webhooks/instagram`
4. **Verify Token**: O mesmo que você definiu no `.env`.
5. Inscreva-se no campo `comments`.

---

## 🛠️ Documentação API

A documentação interativa (Swagger) está disponível em:
- Localmente: `http://localhost:8000/docs`
- Produção: `https://seu-app.vercel.app/docs`

---

## 🆘 Suporte e Logs

- Os logs de execução estão na tabela `analytics_logs` do banco SQLite.
- Verifique o terminal para logs em tempo real durante o desenvolvimento.
