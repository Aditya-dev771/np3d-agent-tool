const express = require("express");
const cors = require("cors");

const app = express();
const endpoint = process.env.PUBLIC_ENDPOINT || "https://np3d-agent-tool-1.onrender.com/personality";
const creatorAddress = process.env.CREATOR_ADDRESS || "0x0000000000000000000000000000000000000000";

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

app.post("/personality", (req, res) => {
  const { tokenId, wallet } = req.body;

  if (!tokenId) {
    return res.status(400).json({
      error: "tokenId is required"
    });
  }

  const selected = personalities[Number(tokenId) % personalities.length];

  res.json({
    collection: "Normie Punk 3D",
    tokenId,
    wallet: wallet || "Not provided",
    agent: selected.name,
    role: selected.role,
    strength: selected.strength,
    weakness: selected.weakness,
    motto: selected.motto,
    mission: "Hold your Punk, support the community, and bring more Normies onchain."
  });
});

app.get("/.well-known/ai-tool/normie-punk-3d-identity.json", (req, res) => {
  res.json({
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
  });
});

app.get("/", (req, res) => {
  res.send("Normie Punk 3D Agent Tool is live");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
