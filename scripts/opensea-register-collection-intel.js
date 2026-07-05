require("dotenv").config();
const { runToolSdk } = require("./run-tool-sdk");

const metadataUrl =
  process.env.COLLECTION_INTEL_METADATA_URL ||
  "https://np3d-agent-tool-1.onrender.com/.well-known/ai-tool/normie-punk-3d-collection-intel.json";
const ethereumRpcUrl =
  process.env.ETH_RPC_URL ||
  process.env.ETHEREUM_RPC_URL ||
  process.env.MAINNET_RPC_URL ||
  "https://ethereum-rpc.publicnode.com";

process.env.RPC_URL = ethereumRpcUrl;

const required = ["PRIVATE_KEY", "COLLECTION_CONTRACT_ADDRESS"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const args = [
  "register",
  "--metadata",
  metadataUrl,
  "--network",
  "mainnet",
  "--nft-gate",
  process.env.COLLECTION_CONTRACT_ADDRESS,
  "--rpc-url",
  ethereumRpcUrl
];

if (process.argv.includes("--dry-run")) {
  args.push("--dry-run");
}

if (process.argv.includes("--yes") || process.argv.includes("-y")) {
  args.push("--yes");
}

console.log("Registering Normie Punk 3D Intel with OpenSea Tool SDK on Ethereum mainnet...");
console.log(`Metadata: ${metadataUrl}`);
console.log(`NFT gate: ${process.env.COLLECTION_CONTRACT_ADDRESS}`);

process.exit(runToolSdk(args));
