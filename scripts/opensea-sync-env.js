require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { Wallet } = require("ethers");

const envPath = path.join(process.cwd(), ".env");
const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const lines = existing.split(/\r?\n/).filter((line) => line.length > 0);
const values = new Map();

for (const line of lines) {
  const match = line.match(/^([^=#]+)=(.*)$/);
  if (match) {
    values.set(match[1].trim(), match[2]);
  }
}

const defaults = {
  PUBLIC_ENDPOINT: "https://np3d-agent-tool-1.onrender.com/personality",
  METADATA_URL: "https://np3d-agent-tool-1.onrender.com/.well-known/ai-tool/normie-punk-3d-identity.json",
  RPC_URL: "https://mainnet.base.org",
  ETH_RPC_URL: "https://ethereum-rpc.publicnode.com",
  ETHEREUM_RPC_URL: "https://ethereum-rpc.publicnode.com",
  COLLECTION_CONTRACT_ADDRESS: "0x8f0fEfC6460852866AD978E44D282e687F93650a",
  COLLECTION_INTEL_ENDPOINT: "https://np3d-agent-tool-1.onrender.com/collection-intel",
  COLLECTION_INTEL_METADATA_URL: "https://np3d-agent-tool-1.onrender.com/.well-known/ai-tool/normie-punk-3d-collection-intel.json",
  COLLECTION_INTEL_GATE_TOOL_ONCHAIN_ID: "61",
  NP3D_MAX_SUPPLY: "4444",
  TOOL_CHAIN_ID: "1",
  TOOL_ONCHAIN_ID: "61",
  TOOL_REGISTRY_ADDRESS: "0x265BB2DBFC0A8165C9A1941Eb1372F349baD2cf1"
};

for (const [key, value] of Object.entries(defaults)) {
  values.set(key, value);
}

const privateKey = values.get("PRIVATE_KEY");
if (privateKey) {
  const normalizedPrivateKey = privateKey
    .replace(/^0xPRIVATE_KEY=/, "0x")
    .replace(/^PRIVATE_KEY=/, "");
  values.set("PRIVATE_KEY", normalizedPrivateKey);
}

const zeroAddress = "0x0000000000000000000000000000000000000000";
const creatorAddress = values.get("CREATOR_ADDRESS");
if (
  values.get("PRIVATE_KEY") &&
  (!creatorAddress || creatorAddress.toLowerCase() === zeroAddress)
) {
  try {
    values.set("CREATOR_ADDRESS", new Wallet(values.get("PRIVATE_KEY")).address);
  } catch {
    throw new Error("PRIVATE_KEY is present but is not a valid private key.");
  }
}

const orderedKeys = [
  "PUBLIC_ENDPOINT",
  "METADATA_URL",
  "RPC_URL",
  "ETH_RPC_URL",
  "ETHEREUM_RPC_URL",
  "PRIVATE_KEY",
  "CREATOR_ADDRESS",
  "COLLECTION_CONTRACT_ADDRESS",
  "COLLECTION_INTEL_ENDPOINT",
  "COLLECTION_INTEL_METADATA_URL",
  "COLLECTION_INTEL_TOOL_ONCHAIN_ID",
  "COLLECTION_INTEL_GATE_TOOL_ONCHAIN_ID",
  "NP3D_MAX_SUPPLY",
  "OPENSEA_API_KEY",
  "TOOL_CHAIN_ID",
  "TOOL_ONCHAIN_ID",
  "TOOL_REGISTRY_ADDRESS"
];

const output = [];
for (const key of orderedKeys) {
  if (values.has(key)) {
    output.push(`${key}=${values.get(key)}`);
  }
}

for (const [key, value] of values.entries()) {
  if (!orderedKeys.includes(key)) {
    output.push(`${key}=${value}`);
  }
}

fs.writeFileSync(envPath, `${output.join("\n")}\n`);
console.log("OpenSea registration environment defaults are set.");
