# 📖 Guia Super Simples - automacao-dm

Aqui está tudo o que você precisa saber para colocar sua automação para rodar rápido! 🚀

---

## 1. 🧪 Como testar no seu computador
Antes de tudo, veja se tudo está funcionando direitinho:

1. Abra o arquivo `test_local.sh` (ele liga o motor do sistema).
2. No terminal, rode o comando:
   ```bash
   python3 test_everything.py
   ```
3. Se tudo ficar **verde** no terminal, o sistema está perfeito! ✅

---

## 2. 🌍 Como colocar na Internet (Deploy)
Quando estiver pronto para o mundo real, use o script de deploy:

1. No terminal, rode:
   ```bash
   ./simple_deploy.sh
   ```
2. O script vai te dar um link secreto (tipo `meu-link.vercel.app`). **Copie esse link!** 💡

---

## 3. 📸 Como configurar no Instagram
Agora é só conectar com o Facebook/Instagram:

1. Vá no painel de desenvolvedor do Facebook.
2. Na parte de **Webhooks**, cole o link que você copiou do passo anterior.
3. **IMPORTANTE:** Adicione `/api/webhooks/instagram` no final do link.
   * Exemplo: `https://meu-link.vercel.app/api/webhooks/instagram`
4. Use o "Verify Token" que está no seu arquivo `.env`.

Pronto! Agora seu Instagram está no modo automático! 🤖🎉
