# 🚀 Guia SUPER RÁPIDO: Configuração Instagram Graph API

Siga estes passos exatos para configurar a integração:

### 1. Facebook Developers
Acesse [developers.facebook.com/apps](https://developers.facebook.com/apps) e selecione seu App.

### 2. Adicionar Produto
Clique em **"Adicionar Produto"** no menu lateral e selecione **"Instagram Graph API"**.

### 3. Configurar Webhook
Vá em **Instagram Graph API > Configurações** (ou Webhooks no menu lateral):
- **Callback URL**: `https://automacao-dm-ivory.vercel.app/api/webhooks/instagram`
- **Verify Token**: `fazza_instagram_webhook_2024`
- **Subscrições (Campos)**: Subscreva em `comments` e `messages`.

### 4. Access Token (Longa Duração)
1. Vá em **Ferramentas > Gerenciador de Facilitação de Gráficos (Graph API Explorer)**.
2. Selecione seu App e o Usuário/Página corrretos.
3. Adicione as permissões: `instagram_basic`, `instagram_manage_messages`, `instagram_manage_comments`, `pages_manage_metadata`.
4. Gere o token e depois clique no botão (i) para abrir no **Access Token Tool** e obter o token de **longa duração (60 dias)**.

### 5. Testar Webhook
Use o botão **"Test"** na interface de Webhooks do Facebook ou envie uma mensagem direta para a conta do Instagram vinculada.

---
💡 **URL de Produção**: `https://automacao-dm-ivory.vercel.app`
