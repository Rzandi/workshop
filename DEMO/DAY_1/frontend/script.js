const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("address");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");
const infoEl = document.getElementById("info");
const nameEl = document.getElementById("name");
const nimEl = document.getElementById("nim");
const NAME = "Muhammad Fikri Rezandi";
const NIM = "231011402149";

// Avalanche Fuji Testnet chainId (hex)
const AVALANCHE_FUJI_CHAIN_ID = "0xa869";

// State untuk tracking koneksi
let isConnected = false;
let currentAddress = null;

// Helper: Shorten address (0x1234...abcd)
function shortenAddress(address) {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatAvaxBalance(balanceWei) {
  const balance = parseInt(balanceWei, 16);
  console.log({ balance });
  return (balance / 1e18).toFixed(4);
}

// Update UI berdasarkan network
async function updateNetworkStatus(chainId) {
  if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
    networkEl.textContent = "Avalanche Fuji Testnet ✅";
    networkEl.style.color = "#4cd137";
    
    // Get balance jika sudah ada address
    if (currentAddress) {
      const balanceWei = await window.ethereum.request({
        method: "eth_getBalance",
        params: [currentAddress, "latest"],
      });
      balanceEl.textContent = formatAvaxBalance(balanceWei);
    }
  } else {
    networkEl.textContent = "Wrong Network ❌";
    networkEl.style.color = "#e84142";
    setStatus("Please switch to Avalanche Fuji", "warning");
    balanceEl.textContent = "-";
  }
}

// Update UI saat address berubah
async function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // User disconnected wallet
    resetUI();
    setStatus("Wallet Disconnected ⚠️", "warning");
  } else if (accounts[0] !== currentAddress) {
    // Address berubah
    currentAddress = accounts[0];
    addressEl.textContent = shortenAddress(currentAddress);
    console.log("Account changed:", currentAddress);
    
    // Update balance
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    await updateNetworkStatus(chainId);
  }
}

// Handle network change
async function handleChainChanged(chainId) {
  console.log("Network changed:", chainId);
  await updateNetworkStatus(chainId);
  
  if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
    setStatus("Connected ✅", "connected");
  }
}

// Helper: Set status with badge styling
function setStatus(text, type = "") {
  statusEl.textContent = text;
  statusEl.className = type; // connected, warning, error, or empty
  
  // Also set color for backwards compatibility
  if (type === "connected") {
    statusEl.style.color = "#4cd137";
  } else if (type === "warning") {
    statusEl.style.color = "#fbc531";
  } else if (type === "error") {
    statusEl.style.color = "#e84142";
  } else {
    statusEl.style.color = "";
  }
}

// Reset UI ke state awal
function resetUI() {
  isConnected = false;
  currentAddress = null;
  connectBtn.disabled = false;
  connectBtn.textContent = "Connect Wallet";
  connectBtn.style.opacity = "1";
  connectBtn.style.display = "block";
  disconnectBtn.style.display = "none";
  addressEl.textContent = "-";
  networkEl.textContent = "-";
  networkEl.style.color = "";
  balanceEl.textContent = "-";
  infoEl.style.display = "none";
  setStatus("Not Connected", "");
}

// Disconnect wallet
function disconnectWallet() {
  console.log("Disconnecting wallet...");
  resetUI();
  setStatus("Disconnected ✅", "connected");
  
  // Reset status after 2 seconds
  setTimeout(() => {
    setStatus("Not Connected", "");
  }, 2000);
}

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("Core Wallet tidak terdeteksi. Silakan install Core Wallet.");
    return;
  }

  console.log("window.ethereum", window.ethereum);

  try {
    setStatus("Connecting...", "warning");

    // Request wallet accounts
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    currentAddress = accounts[0];
    addressEl.textContent = shortenAddress(currentAddress);

    console.log({ address: currentAddress });

    // Get chainId
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    console.log({ chainId });

    if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
      networkEl.textContent = "Avalanche Fuji Testnet ✅";
      networkEl.style.color = "#4cd137";
      setStatus("Connected ✅", "connected");

      // Get AVAX balance
      const balanceWei = await window.ethereum.request({
        method: "eth_getBalance",
        params: [currentAddress, "latest"],
      });

      console.log({ balanceWei });

      balanceEl.textContent = formatAvaxBalance(balanceWei);
      
      // Show participant info
      infoEl.style.display = "block";
      nameEl.textContent = NAME;
      nimEl.textContent = NIM;
      
      // Mark as connected
      isConnected = true;
      
      // Hide connect button, show disconnect button
      connectBtn.style.display = "none";
      disconnectBtn.style.display = "block";
      
    } else {
      networkEl.textContent = "Wrong Network ❌";
      networkEl.style.color = "#e84142";
      setStatus("Please switch to Avalanche Fuji", "warning");
      balanceEl.textContent = "-";
      
      // Still show info even on wrong network
      infoEl.style.display = "block";
      nameEl.textContent = NAME;
      nimEl.textContent = NIM;
    }
  } catch (error) {
    console.error(error);
    
    // Better error handling
    if (error.code === 4001) {
      setStatus("Connection Rejected ❌", "error");
    } else if (error.code === -32002) {
      setStatus("Request Pending... Check Wallet", "warning");
    } else {
      setStatus("Connection Failed ❌", "error");
    }
  }
}

// Event listeners
connectBtn.addEventListener("click", connectWallet);
disconnectBtn.addEventListener("click", disconnectWallet);

// Listen for account changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", handleAccountsChanged);
  window.ethereum.on("chainChanged", handleChainChanged);
}

// Initialize: Check connection state on page load
async function init() {
  // Reset UI first
  resetUI();
  
  // Check if wallet is available and already connected
  if (typeof window.ethereum !== "undefined") {
    try {
      // Use eth_accounts (not eth_requestAccounts) to check without prompting
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      
      if (accounts.length > 0) {
        // Already connected, restore state
        currentAddress = accounts[0];
        addressEl.textContent = shortenAddress(currentAddress);
        
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        
        if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
          networkEl.textContent = "Avalanche Fuji Testnet ✅";
          networkEl.style.color = "#4cd137";
          setStatus("Connected ✅", "connected");
          
          const balanceWei = await window.ethereum.request({
            method: "eth_getBalance",
            params: [currentAddress, "latest"],
          });
          balanceEl.textContent = formatAvaxBalance(balanceWei);
          
          infoEl.style.display = "block";
          nameEl.textContent = NAME;
          nimEl.textContent = NIM;
          
          isConnected = true;
          connectBtn.style.display = "none";
          disconnectBtn.style.display = "block";
        } else {
          networkEl.textContent = "Wrong Network ❌";
          networkEl.style.color = "#e84142";
          setStatus("Please switch to Avalanche Fuji", "warning");
        }
      }
    } catch (error) {
      console.error("Init error:", error);
    }
  }
}

// Run init on page load
init();