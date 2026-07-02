# OpenSea Tool SDK Registration

This project is now set up for ERC-8257 registration on Base with NFT-gated access.

## Manifest URL

The server exposes the tool manifest at:

```text
https://np3d-agent-tool-1.onrender.com/.well-known/ai-tool/normie-punk-3d-identity.json
```

The tool endpoint remains:

```text
https://np3d-agent-tool-1.onrender.com/personality
```

## Required Environment

Create `.env` from `.env.example` and fill:

- `PRIVATE_KEY`: wallet used to register the tool
- `CREATOR_ADDRESS`: wallet address matching the registering wallet
- `RPC_URL`: Base RPC URL
- `COLLECTION_CONTRACT_ADDRESS`: Normie Punk 3D collection contract on Base, `0x8f0fEfC6460852866AD978E44D282e687F93650a`
- `METADATA_URL`: public manifest URL

The OpenSea SDK register command uses the default Base ToolRegistry for `--network base`; no `OPENSEA_TOOL_REGISTRY_ADDRESS` is required.

## Commands

```bash
npm install
npm run opensea:sync-env
npm run opensea:verify
npm run opensea:register:dry-run
npm run opensea:register
```

The registration command maps to:

```bash
npx @opensea/tool-sdk register \
  --metadata "$METADATA_URL" \
  --network base \
  --nft-gate "$COLLECTION_CONTRACT_ADDRESS"
```
