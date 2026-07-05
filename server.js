require("dotenv").config({ override: true });

const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
const endpoint = process.env.PUBLIC_ENDPOINT || "https://np3d-agent-tool-1.onrender.com/personality";
const creatorAddress = (
  process.env.CREATOR_ADDRESS || "0x0000000000000000000000000000000000000000"
).toLowerCase();
const collectionIntelCreatorAddress = (
  process.env.COLLECTION_INTEL_CREATOR_ADDRESS || "0x737dc69f85844da1145303f0b85b285ba9674d83"
).toLowerCase();
const toolChainId = Number(process.env.TOOL_CHAIN_ID || "1");
const toolOnchainId = Number(process.env.TOOL_ONCHAIN_ID || "61");
const toolRegistryAddress =
  process.env.TOOL_REGISTRY_ADDRESS || "0x265BB2DBFC0A8165C9A1941Eb1372F349baD2cf1";
const ethereumRpcUrl =
  process.env.ETH_RPC_URL ||
  process.env.ETHEREUM_RPC_URL ||
  process.env.MAINNET_RPC_URL ||
  "https://ethereum-rpc.publicnode.com";
const openseaApiKey = process.env.OPENSEA_API_KEY?.trim();
const collectionIntelEndpoint =
  process.env.COLLECTION_INTEL_ENDPOINT ||
  "https://np3d-agent-tool-1.onrender.com/collection-intel";
const collectionContract =
  process.env.COLLECTION_CONTRACT_ADDRESS || "0x8f0fEfC6460852866AD978E44D282e687F93650a";
const collectionMaxSupply = Number(process.env.NP3D_MAX_SUPPLY || "4444");
const collectionIntelGateToolOnchainId =
  process.env.COLLECTION_INTEL_GATE_TOOL_ONCHAIN_ID ||
  process.env.COLLECTION_INTEL_TOOL_ONCHAIN_ID ||
  process.env.TOOL_ONCHAIN_ID ||
  "61";
const collectionIntelToolOnchainId = process.env.COLLECTION_INTEL_TOOL_ONCHAIN_ID;
const requestTimeoutMs = Number(process.env.EXTERNAL_REQUEST_TIMEOUT_MS || "5000");

app.use(cors());
app.use(express.json());

const personalities = [
  {
    name: "Shadow Normie",
    role: "Underground Rebel",
    strength: "Silent conviction",
    weakness: "Trusts slowly",
    motto: "Still here. Still watching. Still early."
  },
  {
    name: "Alpha Normie",
    role: "Community Leader",
    strength: "Strong presence",
    weakness: "Too much responsibility",
    motto: "Lead the Normies."
  },
  {
    name: "Chaos Normie",
    role: "Timeline Disruptor",
    strength: "Unpredictable energy",
    weakness: "Never follows the plan",
    motto: "Break the boring."
  }
];

const collectionContractAbi = [
  "function totalSupply() view returns (uint256)",
  "function maxSupply() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function maxTokens() view returns (uint256)",
  "function MAX_TOKENS() view returns (uint256)",
  "function collectionSize() view returns (uint256)"
];

const manifest = {
  type: "https://ercs.ethereum.org/ERCS/erc-8257#tool-manifest-v1",
  name: "Normie Punk 3D Identity",
  description: "Returns personality, identity, mission and holder status for any Normie Punk 3D token.",
  endpoint,
  inputs: {
    type: "object",
    properties: {
      tokenId: {
        type: "string",
        description: "Normie Punk 3D token ID"
      },
      wallet: {
        type: "string",
        description: "Optional wallet address used to check holder status"
      }
    },
    required: ["tokenId"],
    additionalProperties: false
  },
  outputs: {
    type: "object",
    properties: {
      collection: { type: "string" },
      tokenId: { type: "string" },
      wallet: { type: "string" },
      agent: { type: "string" },
      role: { type: "string" },
      strength: { type: "string" },
      weakness: { type: "string" },
      motto: { type: "string" },
      mission: { type: "string" }
    },
    additionalProperties: true
  },
  creatorAddress,
  "com.normiepunk3d.chain": {
    name: "Base",
    chainId: 8453
  },
  "com.normiepunk3d.access": "nft-gated",
  "com.normiepunk3d.collection": "Normie Punk 3D",
  tags: ["nft", "ai", "agents", "normiepunk3d", "identity"]
};

const collectionIntelManifest = {
  type: "https://ercs.ethereum.org/ERCS/erc-8257#tool-manifest-v1",
  name: "Normie Punk 3D Intel",
  description:
    "Returns live collection intelligence, mint progress, market status, and collector insights for Normie Punk 3D.",
  endpoint: collectionIntelEndpoint,
  inputs: {
    type: "object",
    properties: {
      wallet: {
        type: "string",
        description: "Optional wallet address for collector-specific context"
      },
      includeMarket: {
        type: "boolean",
        description: "Whether to include OpenSea market data when available"
      },
      includeMint: {
        type: "boolean",
        description: "Whether to include mint and supply data"
      }
    },
    additionalProperties: false
  },
  outputs: {
    type: "object",
    properties: {
      collection: { type: "string" },
      chain: { type: "string" },
      contract: { type: "string" },
      status: { type: "string" },
      minted: { type: "number" },
      supply: { type: "number" },
      mintProgress: { type: "string" },
      marketDataAvailable: { type: "boolean" },
      floorPrice: { type: "string" },
      topOffer: { type: "string" },
      totalVolume: { type: "string" },
      summary: { type: "string" },
      collectorSignal: { type: "string" }
    },
    additionalProperties: true
  },
  creatorAddress: collectionIntelCreatorAddress,
  access: {
    logic: "OR",
    requirements: [
      {
        kind: "0xbdf8c428",
        data: "0x0000000000000000000000008f0fefc6460852866ad978e44d282e687f93650a",
        label: "Hold any NFT from this collection",
        links: {
          opensea: "https://opensea.io/assets/ethereum/0x8f0fEfC6460852866AD978E44D282e687F93650a"
        }
      }
    ]
  },
  "com.normiepunk3d.chain": {
    name: "Ethereum",
    chainId: 1
  },
  "com.normiepunk3d.access": "nft-gated",
  "com.normiepunk3d.collection": "Normie Punk 3D",
  tags: ["nft", "ai", "agents", "analytics", "normiepunk3d", "collection"]
};

function jsonSchema(schema) {
  return {
    safeParse(value) {
      const errors = [];

      if (!value || typeof value !== "object" || Array.isArray(value)) {
        errors.push({ path: [], message: "Expected object" });
      } else if (schema.required) {
        for (const key of schema.required) {
          if (value[key] === undefined || value[key] === null || value[key] === "") {
            errors.push({ path: [key], message: `${key} is required` });
          }
        }
      }

      if (errors.length > 0) {
        return { success: false, error: { issues: errors } };
      }

      return { success: true, data: value };
    }
  };
}

function withTimeout(promise, timeoutMs, label) {
  let timeout;
  const timer = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
  });

  return Promise.race([promise, timer]).finally(() => clearTimeout(timeout));
}

async function fetchJsonWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function readContractInt(contract, method) {
  try {
    const value = await withTimeout(contract[method](), requestTimeoutMs, method);
    return Number(value);
  } catch {
    return null;
  }
}

async function getMintData() {
  const provider = new ethers.JsonRpcProvider(ethereumRpcUrl);
  const contract = new ethers.Contract(collectionContract, collectionContractAbi, provider);
  const minted = await readContractInt(contract, "totalSupply");
  let supplySource = "project-config";
  let supply = null;

  for (const method of ["maxSupply", "MAX_SUPPLY", "maxTokens", "MAX_TOKENS", "collectionSize"]) {
    supply = await readContractInt(contract, method);
    if (supply) {
      supplySource = `contract.${method}`;
      break;
    }
  }

  if (!supply && Number.isFinite(collectionMaxSupply) && collectionMaxSupply > 0) {
    supply = collectionMaxSupply;
  }

  const mintProgress =
    minted !== null && supply
      ? `${((minted / supply) * 100).toFixed(2)}%`
      : null;

  return {
    minted,
    supply,
    supplySource,
    mintProgress
  };
}

function formatEth(value, symbol) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return undefined;
  }

  return `${numberValue} ${symbol}`;
}

async function getOpenSeaMarketData() {
  if (!openseaApiKey) {
    return { marketDataAvailable: false };
  }

  const headers = {
    accept: "application/json",
    "x-api-key": openseaApiKey
  };

  try {
    const contractData = await fetchJsonWithTimeout(
      `https://api.opensea.io/api/v2/chain/ethereum/contract/${collectionContract}`,
      { headers }
    );
    const collectionSlug =
      contractData.collection ||
      contractData.collection_slug ||
      contractData.collection?.slug ||
      contractData.collection?.collection;

    if (!collectionSlug || typeof collectionSlug !== "string") {
      return { marketDataAvailable: false };
    }

    const statsData = await fetchJsonWithTimeout(
      `https://api.opensea.io/api/v2/collections/${collectionSlug}/stats`,
      { headers }
    );
    const stats = statsData.total || statsData.stats || statsData;

    const floorPrice =
      formatEth(stats.floor_price, "ETH") ||
      formatEth(stats.floorPrice, "ETH");
    const topOffer =
      formatEth(stats.best_offer, "WETH") ||
      formatEth(stats.top_offer, "WETH") ||
      formatEth(stats.topOffer, "WETH");
    const totalVolume =
      formatEth(stats.volume, "ETH") ||
      formatEth(stats.total_volume, "ETH") ||
      formatEth(stats.totalVolume, "ETH");

    return {
      marketDataAvailable: Boolean(floorPrice || topOffer || totalVolume),
      collectionSlug,
      floorPrice,
      topOffer,
      totalVolume
    };
  } catch (error) {
    console.warn("OpenSea market data unavailable:", error.message);
    return { marketDataAvailable: false };
  }
}

async function buildCollectionIntel(input) {
  const includeMint = input.includeMint !== false;
  const includeMarket = input.includeMarket !== false;
  const [mintData, marketData] = await Promise.all([
    includeMint ? getMintData() : Promise.resolve({ minted: null, supply: null, mintProgress: null }),
    includeMarket ? getOpenSeaMarketData() : Promise.resolve({ marketDataAvailable: false })
  ]);

  const minted = mintData.minted;
  const supply = mintData.supply;
  const status = minted !== null && supply && minted >= supply ? "Minted out" : "Minting";
  const summary =
    minted !== null && supply
      ? `Normie Punk 3D is currently ${status.toLowerCase()} with ${minted} minted out of ${supply} supply.`
      : "Normie Punk 3D collection intelligence is available, but mint progress could not be read from the contract right now.";

  return {
    collection: "Normie Punk 3D",
    chain: "Ethereum",
    contract: collectionContract,
    status,
    minted,
    supply,
    mintProgress: mintData.mintProgress,
    supplySource: mintData.supplySource,
    ...marketData,
    summary,
    collectorSignal: "Early collection stage with active minting and onchain agent tooling."
  };
}

async function installOpenSeaToolRoute() {
  const { createToolHandler, predicateGate, toExpressHandler } = await import("@opensea/tool-sdk");
  const { mainnet } = await import("viem/chains");
  const usageReporting = openseaApiKey
    ? {
        chainId: toolChainId,
        toolChainId,
        toolRegistryAddress,
        toolOnchainId,
        apiKey: openseaApiKey
      }
    : undefined;

  if (!usageReporting) {
    console.warn("OPENSEA_API_KEY is not set; OpenSea usage reporting is disabled.");
  }

  const toolHandler = createToolHandler({
    manifest,
    inputSchema: jsonSchema({ required: ["tokenId"] }),
    outputSchema: jsonSchema({ required: ["collection", "tokenId", "agent", "mission"] }),
    gates: [
      predicateGate({
        toolId: BigInt(toolOnchainId),
        chain: mainnet,
        rpcUrl: ethereumRpcUrl,
        registryAddress: toolRegistryAddress,
        operatorAddress: creatorAddress
      })
    ],
    usageReporting,
    handler: async (input, ctx) => {
      const selected = personalities[Number(input.tokenId) % personalities.length];
      const verifiedWallet = ctx.agentAddress || ctx.callerAddress || input.wallet || "Not provided";

      return {
        collection: "Normie Punk 3D",
        tokenId: input.tokenId,
        wallet: verifiedWallet,
        holderStatus: true,
        agent: selected.name,
        role: selected.role,
        strength: selected.strength,
        weakness: selected.weakness,
        motto: selected.motto,
        mission: "Hold your Punk, support the community, and bring more Normies onchain."
      };
    }
  });

  app.post("/personality", toExpressHandler(toolHandler));

  const collectionIntelUsageReporting =
    openseaApiKey && collectionIntelToolOnchainId
      ? {
          chainId: toolChainId,
          toolChainId,
          toolRegistryAddress,
          toolOnchainId: Number(collectionIntelToolOnchainId),
          apiKey: openseaApiKey
        }
      : undefined;

  if (openseaApiKey && !collectionIntelToolOnchainId) {
    console.warn(
      "COLLECTION_INTEL_TOOL_ONCHAIN_ID is not set; collection-intel usage reporting is disabled until the tool is registered."
    );
  }

  const collectionIntelHandler = createToolHandler({
    manifest: collectionIntelManifest,
    inputSchema: jsonSchema({}),
    outputSchema: jsonSchema({ required: ["collection", "chain", "contract", "status", "summary"] }),
    gates: [
      predicateGate({
        toolId: BigInt(collectionIntelGateToolOnchainId),
        chain: mainnet,
        rpcUrl: ethereumRpcUrl,
        registryAddress: toolRegistryAddress,
        operatorAddress: collectionIntelCreatorAddress
      })
    ],
    usageReporting: collectionIntelUsageReporting,
    handler: async (input) => buildCollectionIntel(input)
  });

  app.post("/collection-intel", toExpressHandler(collectionIntelHandler));
}

app.get("/.well-known/ai-tool/normie-punk-3d-identity.json", (req, res) => {
  res.json(manifest);
});

app.get("/.well-known/ai-tool/normie-punk-3d-collection-intel.json", (req, res) => {
  res.json(collectionIntelManifest);
});

app.get("/", (req, res) => {
  res.send("Normie Punk 3D Agent Tool is live");
});

const PORT = process.env.PORT || 3000;

installOpenSeaToolRoute()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start OpenSea tool route:", error);
    process.exit(1);
  });
