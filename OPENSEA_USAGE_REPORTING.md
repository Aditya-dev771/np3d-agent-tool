# OpenSea Usage Reporting

The `/personality` endpoint now uses `@opensea/tool-sdk` for:

- NFT-gated access via `predicateGate`
- 402 challenge responses when `X-Payment` is missing
- EIP-3009 zero-value authorization verification
- server-side usage reporting to OpenSea after successful calls

The server does not sign for users. The caller signs the `X-Payment` authorization, and the SDK forwards that caller authorization in the usage report.

## Environment

```text
OPENSEA_API_KEY=
TOOL_CHAIN_ID=1
TOOL_ONCHAIN_ID=61
TOOL_REGISTRY_ADDRESS=0x265BB2DBFC0A8165C9A1941Eb1372F349baD2cf1
ETHEREUM_RPC_URL=https://ethereum-rpc.publicnode.com
CREATOR_ADDRESS=0x737dc69f85844da1145303f0b85b285ba9674d83
```

`CREATOR_ADDRESS` is used as the operator address in the 402 challenge. `ETHEREUM_RPC_URL` is used by the predicate gate to read Ethereum mainnet registry/access state.
