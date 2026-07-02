const express = require("express");
const cors = require("cors");

const app = express();

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

app.get("/", (req, res) => {
  res.send("Normie Punk 3D Agent Tool is live");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});