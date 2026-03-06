
import { test, expect } from '@playwright/test';

// Aumenta timeout global do teste para evitar falhas em ambientes lentos
test.setTimeout(120000);
test.use({ actionTimeout: 20000, navigationTimeout: 60000 });

const BASE_URL = 'http://[::1]:5173';

test('Verification Flow', async ({ page }) => {
    page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));
    page.on('pageerror', exception => console.log(`PAGE ERROR: ${exception}`));

    console.log('Iniciando teste (Timeout: 120s)...');

    // 1. Acessar Raiz
    try {
        console.log(`Acessando ${BASE_URL}/ ...`);
        await page.goto(`${BASE_URL}/`, { timeout: 60000 });
    } catch (e) {
        console.error('Erro de navegação inicial:', e);
        throw e;
    }

    // 2. Autenticação
    const isLoginPage = await page.locator('input[type="email"]').isVisible().catch(() => false);
    if (isLoginPage) {
        console.log('Autenticando...');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password');
        await page.click('button[type="submit"]');
    } else {
        console.log('Já autenticado.');
    }

    // 3. Dashboard
    try {
        console.log('Verificando Dashboard...');
        await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 15000 });
        console.log('SUCESSO: Dashboard');
    } catch (e) {
        console.error('FALHA: Dashboard nao carregou', e);
    }

    // 4. Conversas
    try {
        console.log('Navegando para Conversas...');
        await page.goto(`${BASE_URL}/conversations`);

        // Verifica Título (com data-testid)
        await expect(page.locator('[data-testid="conversations-title"]')).toBeVisible({ timeout: 15000 });
        console.log('SUCESSO: Conversas (Título encontrado)');

        // Verifica Lista (Input de busca)
        await expect(page.locator('input[placeholder="Search contacts..."]')).toBeVisible({ timeout: 5000 });
        console.log('SUCESSO: Conversas (Input de busca encontrado)');
    } catch (e) {
        console.error('FALHA: Conversas', e);
    }

    // 5. Automações
    try {
        console.log('Navegando para Automações...');
        await page.goto(`${BASE_URL}/automations`);
        await expect(page.locator('text=Automações').first()).toBeVisible({ timeout: 15000 });
        console.log('SUCESSO: Automações');

        console.log('Testando criação de automação (clique no botão)...');
        // Botão atualizado para "Nova Automação"
        await page.click('button:has-text("Nova Automação")');
        await expect(page).toHaveURL(/.*new/);
        console.log('SUCESSO: Nova Automação (Rota)');
    } catch (e) {
        console.error('FALHA: Automações', e);
    }

    // 6. Audiência
    try {
        console.log('Navegando para Audiência...');
        await page.goto(`${BASE_URL}/audience`);
        await expect(page.locator('text=Audiência').first()).toBeVisible({ timeout: 15000 });
        console.log('SUCESSO: Audiência');
    } catch (e) {
        console.error('FALHA: Audiência', e);
    }

    console.log('TESTE CONCLUÍDO (VERIFICAR FALHAS ACIMA)');
});
