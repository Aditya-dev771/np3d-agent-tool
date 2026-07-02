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
  COLLECTION_CONTRACT_ADDRESS: "0x8f0fEfC6460852866AD978E44D282e687F93650a"
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

if (values.get("PRIVATE_KEY") && !values.get("CREATOR_ADDRESS")) {
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
  "PRIVATE_KEY",
  "CREATOR_ADDRESS",
  "COLLECTION_CONTRACT_ADDRESS"
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
