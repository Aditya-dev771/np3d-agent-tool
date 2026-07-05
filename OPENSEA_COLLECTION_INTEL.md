# Normie Punk 3D Intel

Second OpenSea Agent Tool for collection-level analytics.

## Endpoint

```text
POST https://np3d-agent-tool-1.onrender.com/collection-intel
```

Optional JSON input:

```json
{
  "wallet": "0x...",
  "includeMarket": true,
  "includeMint": true
}
```

## Manifest

```text
https://np3d-agent-tool-1.onrender.com/.well-known/ai-tool/normie-punk-3d-collection-intel.json
```

## Data Sources

- Minted supply: read live from the Ethereum NFT contract with `totalSupply()`.
- Max supply: tries contract methods first, then uses project config `NP3D_MAX_SUPPLY=4444`.
- Market data: fetched from the official OpenSea API only when `OPENSEA_API_KEY` is configured.
- If OpenSea market data fails or is unavailable, the endpoint returns `marketDataAvailable: false`.

## Registration

```bash
npm run opensea:verify:collection-intel
npm run opensea:register:collection-intel:dry-run
```

Do not run the final registration until live deployment and dry-run both pass.

After the new tool is registered, set:

```text
COLLECTION_INTEL_TOOL_ONCHAIN_ID=<new tool id>
COLLECTION_INTEL_GATE_TOOL_ONCHAIN_ID=<new tool id>
```

Then deploy again so usage reporting and gating point at the new tool instead of the temporary gate fallback.
