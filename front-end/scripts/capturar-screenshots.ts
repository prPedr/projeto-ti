import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const EMAIL = process.env.SCREENSHOT_EMAIL || 'admin@admin.com';
const SENHA = process.env.SCREENSHOT_SENHA || 'admin123';

// Diretório de saída na raiz do projeto: <raiz>/docs/screenshots
const OUTPUT_DIR = path.resolve(process.cwd(), process.cwd().endsWith('front-end') ? '../docs/screenshots' : 'docs/screenshots');

async function executarCaptura() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`🚀 Iniciando captura de screenshots...`);
  console.log(`📍 Alvo: ${BASE_URL}`);
  console.log(`📁 Salvando em: ${OUTPUT_DIR}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    // 1. Realizar Login
    console.log('🔑 Efetuando login...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('#email');
    await page.fill('#email', EMAIL);
    await page.fill('#senha', SENHA);
    await page.click('button[type="submit"]');

    // Aguarda o redirecionamento pós-login
    await page.waitForURL(`${BASE_URL}/`);
    console.log('✅ Login realizado com sucesso!\n');

    // 2. Dashboard (dashboard.png)
    console.log('📸 Capturando Dashboard...');
    await page.waitForSelector('h1');
    // Aguarda um pequeno tempo adicional para animações/renderização de cards
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'dashboard.png'),
      fullPage: false,
    });
    console.log('   ↳ Gerado: docs/screenshots/dashboard.png');

    // 3. Listagem de Equipamentos (listagem-equipamentos.png)
    console.log('📸 Capturando Listagem de Equipamentos...');
    await page.goto(`${BASE_URL}/equipamentos`);
    await page.waitForSelector('h2');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'listagem-equipamentos.png'),
      fullPage: false,
    });
    console.log('   ↳ Gerado: docs/screenshots/listagem-equipamentos.png');

    // 4. Cadastro de Equipamento (cadastro-equipamento.png)
    console.log('📸 Capturando Formulário de Cadastro de Equipamento...');
    await page.goto(`${BASE_URL}/equipamentos/cadastro`);
    await page.waitForSelector('h2');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'cadastro-equipamento.png'),
      fullPage: false,
    });
    console.log('   ↳ Gerado: docs/screenshots/cadastro-equipamento.png');

    // 5. Mapeamento de Rede (mapeamento-rede.png)
    console.log('📸 Capturando Mapeamento de Rede...');
    await page.goto(`${BASE_URL}/mapeamento-rede`);
    await page.waitForSelector('h2');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'mapeamento-rede.png'),
      fullPage: false,
    });
    console.log('   ↳ Gerado: docs/screenshots/mapeamento-rede.png');

    // 6. Mapa de Portas do Switch (mapa-portas-switch.png)
    console.log('📸 Verificando existência de Switches para captura do mapa de portas...');
    await page.goto(`${BASE_URL}/switches`);
    await page.waitForSelector('h2');
    await page.waitForTimeout(500);

    const linhaSwitch = await page.$('tbody tr');
    if (linhaSwitch) {
      console.log('   ↳ Switch encontrado! Acessando mapa de portas...');
      await linhaSwitch.click();
      await page.waitForSelector('h2');
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, 'mapa-portas-switch.png'),
        fullPage: false,
      });
      console.log('   ↳ Gerado: docs/screenshots/mapa-portas-switch.png');
    } else {
      console.warn('   ⚠️ Nenhum switch cadastrado no banco de teste. Pulu a captura de mapa-portas-switch.png.');
    }

    console.log('\n🎉 Captura de screenshots concluída com sucesso!');
  } catch (erro) {
    console.error('❌ Erro durante a captura de screenshots:', erro);
  } finally {
    await browser.close();
  }
}

executarCaptura();
