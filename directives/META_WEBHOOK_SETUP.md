# Guia: Configuração de Webhook no Meta Developer Portal

Siga estes passos para conectar seu aplicativo ao Instagram e começar a receber eventos em tempo real.

## 1. Pré-requisitos
- Ter uma conta no [Meta for Developers](https://developers.facebook.com/).
- Ter um App criado (tipo "Empresa" ou "Consumidor") com o produto **Instagram Graph API** adicionado.
- URL pública do seu projeto (Vercel ou túnel local).

## 2. Configurando o Webhook

1. No painel do seu App Meta, vá em **Webhooks** no menu lateral.
2. No dropdown no topo da página, selecione **Instagram**.
3. Clique em **Editar Assinatura** (ou configurar).
4. Preencha os campos com as informações encontradas em **Configurações > Integração Meta** no seu painel Fazza:
   - **URL de retorno (Callback URL):** `https://[seu-portal]/api/webhooks/instagram`
   - **Token de verificação (Verify Token):** `fazza_instagram_webhook_2024`
5. Clique em **Verificar e Salvar**.

## 3. Selecionando Eventos (Fields)

Após salvar a URL, você verá uma lista de campos. Clique em **Assinar (Subscribe)** nos seguintes itens:
- `messages` (DMs)
- `comments` (Comentários em posts/reels)
- `messaging_postbacks` (Botões clicados em DMs)

## 4. Gerando o App Secret

Para que o backend possa validar que as mensagens vêm realmente do Facebook:
1. Vá em **Configurações > Painel das configurações do app** (Settings > Basic).
2. Procure por **Chave Secreta do Aplicativo (App Secret)**.
3. Clique em **Mostrar** e copie o valor.
4. Adicione esse valor ao seu arquivo `.env` na variável `APP_SECRET` e `INSTAGRAM_APP_SECRET`.

> [!TIP]
> Lembre-se de colocar seu App em **Modo Ao Vivo (Live Mode)** no topo da página do Facebook Developers para que os webhooks funcionem para todos os usuários, não apenas para os testadores do app.
