import fs from 'fs';

// Mock localStorage
global.localStorage = {
  data: {},
  getItem(key) { return this.data[key] || null; },
  setItem(key, value) { this.data[key] = String(value); },
  removeItem(key) { delete this.data[key]; },
  clear() { this.data = {}; }
};

// We will read the logic directly due to Vite ecosystem complexities, but actually importing it works since Node supports ESM
import { initDB, buyCourse, getGlobalMetrics, registerUser } from './src/store/mockDB.js';

async function runTest() {
    console.log("--- INICIANDO SIMULACIÓN MDT ---");
    
    // 1. Limpiar e Inicializar
    localStorage.clear();
    initDB();
    console.log("1. Base de datos inicializada (Estado Cero).");
    console.log("Métricas Globales Iniciales:", getGlobalMetrics());

    // 2. Simular Registro de FUNDADOR (Génesis)
    console.log("\n2. Registrando FUNDADOR y Ejecutando Evento Génesis (FUNDADOR inyecta 30 USDT)...");
    const adminUser = registerUser('admin@mendigotoken.com', 'FUNDADOR', '123', null);
    try {
        buyCourse(adminUser.id, [], true); // isGenesis = true
    } catch (e) {
        console.error("Error en Génesis:", e.message);
    }
    
    const postGenesisMetrics = getGlobalMetrics();
    const devUser = JSON.parse(localStorage.getItem('mdt_users'))[adminUser.id];
    console.log("Métricas Globales Post-Génesis:", {
        minted: postGenesisMetrics.minted,
        usdtVault: postGenesisMetrics.usdtVault,
        currentPrice: postGenesisMetrics.currentPrice,
        circulating: postGenesisMetrics.circulating
    });
    console.log(`Balance del Desarrollador (FUNDADOR): ${devUser.mdtBalance} MDT`);

    // 3. Simular Registro de un Usuario Nuevo (Venta Regular)
    console.log("\n3. Registrando nuevo usuario y ejecutando Primera Inyección (6 USDT)...");
    const newUser = registerUser('test@user.com', 'Tester', '123', 'ADMIN_DSF');
    // We simulate the systemList passed from FUNDADOR
    const sysList = [
        { position: 1, user: 'FUNDADOR', wallet: '0xFUNDADOR' },
        { position: 2, user: 'FUNDADOR', wallet: '0xFUNDADOR' },
        { position: 3, user: 'FUNDADOR', wallet: '0xFUNDADOR' },
        { position: 4, user: 'FUNDADOR', wallet: '0xFUNDADOR' },
        { position: 5, user: 'FUNDADOR', wallet: '0xFUNDADOR' },
    ];
    
    console.log("   -> El usuario inyecta 6 USDT al contrato.");
    buyCourse(newUser.id, sysList, false);

    const postSaleMetrics = getGlobalMetrics();
    console.log("Métricas Globales Post-Venta:");
    console.log({
        minted: postSaleMetrics.minted,
        usdtVault: postSaleMetrics.usdtVault,
        currentPrice: postSaleMetrics.currentPrice,
        circulating: postSaleMetrics.circulating
    });
    
    console.log("\n--- RESULTADO FINAL VALIDADOS ---");
    const mdtCambiado = postSaleMetrics.minted - postGenesisMetrics.minted;
    console.log(`MDT Acuñado Exacto por 6 USDT: ${mdtCambiado} MDT`);
    console.log(`Precio del token justo antes de la venta: $${postGenesisMetrics.currentPrice}`);
    console.log(`Fórmula: 6 USDT / ${postGenesisMetrics.currentPrice} = ${mdtCambiado} MDT`);
}

runTest();
