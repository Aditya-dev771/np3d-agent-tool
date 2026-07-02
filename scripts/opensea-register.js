require("dotenv").config();
const { runToolSdk } = require("./run-tool-sdk");

const metadataUrl =
  process.env.METADATA_URL ||
  "https://np3d-agent-tool-1.onrender.com/.well-known/ai-tool/normie-punk-3d-identity.json";

const required = [
  "RPC_URL",
  "PRIVATE_KEY",
  "COLLECTION_CONTRACT_ADDRESS"
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const args = [
  "register",
  "--metadata",
  metadataUrl,
  "--network",
  "base",
  "--nft-gate",
  process.env.COLLECTION_CONTRACT_ADDRESS
];

if (process.argv.includes("--dry-run")) {
  args.push("--dry-run");
}

if (process.argv.includes("--yes") || process.argv.includes("-y")) {
  args.push("--yes");
}

console.log("Registering Normie Punk 3D Identity with OpenSea Tool SDK on Base...");
console.log(`Metadata: ${metadataUrl}`);
console.log(`NFT gate: ${process.env.COLLECTION_CONTRACT_ADDRESS}`);

process.exit(runToolSdk(args));
