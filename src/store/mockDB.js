import { supabase } from '../supabaseClient.js';

let syncTimeout = null;

const syncGlobalStateToSupabase = async (globals) => {
  if (syncTimeout) clearTimeout(syncTimeout);
  
  // Create a deep copy of globals to avoid mutation by reference during timeout
  const snapshot = JSON.parse(JSON.stringify(globals));
  
  // Debounce Supabase writes to prevent race conditions during stress testing
  syncTimeout = setTimeout(async () => {
    try {
      const dailyQuota = snapshot.maxSupply / 365;
      const fomoDaysRemaining = Math.max(0, 365 - Math.floor(snapshot.minted / dailyQuota));

      await supabase.from('contadores1').update({
        mdt_circulante: snapshot.circulating,
        mdt_balance: snapshot.usdtVault,
        ventas_globales: snapshot.activeContracts,
        contador_fomo: fomoDaysRemaining,
        usuarios_json: localStorage.getItem('mdt_users') || '{}'
      }).eq('id', 1);
    } catch (e) {
      console.error("Supabase sync failed", e);
    }
  }, 1000);
};

export const syncUsersFromSupabase = async () => {
  try {
    const { data, error } = await supabase.from('contadores1').select('usuarios_json').eq('id', 1).single();
    if (data && data.usuarios_json && data.usuarios_json !== '{}') {
      // Solo importamos si la nube tiene datos sustanciales
      const cloudUsers = JSON.parse(data.usuarios_json);
      if (Object.keys(cloudUsers).length > 0) {
        localStorage.setItem('mdt_users', JSON.stringify(cloudUsers));
        window.dispatchEvent(new Event('storage'));
      }
    }
  } catch (e) {
    console.error("Supabase pull users failed", e);
  }
};

const setGlobalState = (globals) => {
  localStorage.setItem('mdt_global_state', JSON.stringify(globals));
  syncGlobalStateToSupabase(globals);
};

export const resetToGenesis = async () => {
  localStorage.clear();
  initDB();
  const emptyState = JSON.parse(localStorage.getItem('mdt_global_state'));
  await syncGlobalStateToSupabase(emptyState);
  if (typeof window !== 'undefined') window.location.href = '/login';
};

if (typeof window !== 'undefined') {
  window.resetToGenesis = resetToGenesis;
}

// src/store/mockDB.js
const INITIAL_GLOBAL_STATE = {
  minted: 0,
  maxSupply: 66600000,
  circulating: 0,
  burned: 0,
  usdtVault: 0,
  lpBalance: 0, // Liquidity Pool balance in MDT
  activeContracts: 0 // Global user contracts active
};

// --- Initialization ---
export const initDB = () => {
  if (!localStorage.getItem('mdt_global_state')) {
    setGlobalState(INITIAL_GLOBAL_STATE);
  }
  if (!localStorage.getItem('mdt_users')) {
    localStorage.setItem('mdt_users', JSON.stringify({}));
  }

  // ADMIN_DSF AUTO-CREATION DISABLED FOR GENESIS TESTING
  // Uncomment this block if you want the admin user to be forced-created again.
  /*
  const adminRef = 'ADMIN_DSF';
  const users = JSON.parse(localStorage.getItem('mdt_users') || '{}');
  const existingAdmin = users[adminRef];
  
  if (!existingAdmin || existingAdmin.password !== '123') {
    users[adminRef] = {
      ...(existingAdmin || {}),
      id: adminRef,
      email: 'admin@mendigotoken.com',
      username: 'Daniel Spencer (DSF)',
      password: '123',
      wallet: '0xDSF...0000',
      mdtBalance: 0,
      usdtBalance: 0,
      daysRemaining: 365,
      activeContractSales: 0,
      completedContracts: 0,
      contractList: [
        { position: 1, user: 'System1', wallet: '0xSYS1' },
        { position: 2, user: 'System2', wallet: '0xSYS2' },
        { position: 3, user: 'System3', wallet: '0xSYS3' },
        { position: 4, user: 'Daniel Spencer (DSF)', wallet: '0xDSF...0000' },
        { position: 5, user: 'Open', wallet: '0xOPEN' }
      ]
    };
    localStorage.setItem('mdt_users', JSON.stringify(users));
    localStorage.setItem('mdt_system_initialized', 'true');
  }
  */
};

// --- Global Metrics ---
export const getGlobalMetrics = () => {
  const stateStr = localStorage.getItem('mdt_global_state');
  if (!stateStr) return INITIAL_GLOBAL_STATE;

  const state = JSON.parse(stateStr);
  const progressPercent = (state.minted / state.maxSupply) * 100;
  // User Formula: Vault USDT / MDT Circulating (Dollars per Token)
  const currentPrice = state.circulating > 0 && state.usdtVault > 0
    ? state.usdtVault / state.circulating
    : 1.00; // Initial default price starting at $1.00

  const marketCap = state.circulating * currentPrice;
  const scarcity = state.maxSupply - state.circulating;
  // Backing ensures that if it's new it's 1.00, if not it's the real backing.
  const backing = state.circulating > 0 ? state.usdtVault / state.circulating : 1.00;

  // FOMO Logic: 66.6 million tokens divided by 365 days = 182,465.75 tokens per day quota.
  // Every time the total minted reaches a multiple of this quota, a day is subtracted.
  const dailyQuota = state.maxSupply / 365;
  const daysMinted = Math.floor(state.minted / dailyQuota);
  const fomoDaysRemaining = Math.max(0, 365 - daysMinted);

  return {
    ...state,
    progressPercent: progressPercent.toFixed(2),
    currentPrice: currentPrice.toFixed(4),
    marketCap: marketCap.toFixed(2),
    scarcity: scarcity,
    backing: backing.toFixed(4),
    fomoDays: fomoDaysRemaining,
    dailyQuota: dailyQuota,
    activeContracts: state.activeContracts || 0
  };
};

export const getMdtData = getGlobalMetrics;

// --- User Management ---
export function getUserByEmail(email) {
  const users = JSON.parse(localStorage.getItem('mdt_users') || '{}');
  return Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id) {
  const users = JSON.parse(localStorage.getItem('mdt_users') || '{}');
  return users[id];
}

export function saveUser(user, setAsCurrent = false) {
  const users = JSON.parse(localStorage.getItem('mdt_users') || '{}');
  users[user.id] = user;
  localStorage.setItem('mdt_users', JSON.stringify(users));

  if (setAsCurrent) {
    localStorage.setItem('mdt_current_user', JSON.stringify(user));
    window.dispatchEvent(new Event('session-changed'));
  } else {
    // Update current session user only if modifying self
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === user.id) {
      localStorage.setItem('mdt_current_user', JSON.stringify(user));
      window.dispatchEvent(new Event('session-changed'));
    }
  }

  // Empujar pasivamente a toda la red a la nube siempre que cambie un perfil (como en un nuevo registro orgánico)
  const globals = JSON.parse(localStorage.getItem('mdt_global_state') || JSON.stringify(INITIAL_GLOBAL_STATE));
  syncGlobalStateToSupabase(globals);
}

export function registerUser(email, username, password, referrerId) {
  const users = JSON.parse(localStorage.getItem('mdt_users') || '{}');
  const id = Date.now().toString();
  const newUser = {
    id,
    email,
    username,
    password, // In a real app this should be hashed
    wallet: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    referrerId,
    mdtBalance: 0,
    usdtBalance: 0,
    contractStatus: 'PENDING',
    contractList: [],
    activeContractSales: 0,
    completedContracts: 0
  };
  // No set as current si es bot. (solo true si no hay parametro setAsCurrent o si forzamos true, espera, registerUser(email, username, password, referrerId, isBot=false))
  saveUser(newUser, true); // We keep true here for backward compat, but we will make bots explicitly inside the test.
  return newUser;
}

export const getReferrerList = (refId) => {
  const users = JSON.parse(localStorage.getItem('mdt_users') || '{}');
  const referrer = Object.values(users).find(u => u.id === refId || u.username === refId || u.wallet === refId);

  if (referrer && referrer.contractList && referrer.contractList.length > 0) {
    return referrer.contractList;
  }

  return [
    { position: 1, user: 'FUNDADOR FUEGO (QUEMA DE TOKEN)', wallet: '0xBURN...0001' },
    { position: 2, user: 'FUNDADOR AIRE (DEFI)', wallet: '0xDEFI...0002' },
    { position: 3, user: 'FUNDADOR BOVEDA (ROCA)', wallet: '0xROCA...0003' },
    { position: 4, user: 'FUNDADOR AGUA (POOL)', wallet: '0xPOOL...0004' },
    { position: 5, user: 'FUNDADOR (MENDIGO)', wallet: '0xFUNDADOR...MASTER' },
  ];
};

export function loginUser(email, password) {
  const users = JSON.parse(localStorage.getItem('mdt_users') || '{}');
  const user = Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user && user.password === password) {
    localStorage.setItem('mdt_current_user', JSON.stringify(user));
    window.dispatchEvent(new Event('session-changed'));
    return user;
  }
  return null;
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('mdt_current_user');
  return userStr ? JSON.parse(userStr) : null;
}

export function getAllUsers() {
  const users = JSON.parse(localStorage.getItem('mdt_users') || '{}');
  return Object.values(users);
}

// --- Contract Actions ---
export const purchaseContract = (walletAddress) => {
  // Wrapper for backwards compatibility with the current component call
  const users = JSON.parse(localStorage.getItem('mdt_users') || '{}');
  const user = Object.values(users).find(u => u.wallet === walletAddress);
  if (!user) return false;

  // Check if Genesis: If there is exactly 1 user in the DB (the one who just registered)
  const isGenesis = Object.keys(users).length === 1;

  // In the real flow, the inheritedList is passed from the referrer.
  // If the user has a referrerId, use it; otherwise fallback to the master admin.
  const systemList = getReferrerList(user.referrerId || 'ADMIN_DSF');
  return buyCourse(user.id, systemList, isGenesis);
};

export const buyCourse = (userId, inheritedList, isGenesis = false) => {
  let globals = JSON.parse(localStorage.getItem('mdt_global_state') || JSON.stringify(INITIAL_GLOBAL_STATE));
  const users = JSON.parse(localStorage.getItem('mdt_users') || '{}');
  const user = users[userId];

  if (!isGenesis && globals.minted >= globals.maxSupply) {
    throw new Error("Hard Cap reached. No more MDT can be minted.");
  }

  if (isGenesis) {
    const MINT_AMOUNT = 30; // 30 MDT
    const USDT_FUND = 30;   // 30 USDT
    globals.minted += MINT_AMOUNT;
    globals.circulating += MINT_AMOUNT;
    globals.usdtVault += USDT_FUND;
    globals.activeContracts = 0;

    user.mdtBalance = (user.mdtBalance || 0) + MINT_AMOUNT;
    user.contractStatus = 'ACTIVE';
    user.daysRemaining = 365;
    user.activeContractSales = 0;

    // Fill the list with the Founder's wallet for all 5 positions
    const newList = [
      { position: 1, user: 'FUNDADOR FUEGO (QUEMA DE TOKEN)', wallet: '0xBURN...0001' },
      { position: 2, user: 'FUNDADOR AIRE (DEFI)', wallet: '0xDEFI...0002' },
      { position: 3, user: 'FUNDADOR BOVEDA (ROCA)', wallet: '0xROCA...0003' },
      { position: 4, user: 'FUNDADOR AGUA (POOL)', wallet: '0xPOOL...0004' },
      { position: 5, user: 'FUNDADOR (MENDIGO)', wallet: user.wallet }
    ];
    user.contractList = newList;

    users[userId] = user;
    localStorage.setItem('mdt_users', JSON.stringify(users));

    const currentUser = JSON.parse(localStorage.getItem('mdt_current_user') || '{}');
    if (currentUser.id === user.id) {
      localStorage.setItem('mdt_current_user', JSON.stringify(user));
    }

  } else {
    // Phase 2: Dynamic Value Math for Regular Purchase
    // Dollars per Token
    const currentPrice = globals.circulating > 0 && globals.usdtVault > 0 
      ? globals.usdtVault / globals.circulating 
      : 1.00;
    const USDT_INJECTED = 6.00;
    const TOKENS_MINTED = USDT_INJECTED / currentPrice;

    globals.minted += TOKENS_MINTED;
    globals.circulating += TOKENS_MINTED;
    globals.usdtVault += USDT_INJECTED;
    globals.activeContracts = (globals.activeContracts || 0) + 1;

    const mdtPerUser = 1.00 / currentPrice;
    const mdtForDev = 0.50 / currentPrice;
    const mdtForLp = 0.50 / currentPrice;

    globals.lpBalance = (globals.lpBalance || 0) + mdtForLp;

    const timeReductionRatio = TOKENS_MINTED / 182465.75;
    Object.keys(users).forEach(k => {
      users[k].daysRemaining = Math.max(0, users[k].daysRemaining - timeReductionRatio);
    });

    inheritedList.forEach(pos => {
      const match = Object.values(users).find(u => u.username === pos.user || u.wallet === pos.wallet);
      if (match) {
        match.mdtBalance = (match.mdtBalance || 0) + mdtPerUser;
      }
    });

    if (user.referrerId) {
      let directReferrer = Object.values(users).find(u => u.id === user.referrerId || u.wallet === user.referrerId || u.username === user.referrerId);
      if (directReferrer) {
        directReferrer.activeContractSales = (directReferrer.activeContractSales || 0) + 1;
        users[directReferrer.id] = directReferrer;
      }
    }

    let developer = Object.values(users).find(u => u.email === 'dev@mendigotoken.com');
    if (!developer) {
      developer = {
        id: 'DEV_SYS_01', email: 'dev@mendigotoken.com', username: 'Desarrollador',
        password: '123', wallet: '0xDEV...MASTER', referrerId: null,
        mdtBalance: 0, usdtBalance: 0, contractStatus: 'ACTIVE',
        contractList: [], activeContractSales: 0, completedContracts: 0
      };
    }

    developer.mdtBalance = (developer.mdtBalance || 0) + mdtForDev;
    developer.usdtBalance = Math.max(0, (developer.usdtBalance || 0) - 0.005);
    users[developer.id] = developer;

    user.mdtBalance = (user.mdtBalance || 0);
    user.contractStatus = 'ACTIVE';
    user.daysRemaining = 365;

    const newList = [
      { position: 1, user: inheritedList[1]?.user || 'Unknown', wallet: inheritedList[1]?.wallet || '0x...' },
      { position: 2, user: inheritedList[2]?.user || 'Unknown', wallet: inheritedList[2]?.wallet || '0x...' },
      { position: 3, user: inheritedList[3]?.user || 'Unknown', wallet: inheritedList[3]?.wallet || '0x...' },
      { position: 4, user: inheritedList[4]?.user || 'Unknown', wallet: inheritedList[4]?.wallet || '0x...' },
      { position: 5, user: user.username, wallet: user.wallet }
    ];
    user.contractList = newList;
    users[userId] = user;
    localStorage.setItem('mdt_users', JSON.stringify(users));
  }

  // Sincronizar el usuario logueado en pantalla para que reciba el pago en su UI al instante
  const currentUser = JSON.parse(localStorage.getItem('mdt_current_user') || '{}');
  if (currentUser && currentUser.id && users[currentUser.id]) {
    localStorage.setItem('mdt_current_user', JSON.stringify(users[currentUser.id]));
    window.dispatchEvent(new Event('session-changed'));
  }

  // AHORA QUE mdt_users ESTÁ FORMALMENTE GUARDADO Y COMPLETO EN LOCALSTORAGE...
  // ...SUBIMOS EL ESTADO DE CONTADORES A SUPABASE JUNTO CON EL GRAN JSON
  setGlobalState(globals);

  return true;
};

// --- Withdraw / Send ---
export const withdrawMDT = (userId, amount) => {
  let globals = JSON.parse(localStorage.getItem('mdt_global_state'));
  let users = JSON.parse(localStorage.getItem('mdt_users'));
  let user = users[userId];

  if (user.mdtBalance < amount) throw new Error("Insufficient MDT balance");

  // Price = Vault / Circulating (Dollars per Token)
  const currentPrice = globals.circulating > 0 && globals.usdtVault > 0
    ? globals.usdtVault / globals.circulating
    : 1.00;

  // If we have MDT, and we want USDT: USDT = MDT * Price
  const usdtValueRaw = amount * currentPrice;
  const fee = usdtValueRaw * 0.066;
  const usdtCredit = usdtValueRaw - fee;

  // Simulate burn
  globals.circulating -= amount;
  globals.burned += amount;

  // Deduct the credited USDT from the vault to ensure price goes UP by leaving the fee in the vault
  globals.usdtVault -= usdtCredit;

  user.mdtBalance -= amount;
  user.usdtBalance = (user.usdtBalance || 0) + usdtCredit;

  localStorage.setItem('mdt_users', JSON.stringify(users));
  localStorage.setItem('mdt_current_user', JSON.stringify(user));

  // Ahora enviamos el global (incluyendo el JSON actualizado)
  setGlobalState(globals);

  // Dispatch event to force React to update the user's live balance
  window.dispatchEvent(new Event('storage'));

  return usdtCredit;
};

export const sendMDT = (senderId, receiverEmail, amount) => {
  let users = JSON.parse(localStorage.getItem('mdt_users'));
  let sender = users[senderId];
  let receiver = Object.values(users).find(u => u.email === receiverEmail);

  if (!receiver) throw new Error("Receiver not found");
  if (sender.mdtBalance < amount) throw new Error("Insufficient MDT balance");

  sender.mdtBalance -= amount;
  receiver.mdtBalance = (receiver.mdtBalance || 0) + amount;

  // Simulate transfer Logic
  // If it's the sender's first transfer, trigger the shift list logic (Simulated here as a flag)
  if (!sender.hasDisplaced) {
    sender.hasDisplaced = true;
    // Logic to move DSF to pos 4 and shift is handled inside buyCourse inherently.
  }

  localStorage.setItem('mdt_users', JSON.stringify(users));
  localStorage.setItem('mdt_current_user', JSON.stringify(sender));

  // Forzar guardado transparente a la red (Supabase)
  const globals = JSON.parse(localStorage.getItem('mdt_global_state') || '{}');
  syncGlobalStateToSupabase(globals);

  // Dispatch event to force React to update the user's live balance
  window.dispatchEvent(new Event('storage'));
};

// --- STRESS TEST INJECTION ---
// Simulates 100 near-instantaneous contract purchases to test the dynamic charting, price impact, and frontend performance.
export const runStressTest = () => {
  let globals = JSON.parse(localStorage.getItem('mdt_global_state'));
  if (!globals) return false;

  for (let i = 0; i < 100; i++) {
    // Fast hardcoded math to stress the system (Dollars per Token)
    const currentPrice = globals.circulating > 0 && globals.usdtVault > 0
      ? globals.usdtVault / globals.circulating
      : 1.00;

    const USDT_INJECTED = 6.00;
    const TOKENS_MINTED = USDT_INJECTED / currentPrice;

    globals.minted += TOKENS_MINTED;
    globals.circulating += TOKENS_MINTED;
    globals.usdtVault += USDT_INJECTED;

    const mdtForLp = 0.50 / currentPrice;
    globals.lpBalance = (globals.lpBalance || 0) + mdtForLp;
    globals.activeContracts = (globals.activeContracts || 0) + 1; // Increment global contracts
  }

  setGlobalState(globals);
  return true;
};

// --- PROGRESSIVE MATRIX INJECTION ---
// Creates a literal 6x6 matrix tree of simulated users and mathematically executes the Smart Contract for EACH bot.
export const injectMatrixTest = (batchSize, referrerId = null) => {
  let users = JSON.parse(localStorage.getItem('mdt_users') || '{}');
  let founder = Object.values(users).find(u => u.email === 'dereckspencer1@gmail.com' || u.email === 'admin@mendigotoken.com' || u.email === 'fundador@mendigotoken.com' || u.username?.toUpperCase() === 'FUNDADOR' || u.username === 'Daniel Spencer (DSF)');

  if (!founder) return false;

  // We keep a BFS Queue to form the perfect 6x6 matrix mathematically
  let queue = JSON.parse(localStorage.getItem('mdt_matrix_queue') || '[]');
  let counts = JSON.parse(localStorage.getItem('mdt_matrix_counts') || '{}');

  if (queue.length === 0) {
    queue.push(founder.id);
    counts[founder.id] = 0;
  }

  for (let i = 0; i < batchSize; i++) {
    let parentId = queue[0];

    // Generate a real bot in the database
    const botId = `BOT_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const botWallet = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;

    users[botId] = {
      id: botId,
      email: `bot_${botId}@sim.com`,
      username: `Bot ${botId.split('_')[2]}`,
      password: '123',
      wallet: botWallet,
      referrerId: parentId,
      mdtBalance: 0,
      usdtBalance: 0,
      contractStatus: 'PENDING',
      contractList: [],
      activeContractSales: 0,
      completedContracts: 0
    };

    // Save immediately so buyCourse can see it
    localStorage.setItem('mdt_users', JSON.stringify(users));

    // Get inherited list from the strict direct parent
    const systemList = getReferrerList(parentId);

    // Execute the REAL SC logic for this bot
    buyCourse(botId, systemList, false);

    // Fetch mutated users from localStorage because buyCourse updated them!
    users = JSON.parse(localStorage.getItem('mdt_users') || '{}');

    // Parent referred this bot, update counts
    counts[parentId] = (counts[parentId] || 0) + 1;

    // The bot enters the queue to become a parent of 6 down the line
    queue.push(botId);
    counts[botId] = 0;

    // If parent has 6 children, pop them out of the BFS queue
    if (counts[parentId] >= 6) {
      queue.shift();
    }
  }

  // Save tree states
  localStorage.setItem('mdt_matrix_queue', JSON.stringify(queue));
  localStorage.setItem('mdt_matrix_counts', JSON.stringify(counts));

  return true;
};
