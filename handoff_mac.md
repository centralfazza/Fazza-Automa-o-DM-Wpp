# Contexto de Handoff para o Mac

## O que estava sendo feito no Windows
Tentamos autenticar a `Vercel CLI` e o `GitHub CLI` na máquina Windows para conseguir "empurrar" as atualizações mais recentes para produção e para o repositório. Além disso, identificamos o arquivo `.env.example` que contém as chaves e variáveis base (Supabase, IG Webhook Token, ID do Meta, etc).

## O que você precisa fazer no Mac (Próximos Passos)
1. **Puxar o código mais recente:** Após abrir o terminal do Mac na pasta do projeto, execute:
   ```bash
   git pull origin main
   ```
2. **Setup do ambiente:** Certifique-se de executar `npm install` (ou yarn/pnpm se for o padrão).
3. **Autenticação no Mac:**
   Caso ainda não esteja autenticado lá:
   ```bash
   gh auth login --web
   vercel login
   ```
4. **Variáveis de Ambiente (.env):** O arquivo `.env.example` lista as variáveis essenciais. Renomeie uma cópia para `.env` e preencha com as credenciais válidas do Meta, Vercel JWT app secret, e URL do Supabase, conforme necessário. Note que essas variáveis devem refletir também no deploy do Vercel caso precisem ser adicionadas via dashboard.
5. **Acompanhar e Evoluir:** O contexto pré-Windows envolvia "Adicionar Environment Variables" e "Configuring Instagram Webhooks". Revise as automações e verifique a comunicação webhooks no dashboard do Meta de acordo.

## Instrução para o Antigravity (Sessão do Mac)
Este documento foi criado durante uma sessão do Windows para facilitar o handoff do usuário. Considere os objetivos anteriores: auditar automações, consolidar integrações Meta/Instagram e finalizar ajustes de UI no CRM do Fazza. Leia as `directives` no repositório (caso existam) e aplique as regras que o usuário definiu (Stack standard: React 19 + Supabase).
