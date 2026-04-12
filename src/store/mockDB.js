import { supabase } from '../supabaseClient.js';

const INITIAL_GLOBAL_STATE = {
  minted: 0, maxSupply: 66600000, circulating: 0, burned: 0, usdtVault: 0, lpBalance: 0, activeContracts: 0
};

// State caching for synchronous reads where needed, updated via events
let cachedCurrentUser = null;

try {
  cachedCurrentUser = JSON.parse(localStorage.getItem('mdt_current_user'));
} catch (e) {}

// For backwards compatibility where initial state is needed before async fetch
export const getGlobalMetrics = () => INITIAL_GLOBAL_STATE;
export const getMdtData = getGlobalMetrics;
export const getSyncStatus = () => false;
export const initDB = () => {}; 
export const syncUsersFromSupabase = async () => {};

export const resetToGenesis = async () => {
  localStorage.clear();
  try {
    const { data: firstRow } = await supabase.from('contadores1').select('*').limit(1).single();
    if (firstRow) {
      const idColumn = Object.keys(firstRow).find(key => key.toLowerCase().includes('id')) || 'id';
      await supabase.from('contadores1').update({
        mdt_circulante: 0, usdt_vault: 0, ventas_globales: 0, contador_fomo: 365, quema_global: 0, lp_balance: 0, usuarios_json: '{}'
      }).eq(idColumn, firstRow[idColumn]);
    }
    // Delete all users except for founder maybe? We'll just delete all
    await supabase.from('mdt_users').delete().neq('id', 'something_impossible');
  } catch (e) {
    console.error("Critical wipe failed", e);
  }
  setTimeout(() => {
    if (typeof window !== 'undefined') window.location.href = '/login';
  }, 500);
};

if (typeof window !== 'undefined') {
  window.resetToGenesis = resetToGenesis;
}

// --- User Management ---
export async function getUserByEmail(email) {
  const { data } = await supabase.from('mdt_users').select('*').ilike('email', email).single();
  return data;
}

export async function getUserById(id) {
  const { data } = await supabase.from('mdt_users').select('*').eq('id', id).single();
  return data;
}

export async function saveUser(user, setAsCurrent = false) {
  const { error } = await supabase.from('mdt_users').upsert([user]);
  if (error) throw new Error(error.message);
  
  const localObj = JSON.parse(localStorage.getItem('mdt_current_user') || '{}');
  if (setAsCurrent || (localObj && localObj.id === user.id)) {
    cachedCurrentUser = user;
    localStorage.setItem('mdt_current_user', JSON.stringify(user));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('session-changed'));
  }
  return true;
}

export async function registerUser(email, username, password, referrerId, providedWallet = null) {
  const id = Date.now().toString();
  const newUser = {
    id,
    email,
    username,
    password, 
    wallet: providedWallet ? providedWallet : `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`,
    referrerId,
    mdtBalance: 0,
    usdtBalance: 0,
    contractStatus: 'PENDING',
    contractList: [],
    activeContractSales: 0,
    completedContracts: 0,
    hasDisplaced: false,
    daysRemaining: 365
  };
  
  try {
    // Check if duplicate email/username
    const { data: existing } = await supabase.from('mdt_users').select('id').or(`email.eq.${email},username.eq.${username}`);
    if (existing && existing.length > 0) {
      return { error: 'El correo o nombre de usuario ya está registrado.' };
    }

    await saveUser(newUser, true);
    return newUser;
  } catch (e) {
    return { error: e.message };
  }
}

export async function getReferrerList(refId) {
  const defaultList = [
    { position: 1, user: 'FUNDADOR FUEGO (QUEMA DE TOKEN)', wallet: '0xBURN...0001' },
    { position: 2, user: 'FUNDADOR AIRE (DEFI)', wallet: '0xDEFI...0002' },
    { position: 3, user: 'FUNDADOR BOVEDA (ROCA)', wallet: '0xROCA...0003' },
    { position: 4, user: 'FUNDADOR AGUA (POOL)', wallet: '0xPOOL...0004' },
    { position: 5, user: 'FUNDADOR (MENDIGO)', wallet: '0xFUNDADOR...MASTER' },
  ];

  if (!refId) return defaultList;

  let referrer;
  const { data: userById } = await supabase.from('mdt_users').select('*').eq('id', refId).single();
  if (userById) referrer = userById;
  else {
    const { data: userByUsername } = await supabase.from('mdt_users').select('*').eq('username', refId).single();
    if (userByUsername) referrer = userByUsername;
    else {
      const { data: userByWallet } = await supabase.from('mdt_users').select('*').eq('wallet', refId).single();
      referrer = userByWallet;
    }
  }

  if (referrer && referrer.contractList && referrer.contractList.length > 0) {
    return referrer.contractList;
  }
  return defaultList;
}

export async function loginUser(email, password) {
  const { data: user } = await supabase.from('mdt_users').select('*').ilike('email', email).single();
  if (user && user.password === password) {
    cachedCurrentUser = user;
    localStorage.setItem('mdt_current_user', JSON.stringify(user));
    window.dispatchEvent(new Event('session-changed'));
    return user;
  }
  return null;
}

// Since some components rely on synchronous user info
export function getCurrentUser() {
  try {
    const local = localStorage.getItem('mdt_current_user');
    cachedCurrentUser = local ? JSON.parse(local) : null;
  } catch (e) {
    cachedCurrentUser = null;
  }
  return cachedCurrentUser;
}

export async function getAllUsers() {
  const { data, error } = await supabase.from('mdt_users').select('*');
  if (error) {
    console.error("Supabase Error en getAllUsers:", error);
    throw new Error(error.message || "Error al conectar con la base de datos.");
  }
  return data || [];
}

// Helper to get active globals from Supabase
async function fetchGlobals() {
  const { data } = await supabase.from('contadores1').select('*').limit(1).single();
  if (!data) return INITIAL_GLOBAL_STATE;
  return {
    rowId: data.id || data.ID || data._id,
    minted: data.mdt_circulante || 0,
    maxSupply: 66600000,
    circulating: data.mdt_circulante || 0,
    burned: data.quema_global || 0,
    usdtVault: data.usdt_vault || 0,
    lpBalance: data.lp_balance || 0,
    activeContracts: data.ventas_globales || 0
  };
}

async function updateGlobals(globals) {
  const idColumn = Object.keys(globals).includes('rowId') ? 'id' : 'id'; // we need the real id column
  if (!globals.rowId) return; // fail safe
  
  await supabase.from('contadores1').update({
    mdt_circulante: globals.circulating,
    usdt_vault: globals.usdtVault,
    ventas_globales: globals.activeContracts,
    quema_global: globals.burned,
    lp_balance: globals.lpBalance
  }).eq(idColumn, globals.rowId);
  window.dispatchEvent(new Event('storage'));
}

// --- Contract Actions ---
export const purchaseContract = async (walletAddress) => {
  const { data: user } = await supabase.from('mdt_users').select('*').eq('wallet', walletAddress).single();
  if (!user) return false;

  const { count } = await supabase.from('mdt_users').select('*', { count: 'exact', head: true });
  const isGenesis = count === 1;

  const systemList = await getReferrerList(user.referrerId || 'ADMIN_DSF');
  return await buyCourse(user.id, systemList, isGenesis);
};

export const buyCourse = async (userId, inheritedList, isGenesis = false) => {
  const globals = await fetchGlobals();
  const { data: user } = await supabase.from('mdt_users').select('*').eq('id', userId).single();
  if (!user) throw new Error("User not found");

  if (!isGenesis && globals.minted >= globals.maxSupply) {
    throw new Error("Hard Cap reached. No more MDT can be minted.");
  }

  if (isGenesis) {
    const MINT_AMOUNT = 30;
    const USDT_FUND = 30;
    globals.minted += MINT_AMOUNT;
    globals.circulating += MINT_AMOUNT;
    globals.usdtVault += USDT_FUND;
    globals.activeContracts = 0;

    user.mdtBalance = (user.mdtBalance || 0) + MINT_AMOUNT;
    user.contractStatus = 'ACTIVE';
    user.daysRemaining = 365;
    user.activeContractSales = 0;

    user.contractList = [
      { position: 1, user: 'FUNDADOR FUEGO (QUEMA DE TOKEN)', wallet: '0xBURN...0001' },
      { position: 2, user: 'FUNDADOR AIRE (DEFI)', wallet: '0xDEFI...0002' },
      { position: 3, user: 'FUNDADOR BOVEDA (ROCA)', wallet: '0xROCA...0003' },
      { position: 4, user: 'FUNDADOR AGUA (POOL)', wallet: '0xPOOL...0004' },
      { position: 5, user: 'FUNDADOR (MENDIGO)', wallet: user.wallet }
    ];

    await saveUser(user);
    await updateGlobals(globals);
  } else {
    // Phase 2: Dynamic Value Math for Regular Purchase
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

    // Time reduction for all users
    const timeReductionRatio = TOKENS_MINTED / 182465.75;
    // We update everyone's days remaining
    // For performance in a real app this is risky, but we simulate it by fetching all active users
    const { data: allUsers } = await supabase.from('mdt_users').select('id, daysRemaining');
    if (allUsers) {
      const updates = allUsers.map(u => ({
        id: u.id,
        daysRemaining: Math.max(0, u.daysRemaining - timeReductionRatio)
      }));
      await supabase.from('mdt_users').upsert(updates);
    }

    // Pay inherited list
    for (const pos of inheritedList) {
      if (!pos.user) continue;
      let match;
      if (pos.wallet && pos.wallet.startsWith('0x')) {
          const res = await supabase.from('mdt_users').select('*').eq('wallet', pos.wallet).limit(1);
          match = res.data;
      }
      if (!match || match.length === 0) {
          const res = await supabase.from('mdt_users').select('*').eq('username', pos.user).limit(1);
          match = res.data;
      }

      if (match && match.length > 0) {
        let u = match[0];
        u.mdtBalance = (u.mdtBalance || 0) + mdtPerUser;
        await saveUser(u);
      }
    }

    if (user.referrerId) {
      let directReferrer;
      const resId = await supabase.from('mdt_users').select('*').eq('id', user.referrerId).limit(1);
      if (resId.data && resId.data.length > 0) directReferrer = resId.data;
      else {
        const resWallet = await supabase.from('mdt_users').select('*').eq('wallet', user.referrerId).limit(1);
        if (resWallet.data && resWallet.data.length > 0) directReferrer = resWallet.data;
        else {
          const resUsername = await supabase.from('mdt_users').select('*').eq('username', user.referrerId).limit(1);
          if (resUsername.data && resUsername.data.length > 0) directReferrer = resUsername.data;
        }
      }

      if (directReferrer && directReferrer.length > 0) {
        let u = directReferrer[0];
        u.activeContractSales = (u.activeContractSales || 0) + 1;
        await saveUser(u);
      }
    }

    // Developer payment
    const { data: devQuery } = await supabase.from('mdt_users').select('*').eq('email', 'dev@mendigotoken.com').limit(1);
    let developer = devQuery && devQuery.length > 0 ? devQuery[0] : null;
    if (!developer) {
      developer = {
        id: 'DEV_SYS_01', email: 'dev@mendigotoken.com', username: 'Desarrollador',
        password: '123', wallet: '0xDEV...MASTER', referrerId: null,
        mdtBalance: 0, usdtBalance: 0, contractStatus: 'ACTIVE',
        contractList: [], activeContractSales: 0, completedContracts: 0, hasDisplaced: false, daysRemaining: 365
      };
    }
    developer.mdtBalance = (developer.mdtBalance || 0) + mdtForDev;
    developer.usdtBalance = Math.max(0, (developer.usdtBalance || 0) - 0.005);
    await saveUser(developer);

    user.contractStatus = 'ACTIVE';
    user.daysRemaining = 365;

    user.contractList = [
      { position: 1, user: inheritedList[1]?.user || 'Unknown', wallet: inheritedList[1]?.wallet || '0x...' },
      { position: 2, user: inheritedList[2]?.user || 'Unknown', wallet: inheritedList[2]?.wallet || '0x...' },
      { position: 3, user: inheritedList[3]?.user || 'Unknown', wallet: inheritedList[3]?.wallet || '0x...' },
      { position: 4, user: inheritedList[4]?.user || 'Unknown', wallet: inheritedList[4]?.wallet || '0x...' },
      { position: 5, user: user.username, wallet: user.wallet }
    ];
    
    await saveUser(user);
    await updateGlobals(globals);
  }

  return true;
};

// --- Withdraw / Send ---
export const withdrawMDT = async (userId, amount) => {
  const globals = await fetchGlobals();
  const { data: user } = await supabase.from('mdt_users').select('*').eq('id', userId).single();
  if (user.mdtBalance < amount) throw new Error("Insufficient MDT balance");

  const currentPrice = globals.circulating > 0 && globals.usdtVault > 0
    ? globals.usdtVault / globals.circulating
    : 1.00;

  const usdtValueRaw = amount * currentPrice;
  const fee = usdtValueRaw * 0.066;
  const usdtCredit = usdtValueRaw - fee;

  globals.circulating -= amount;
  globals.burned += amount;
  globals.usdtVault -= usdtCredit;

  user.mdtBalance -= amount;
  user.usdtBalance = (user.usdtBalance || 0) + usdtCredit;

  await saveUser(user, true); // update current cache
  await updateGlobals(globals);

  return usdtCredit;
};

export const sendMDT = async (senderId, receiverEmail, amount) => {
  const { data: sender } = await supabase.from('mdt_users').select('*').eq('id', senderId).single();
  
  let receiver;
  const resEmail = await supabase.from('mdt_users').select('*').ilike('email', receiverEmail).single();
  if (resEmail.data) receiver = resEmail.data;
  else {
      const resWallet = await supabase.from('mdt_users').select('*').eq('wallet', receiverEmail).single();
      if (resWallet.data) receiver = resWallet.data;
  }

  if (!receiver) throw new Error("Destinatario no encontrado (verifica Email o Billetera)");
  if (sender.mdtBalance < amount) throw new Error("Insufficient MDT balance");

  sender.mdtBalance -= amount;
  receiver.mdtBalance = (receiver.mdtBalance || 0) + amount;

  if (!sender.hasDisplaced) {
    sender.hasDisplaced = true;
  }

  await saveUser(receiver);
  await saveUser(sender, true);
};

// --- INJECTION TESTS ---
export const runStressTest = async () => {
  const globals = await fetchGlobals();
  for (let i = 0; i < 100; i++) {
    const currentPrice = globals.circulating > 0 && globals.usdtVault > 0
      ? globals.usdtVault / globals.circulating
      : 1.00;
    const USDT_INJECTED = 6.00;
    const TOKENS_MINTED = USDT_INJECTED / currentPrice;

    globals.minted += TOKENS_MINTED;
    globals.circulating += TOKENS_MINTED;
    globals.usdtVault += USDT_INJECTED;
    globals.lpBalance = (globals.lpBalance || 0) + (0.50 / currentPrice);
    globals.activeContracts = (globals.activeContracts || 0) + 1; 
  }
  await updateGlobals(globals);
  return true;
};

export const injectMatrixTest = async (batchSize, referrerId = null) => {
  // Skipping intensive Supabase operations for matrix test to avoid rate limits,
  // This originally modified localStorage synchronous trees.
  // For production, this requires an Edge Function. We will do a mocked version that updates globals directly.
  const globals = await fetchGlobals();
  let modified = false;

  for (let i = 0; i < batchSize; i++) {
    const currentPrice = globals.circulating > 0 && globals.usdtVault > 0
      ? globals.usdtVault / globals.circulating
      : 1.00;

    const USDT_INJECTED = 6.00;
    const TOKENS_MINTED = USDT_INJECTED / currentPrice;

    globals.minted += TOKENS_MINTED;
    globals.circulating += TOKENS_MINTED;
    globals.usdtVault += USDT_INJECTED;
    globals.lpBalance = (globals.lpBalance || 0) + (0.50 / currentPrice);
    globals.activeContracts = (globals.activeContracts || 0) + 1; 
    modified = true;

    // Give visual feedback for Founder stress test
    if (referrerId === 'ADMIN_DSF') {
        const cached = JSON.parse(localStorage.getItem('mdt_current_user') || '{}');
        if (cached.id) {
            cached.mdtBalance = (cached.mdtBalance || 0) + (1.00 / currentPrice);
            cached.activeContractSales = (cached.activeContractSales || 0) + 1;
            localStorage.setItem('mdt_current_user', JSON.stringify(cached));
        }
    }
  }

  if (modified) {
    await updateGlobals(globals);
  }
  return true;
};

