import axios from "axios";
import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { WalletConnectModule } from "@creit.tech/stellar-wallets-kit/modules/wallet-connect";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";

let isKitInitialized = false;
let initializedKitNetwork: string | null = null;

/**
 * Initialize the Stellar Wallets Kit with standard desktop extensions & mobile WalletConnect.
 * Re-initializes whenever the requested network differs from the currently configured one,
 * so switching between Testnet/Mainnet actually takes effect.
 */
export function initStellarKit(network: string = "TESTNET") {
  if (typeof window === "undefined") return;

  const normalized = network.toUpperCase();
  const isMainnet = normalized === "PUBLIC" || normalized === "MAINNET";
  const targetNetwork = isMainnet ? Networks.PUBLIC : Networks.TESTNET;

  if (isKitInitialized && initializedKitNetwork === targetNetwork) return;

  StellarWalletsKit.init({
    network: targetNetwork,
    modules: [
      ...defaultModules(),
      new WalletConnectModule({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "ebc60ac6354d3f67a3cffe0b4873d856",
        metadata: {
          name: "Forecast Earn",
          description: "Yield Vaults Integration",
          url: typeof window !== "undefined" ? window.location.origin : "",
          icons: [typeof window !== "undefined" ? window.location.origin + "/favicon.ico" : ""],
        },
      }),
    ],
  });

  isKitInitialized = true;
  initializedKitNetwork = targetNetwork;
}

/**
 * Connect user wallet using Stellar Wallets Kit's built-in authModal.
 * Returns public key address string or null.
 */
export async function connectStellarWallet(network: string = "TESTNET"): Promise<string | null> {
  try {
    initStellarKit(network);
    const result = await StellarWalletsKit.authModal();
    if (result && result.address) {
      return result.address;
    }
    return null;
  } catch (error) {
    console.error("Stellar wallet connection failed:", error);
    return null;
  }
}

/**
 * Cleanly disconnect the wallet session.
 */
export async function disconnectStellarWallet(): Promise<void> {
  try {
    if (typeof window !== "undefined") {
      initStellarKit();
      await StellarWalletsKit.disconnect();
    }
  } catch (error) {
    console.error("Failed to disconnect wallet:", error);
  }
}

/**
 * Request user to sign an unsigned Soroban XDR using Stellar Wallets Kit.
 */
export async function signSorobanXdr(
  unsignedXdr: string,
  callerAddress: string,
  network: string = "TESTNET"
): Promise<string | null> {
  initStellarKit(network);
  try {
    const isTestnet = network.toUpperCase() === "TESTNET";
    const result = await StellarWalletsKit.signTransaction(unsignedXdr, {
      address: callerAddress,
      networkPassphrase: isTestnet ? Networks.TESTNET : Networks.PUBLIC,
    });

    if (typeof result === "string") {
      return result;
    }

    if (result && typeof result === "object" && "signedTxXdr" in result) {
      return (result as any).signedTxXdr;
    }

    return result as any;
  } catch (error) {
    console.error("Transaction signing failed:", error);
    return null;
  }
}


/**
 * Fetch Stellar account balance for XLM and USDC from Horizon API
 */
export async function getStellarAccountBalance(address: string, network: string = "TESTNET"): Promise<{ xlm: number; usdc: number }> {
  const isTestnet = network.toUpperCase() === "TESTNET";
  const url = isTestnet
    ? `https://horizon-testnet.stellar.org/accounts/${address}`
    : `https://horizon.stellar.org/accounts/${address}`;

  try {
    const res = await axios.get(url);
    let xlm = 0;
    let usdc = 0;
    if (res.data && res.data.balances) {
      for (const bal of res.data.balances) {
        if (bal.asset_type === "native") {
          xlm = parseFloat(bal.balance);
        } else if (bal.asset_code === "USDC") {
          usdc = parseFloat(bal.balance);
        }
      }
    }
    return { xlm, usdc };
  } catch (error) {
    console.warn("Could not fetch Stellar account balance from Horizon:", error);
    return { xlm: 0, usdc: 0 };
  }
}

/**
 * Get stored authentication headers for API requests
 */
function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Prepare unsigned deposit XDR via backend proxy
 */
export async function prepareDepositXdr(vaultAddress: string, amount: number, callerAddress: string) {
  const res = await axios.post(
    `${API_BASE_URL}/vaults/deposit/prepare`,
    {
      vault_address: vaultAddress,
      amount,
      caller_address: callerAddress,
    },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

/**
 * Submit signed XDR via backend proxy
 */
export async function submitSignedXdr(vaultAddress: string, signedXdr: string) {
  const res = await axios.post(
    `${API_BASE_URL}/vaults/deposit/submit`,
    {
      vault_address: vaultAddress,
      signed_xdr: signedXdr,
    },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

/**
 * Fetch user balance and shares in a specific vault
 */
export async function getVaultBalance(vaultAddress: string, callerAddress: string) {
  const res = await axios.get(
    `${API_BASE_URL}/vaults/${vaultAddress}/balance?caller_address=${callerAddress}`,
    { headers: getAuthHeaders() }
  );
  return res.data;
}

/**
 * Prepare unsigned withdraw XDR via backend proxy
 */
export async function prepareWithdrawXdr(vaultAddress: string, amount: number, callerAddress: string) {
  const res = await axios.post(
    `${API_BASE_URL}/vaults/withdraw/prepare`,
    {
      vault_address: vaultAddress,
      amount,
      caller_address: callerAddress,
    },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

/**
 * Submit signed withdraw XDR via backend proxy
 */
export async function submitWithdrawSignedXdr(vaultAddress: string, signedXdr: string) {
  const res = await axios.post(
    `${API_BASE_URL}/vaults/withdraw/submit`,
    {
      vault_address: vaultAddress,
      signed_xdr: signedXdr,
    },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

/**
 * Prepare unsigned rebalance XDR via backend proxy (Admin-only)
 */
export async function prepareRebalanceXdr(vaultAddress: string, callerAddress: string, instructions: any[]) {
  const res = await axios.post(
    `${API_BASE_URL}/vaults/rebalance/prepare`,
    {
      vault_address: vaultAddress,
      caller_address: callerAddress,
      instructions,
    },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

/**
 * Prepare unsigned rescue XDR via backend proxy (Admin-only)
 */
export async function prepareRescueXdr(vaultAddress: string, callerAddress: string, strategyAddress: string) {
  const res = await axios.post(
    `${API_BASE_URL}/vaults/rescue/prepare`,
    {
      vault_address: vaultAddress,
      caller_address: callerAddress,
      strategy_address: strategyAddress,
    },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

/**
 * Prepare unsigned pause strategy XDR via backend proxy (Admin-only)
 */
export async function preparePauseStrategyXdr(vaultAddress: string, callerAddress: string, strategyAddress: string) {
  const res = await axios.post(
    `${API_BASE_URL}/vaults/pause-strategy/prepare`,
    {
      vault_address: vaultAddress,
      caller_address: callerAddress,
      strategy_address: strategyAddress,
    },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

/**
 * Prepare unsigned unpause strategy XDR via backend proxy (Admin-only)
 */
export async function prepareUnpauseStrategyXdr(vaultAddress: string, callerAddress: string, strategyAddress: string) {
  const res = await axios.post(
    `${API_BASE_URL}/vaults/unpause-strategy/prepare`,
    {
      vault_address: vaultAddress,
      caller_address: callerAddress,
      strategy_address: strategyAddress,
    },
    { headers: getAuthHeaders() }
  );
  return res.data;
}

/**
 * Prepare unsigned upgrade XDR via backend proxy (Admin-only)
 */
export async function prepareUpgradeXdr(vaultAddress: string, callerAddress: string, newWasmHash: string) {
  const res = await axios.post(
    `${API_BASE_URL}/vaults/upgrade/prepare`,
    {
      vault_address: vaultAddress,
      caller_address: callerAddress,
      new_wasm_hash: newWasmHash,
    },
    { headers: getAuthHeaders() }
  );
  return res.data;
}
