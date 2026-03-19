import { supabase } from '../supabaseClient.js';

const syncGlobalStateToSupabase = async (globals) => {
    try {
        const dailyQuota = globals.maxSupply / 365;
        const fomoDaysRemaining = Math.max(0, 365 - Math.floor(globals.minted / dailyQuota));
        
        await supabase.from('contadores1').update({
            mdt_circulante: globals.circulating,
            mdt_balance: globals.usdtVault,
            ventas_globales: globals.activeContracts,
            contador_fomo: fomoDaysRemaining
        }).eq('id', 1);
    } catch (e) {
        console.error("Supabase sync failed", e);
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
    if(typeof window !== 'undefined') window.location.href = '/login';
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
  // User Formula: MDT Circulating / USDT Token In Vault
  const currentPrice = state.usdtVault > 0 && state.circulating > 0 
    ? state.circulating / state.usdtVault 
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
  } else {
    // Update current session user only if modifying self
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === user.id) {
      localStorage.setItem('mdt_current_user', JSON.stringify(user));
    }
  }
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
    saveUser(newUser, true); // Save and set as current
    return newUser;
}

export const getReferrerList = (refId) => {
    const users = JSON.parse(localStorage.getItem('mdt_users') || '{}');
    const referrer = Object.values(users).find(u => u.id === refId || u.username === refId);
    
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
    // 1. Genesis Block Logic (Fundador)
    // To set the initial price to $1.00, an injection of 30 USDT should mint 30 MDT.
    const MINT_AMOUNT = 30; // 30 MDT
    const USDT_FUND = 30;   // 30 USDT
    
    globals.minted += MINT_AMOUNT;
    globals.circulating += MINT_AMOUNT;
    globals.usdtVault += USDT_FUND;
    globals.activeContracts = 0; // Starts from absolute zero
    
    setGlobalState(globals);

    user.mdtBalance = (user.mdtBalance || 0) + MINT_AMOUNT;
    user.contractStatus = 'ACTIVE';
    user.daysRemaining = 365;
    user.activeContractSales = 0; // Starts with 0 sales organically

    // Fill the list with the Founder's wallet for all 5 positions
    const newList = [
      { position: 1, user: 'FUNDADOR FUEGO (QUEMA DE TOKEN)', wallet: '0xBURN...0001' },
      { position: 2, user: 'FUNDADOR AIRE (DEFI)', wallet: '0xDEFI...0002' },
      { position: 3, user: 'FUNDADOR BOVEDA (ROCA)', wallet: '0xROCA...0003' },
      { position: 4, user: 'FUNDADOR AGUA (POOL)', wallet: '0xPOOL...0004' },
      { position: 5, user: 'FUNDADOR (MENDIGO)', wallet: user.wallet }
    ];
    user.contractList = newList;
    
    // Explicitly update the user in the database list and set it as the current active session
    users[userId] = user;
    localStorage.setItem('mdt_users', JSON.stringify(users));
    localStorage.setItem('mdt_current_user', JSON.stringify(user));

  } else {
    // Phase 2: Dynamic Value Math for Regular Purchase

    // 1. Calculate the exact real-time price BEFORE adding the new USDT
    // Formula: MDT Circulating / USDT Token In Vault
    const currentPrice = globals.usdtVault > 0 && globals.circulating > 0 
        ? globals.circulating / globals.usdtVault 
        : 1.00; // Fallback to $1.00

    // 2. The user injects exactly 6 USDT.
    const USDT_INJECTED = 6.00;
    
    // 3. How many MDT does 6 USDT buy right now based on the formula?
    // Since Price = MDT / USDT, then MDT to mint = USDT_INJECTED * Price
    // Wait, if Price = Circulating / Vault = 36/36 = 1. Then 6 * 1 = 6 MDT.
    // If Vault = 36, Circulating = 72. Price = 72/36 = 2. MDT to mint for 6 USDT = 6 * 2 = 12 MDT.
    const TOKENS_MINTED = USDT_INJECTED * currentPrice;

    // 4. Update Global Metrics
    globals.minted += TOKENS_MINTED;
    globals.circulating += TOKENS_MINTED;
    globals.usdtVault += USDT_INJECTED;
    
    // 5. Distribution Math based on EXACT USD value equivalent
    // Since Price = MDT/USDT, MDT equivalent = USD value * Price
    const mdtPerUser = 1.00 * currentPrice;  // $1 equivalent per user in the list
    const mdtForDev = 0.50 * currentPrice;   // $0.50 equivalent for dev (Gas, Retornos, Proyectos)
    const mdtForLp = 0.50 * currentPrice;    // $0.50 equivalent for LP

    globals.lpBalance = (globals.lpBalance || 0) + mdtForLp;
    setGlobalState(globals);

    // 6. Time reduction logic
    const timeReductionRatio = TOKENS_MINTED / 182465.75;
    Object.keys(users).forEach(k => {
      users[k].daysRemaining = Math.max(0, users[k].daysRemaining - timeReductionRatio);
    });

    // 7. Pay the list of 5 their commissions
    inheritedList.forEach(pos => {
        const match = Object.values(users).find(u => u.username === pos.user || u.wallet === pos.wallet);
        if(match) {
            match.mdtBalance = (match.mdtBalance || 0) + mdtPerUser;
        }
    });

    // 7.1 Increment the direct referrer's sales counter based entirely on the affiliate link used
    if (user.referrerId) {
        // Fallback checks just in case the referrer is stored by ID, wallet, or username
        let directReferrer = Object.values(users).find(u => 
            u.id === user.referrerId || 
            u.wallet === user.referrerId || 
            u.username === user.referrerId
        );
        
        if (directReferrer) {
            directReferrer.activeContractSales = (directReferrer.activeContractSales || 0) + 1;
            users[directReferrer.id] = directReferrer;
        }
    }

    // 8. Pay the Developer and charge Gas
    // Assuming 'ADMIN_DSF' is the developer's raw ID or we search for the Founder user
    let developer = Object.values(users).find(u => u.email === 'dereckspencer1@gmail.com' || u.email === 'admin@mendigotoken.com' || u.email === 'fundador@mendigotoken.com' || u.username?.toUpperCase() === 'FUNDADOR' || u.username === 'Daniel Spencer (DSF)');
    if (developer) {
        developer.mdtBalance = (developer.mdtBalance || 0) + mdtForDev;
        // Solana Gas Fee Simulation (e.g. 0.005 USDT deducted from dev's wallet per TX)
        // Ensure developer doesn't go negative arbitrarily, though simulated
        developer.usdtBalance = Math.max(0, (developer.usdtBalance || 0) - 0.005); 
        users[developer.id] = developer;
    }

    // 9. Set the purchaser's status
    user.mdtBalance = (user.mdtBalance || 0);
    user.contractStatus = 'ACTIVE';
    user.daysRemaining = 365;
    
    // 10. Shift List (FIFO)
    const newList = [
        { position: 1, user: inheritedList[1]?.user || 'Unknown', wallet: inheritedList[1]?.wallet || '0x...' },
        { position: 2, user: inheritedList[2]?.user || 'Unknown', wallet: inheritedList[2]?.wallet || '0x...' },
        { position: 3, user: inheritedList[3]?.user || 'Unknown', wallet: inheritedList[3]?.wallet || '0x...' },
        { position: 4, user: inheritedList[4]?.user || 'Unknown', wallet: inheritedList[4]?.wallet || '0x...' },
        { position: 5, user: user.username, wallet: user.wallet }
    ];
    user.contractList = newList;
  }

  localStorage.setItem('mdt_users', JSON.stringify(users));
  localStorage.setItem('mdt_current_user', JSON.stringify(user));

  return true;
};

// --- Withdraw / Send ---
export const withdrawMDT = (userId, amount) => {
    let globals = JSON.parse(localStorage.getItem('mdt_global_state'));
    let users = JSON.parse(localStorage.getItem('mdt_users'));
    let user = users[userId];

    if(user.mdtBalance < amount) throw new Error("Insufficient MDT balance");

    // Price = Circulating / Vault
    const currentPrice = globals.usdtVault > 0 && globals.circulating > 0 
        ? globals.circulating / globals.usdtVault 
        : 1.00;
    
    // If we have MDT, and we want USDT: USDT = MDT / Price
    const usdtValueRaw = amount / currentPrice;
    const fee = usdtValueRaw * 0.066;
    const usdtCredit = usdtValueRaw - fee;

    // Simulate burn
    globals.circulating -= amount;
    globals.burned += amount;

    // Deduct the credited USDT from the vault to ensure price goes UP by leaving the fee in the vault
    globals.usdtVault -= usdtCredit;

    user.mdtBalance -= amount;
    user.usdtBalance = (user.usdtBalance || 0) + usdtCredit;

    setGlobalState(globals);
    localStorage.setItem('mdt_users', JSON.stringify(users));
    localStorage.setItem('mdt_current_user', JSON.stringify(user));
    
    // Dispatch event to force React to update the user's live balance
    window.dispatchEvent(new Event('storage'));
    
    return usdtCredit;
};

export const sendMDT = (senderId, receiverEmail, amount) => {
    let users = JSON.parse(localStorage.getItem('mdt_users'));
    let sender = users[senderId];
    let receiver = Object.values(users).find(u => u.email === receiverEmail);

    if(!receiver) throw new Error("Receiver not found");
    if(sender.mdtBalance < amount) throw new Error("Insufficient MDT balance");

    sender.mdtBalance -= amount;
    receiver.mdtBalance = (receiver.mdtBalance || 0) + amount;

    // Simulate transfer Logic
    // If it's the sender's first transfer, trigger the shift list logic (Simulated here as a flag)
    if(!sender.hasDisplaced) {
        sender.hasDisplaced = true;
        // Logic to move DSF to pos 4 and shift is handled inside buyCourse inherently,
        // but can be added here if sending MDT also triggers a network shift for the user.
    }

    localStorage.setItem('mdt_users', JSON.stringify(users));
    localStorage.setItem('mdt_current_user', JSON.stringify(sender));
    
    // Dispatch event to force React to update the user's live balance
    window.dispatchEvent(new Event('storage'));
};

// --- STRESS TEST INJECTION ---
// Simulates 100 near-instantaneous contract purchases to test the dynamic charting, price impact, and frontend performance.
export const runStressTest = () => {
    let globals = JSON.parse(localStorage.getItem('mdt_global_state'));
    if (!globals) return false;

    for(let i=0; i < 100; i++) {
        // Fast hardcoded math to stress the system
        const currentPrice = globals.usdtVault > 0 && globals.circulating > 0 
            ? globals.circulating / globals.usdtVault 
            : 1.00;
        
        const USDT_INJECTED = 6.00;
        const TOKENS_MINTED = USDT_INJECTED * currentPrice;

        globals.minted += TOKENS_MINTED;
        globals.circulating += TOKENS_MINTED;
        globals.usdtVault += USDT_INJECTED;
        
        const mdtForLp = 0.50 * currentPrice;
        globals.lpBalance = (globals.lpBalance || 0) + mdtForLp;
        globals.activeContracts = (globals.activeContracts || 0) + 1; // Increment global contracts
    }

    setGlobalState(globals);
    return true;
};

// --- PROGRESSIVE MATRIX INJECTION ---
// Simulates building the 6x6 matrix where the Founder receives a $1 commission per sale
export const injectMatrixTest = (batchSize, referrerId = null) => {
    let globals = JSON.parse(localStorage.getItem('mdt_global_state'));
    let users = JSON.parse(localStorage.getItem('mdt_users') || '{}');
    
    // Find founder to credit commissions
    let founder = Object.values(users).find(u => u.email === 'dereckspencer1@gmail.com' || u.email === 'admin@mendigotoken.com' || u.email === 'fundador@mendigotoken.com' || u.username?.toUpperCase() === 'FUNDADOR' || u.username === 'Daniel Spencer (DSF)');
    // Identify the direct referrer who triggered the test
    let directReferrer = referrerId ? users[referrerId] : null;

    if (!globals) return false;

    let totalMdtMinted = 0;
    let totalUsdtInjected = 0;
    let totalLpMdt = 0;
    let founderMdtCommission = 0;

    for(let i=0; i < batchSize; i++) {
        const currentPrice = globals.usdtVault > 0 && globals.circulating > 0 
            ? globals.circulating / globals.usdtVault 
            : 1.00;
        
        const USDT_INJECTED = 6.00;
        const TOKENS_MINTED = USDT_INJECTED * currentPrice;

        totalMdtMinted += TOKENS_MINTED;
        totalUsdtInjected += USDT_INJECTED;
        
        // Liquid Pool gets $0.50 equivalent
        totalLpMdt += (0.50 * currentPrice);
        
        // Founder gets exactly $1.00 USD equivalent in MDT per sale (because they are in all 5 levels for this test)
        founderMdtCommission += (1.00 * currentPrice);
        
        // Update per-tick for dynamic pricing in the loop
        globals.circulating += TOKENS_MINTED;
        globals.usdtVault += USDT_INJECTED;
    }

    // Apply exact batch math
    globals.minted += totalMdtMinted;
    // circulating and usdtVault were already updated in the loop to simulate accurate slippage
    globals.lpBalance = (globals.lpBalance || 0) + totalLpMdt;
    globals.activeContracts = (globals.activeContracts || 0) + batchSize; 

    // Credit founder
    if (founder) {
        founder.mdtBalance = (founder.mdtBalance || 0) + founderMdtCommission;
        users[founder.id] = founder;
    }

    // Increment direct sales for the referrer who ran the test
    if (directReferrer) {
        directReferrer.activeContractSales = (directReferrer.activeContractSales || 0) + batchSize;
        users[directReferrer.id] = directReferrer;
    }

    localStorage.setItem('mdt_users', JSON.stringify(users));
    
    // Check if current user needs updating (could be founder or referrer)
    let currentUser = JSON.parse(localStorage.getItem('mdt_current_user'));
    if (currentUser) {
        if (founder && currentUser.id === founder.id) {
            // Also give the founder the direct sales from this simulation so they show up in their dashboard
            founder.activeContractSales = (founder.activeContractSales || 0) + batchSize;
            users[founder.id] = founder;
            localStorage.setItem('mdt_current_user', JSON.stringify(founder));
        } else if (directReferrer && currentUser.id === directReferrer.id) {
            localStorage.setItem('mdt_current_user', JSON.stringify(directReferrer));
        }
    }

    setGlobalState(globals);
    return true;
};
